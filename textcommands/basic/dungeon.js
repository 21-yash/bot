const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const Player = require('../../models/Player');
const Pet = require('../../models/Pet');
const { createErrorEmbed, createSuccessEmbed, createWarningEmbed, createCustomEmbed, createInfoEmbed } = require('../../utils/embed');
const allDungeons = require('../../gamedata/dungeons');
const allItems = require('../../gamedata/items');
const { generateEnemy, simulateBattle, generateDungeonRewards } = require('../../utils/combat');
const { grantPalXp } = require('../../utils/leveling');

module.exports = {
    name: 'dungeon',
    description: 'Embark on an expedition into a dangerous dungeon with one of your Pals.',
    usage: 'start <dungeon name>',
    async execute(message, args, client, prefix) {
        if (args[0]?.toLowerCase() !== 'start' || !args[1]) {
            return message.reply({ embeds: [createWarningEmbed('Invalid Usage', `Please specify a dungeon to start. Usage: \`${prefix}dungeon start <dungeon name>\``)] });
        }

        try {
            const player = await Player.findOne({ userId: message.author.id });
            if (!player) {
                return message.reply({ embeds: [createWarningEmbed('No Adventure Started', `You haven't started your journey yet! Use \`${prefix}start\` to begin.`)] });
            }

            // Check if player is already in a dungeon
            if (client.dungeonSessions.has(message.author.id)) {
                return message.reply({ embeds: [createWarningEmbed('Already in a Dungeon', 'You are already on an expedition! You cannot start another.')] });
            }

            const dungeonId = args.slice(1).join('_').toLowerCase();
            const dungeon = allDungeons[dungeonId];

            if (!dungeon) {
                return message.reply({ embeds: [createWarningEmbed('Dungeon Not Found', `That dungeon does not exist. Use \`${prefix}alldungeons\` to see available locations.`)] });
            }
            
            // --- Initial Confirmation ---
            const confirmationEmbed = createInfoEmbed(
                `Enter ${dungeon.name}?`,
                `**Tier:** ${dungeon.tier} | **Floors:** ${dungeon.floors} | **Duration:** ~${dungeon.floors * 1} mins\n` +
                `**Requires Pal Lvl:** ${dungeon.levelRequirement}\n\nAre you sure you want to begin this expedition?`
            );
            const confirmButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('dungeon_enter').setLabel('Enter Dungeon').setStyle(ButtonStyle.Success).setEmoji('▶️'),
                new ButtonBuilder().setCustomId('dungeon_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
            );

            const reply = await message.reply({ embeds: [confirmationEmbed], components: [confirmButtons] });
            
            const confirmationCollector = reply.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 60000,
                max: 1,
                componentType: ComponentType.Button
            });

            confirmationCollector.on('collect', async i => {
                if (i.customId === 'dungeon_cancel') {
                    return i.update({ embeds: [createWarningEmbed('Expedition Cancelled', 'You decided not to enter the dungeon.')], components: [] });
                }

                if (i.customId === 'dungeon_enter') {
                    // --- Pet Selection ---
                    const availablePals = await Pet.find({ ownerId: message.author.id, status: 'Idle', level: { $gte: dungeon.levelRequirement } });
                    if (availablePals.length === 0) {
                        return i.update({ embeds: [createWarningEmbed('No Eligible Pals', `You don't have any idle Pals that meet the level requirement of **${dungeon.levelRequirement}**.` )], components: [] });
                    }

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('select_pal_for_dungeon')
                        .setPlaceholder('Select a Pal for this expedition...')
                        .addOptions(availablePals.map(pal => ({
                            label: `Lvl ${pal.level} ${pal.nickname}`,
                            description: `HP: ${pal.stats.hp} | ATK: ${pal.stats.atk} | DEF: ${pal.stats.def}`,
                            value: pal.petId
                        })));
                    
                    await i.update({
                        embeds: [createInfoEmbed('Select Your Pal', 'Choose a companion to accompany you into the dungeon.')],
                        components: [new ActionRowBuilder().addComponents(selectMenu)]
                    });

                    // Set the session lock early to prevent race conditions
                    client.dungeonSessions.set(message.author.id, {});
                }
            });

            // Handle the Pal selection from the dropdown
            const palSelectionCollector = reply.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 2 * 60000, // 2 minutes
                componentType: ComponentType.StringSelect
            });

            palSelectionCollector.on('collect', async i => {
                palSelectionCollector.stop();
                const selectedPalId = i.values[0];
                const selectedPal = await Pet.findOne({ petId: selectedPalId });

                // --- Start the Dungeon Run ---
                await runDungeon(i, selectedPal, dungeon, client);
            });

        } catch (error) {
            console.error('Dungeon command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem starting the dungeon.')] });
            client.dungeonSessions.delete(message.author.id);
        }
    }
};

async function runDungeon(interaction, pal, dungeon, client) {
    let currentFloor = 1;
    let palCurrentHp = pal.stats.hp;
    const sessionRewards = { gold: 0, xp: 0, loot: [], egg: null };
    
    // Get the player instance at the start of the function
    const player = await Player.findOne({ userId: interaction.user.id });
    
    // Set Pal status to Exploring
    pal.status = 'Exploring';
    await pal.save();

    while (currentFloor <= dungeon.floors) {
        const isBossFloor = currentFloor === dungeon.floors;
        const enemy = generateEnemy(dungeon, currentFloor, isBossFloor);

        const floorEmbed = createCustomEmbed(
            `${dungeon.name} - Floor ${currentFloor}`,
            `A wild **${enemy.name}** appears!`,
            '#E74C3C',
            {
                fields: [
                    { name: `${pal.nickname} (Your Pal)`, value: `❤️ HP: ${palCurrentHp}/${pal.stats.hp}`, inline: true },
                    { name: `${enemy.name} (Enemy)`, value: `❤️ HP: ${enemy.stats.hp}/${enemy.stats.hp}`, inline: true },
                ]
            }
        );
        const fightButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('fight').setLabel('Fight').setStyle(ButtonStyle.Success).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('run').setLabel('Run').setStyle(ButtonStyle.Danger)
        );

        await interaction.message.edit({ embeds: [floorEmbed], components: [fightButtons] });

        const action = await interaction.channel.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: 5 * 60000, // 5 minutes per floor
            componentType: ComponentType.Button,
        }).catch(() => null);

        if (!action || action.customId === 'run') {
            await interaction.message.edit({ embeds: [createWarningEmbed('You Fled!', 'You escaped the dungeon with the rewards you\'ve gathered so far.')], components: [] });
            return finalizeDungeon(interaction, pal, player, sessionRewards, client, currentFloor - 1, false); // false = not defeated
        }

        if (action.customId === 'fight') {
            const battleResult = simulateBattle({ ...pal.toObject(), nickname: pal.nickname }, enemy);
            palCurrentHp = battleResult.remainingHp;

            const battleEmbed = createInfoEmbed(`Battle Log - Floor ${currentFloor}`, battleResult.log);
            await action.update({ embeds: [battleEmbed], components: [] });
            await new Promise(resolve => setTimeout(resolve, 5000)); // Pause to let user read the log

            if (!battleResult.playerWon) {
                await interaction.message.edit({ embeds: [createErrorEmbed('Defeated!', `Your Pal, **${pal.nickname}**, was defeated on Floor ${currentFloor}. You escape with your current loot.` )]});
                return finalizeDungeon(interaction, pal, player, sessionRewards, client, currentFloor - 1, true); // true = defeated
            }

            // --- Floor Cleared ---
            const floorRewards = generateDungeonRewards(dungeon, currentFloor);
            sessionRewards.gold += floorRewards.gold1;
            sessionRewards.xp += floorRewards.xp1;
            sessionRewards.loot.push(...floorRewards.loot);
            if (floorRewards.egg && !sessionRewards.egg) sessionRewards.egg = floorRewards.egg; // Only get first egg

            let rewardString = `**+${floorRewards.gold1}** Gold\n**+${floorRewards.xp1}** XP`;
            floorRewards.loot.forEach(item => {
                rewardString += `\n**+${item.quantity}x** ${allItems[item.itemId].name}`;
            });
            if (floorRewards.egg) {
                rewardString += `\n**+1x** ${allItems[floorRewards.egg.itemId].name}!`;
            }
            
            const rewardEmbed = createSuccessEmbed(`Floor ${currentFloor} Cleared!`, rewardString);
            await interaction.message.edit({ embeds: [rewardEmbed] });
            await new Promise(resolve => setTimeout(resolve, 4000));

            currentFloor++;
        }
    }

    // --- Dungeon Complete ---
    await interaction.message.edit({ embeds: [createSuccessEmbed('Dungeon Cleared!', `You have conquered all ${dungeon.floors} floors of the **${dungeon.name}**!`)] });
    return finalizeDungeon(interaction, pal, player, sessionRewards, client, dungeon.floors, false); // false = not defeated, completed successfully
}

// Function to save rewards and clean up
async function finalizeDungeon(interaction, pal, player, rewards, client, floorsCleared, wasDefeated = false) {
    player.gold += rewards.gold;
    
    // Only increment dungeonClears if the dungeon was completed successfully (not defeated)
    if (!wasDefeated && floorsCleared > 0) {
        player.stats.dungeonClears += 1;
    }

    rewards.loot.forEach(item => {
        const existing = player.inventory.find(i => i.itemId === item.itemId);
        if (existing) existing.quantity += item.quantity;
        else player.inventory.push(item);
    });
    
    if (rewards.egg) {
        const existing = player.inventory.find(i => i.itemId === rewards.egg.itemId);
        if (existing) existing.quantity += 1;
        else player.inventory.push(rewards.egg);
    }
    
    await player.save();
    
    // Handle Pal XP and Level up
    const levelUpInfo = await grantPalXp(client, interaction.message, pal, rewards.xp);
    
    // Set pet status based on whether they were defeated or not
    pal.status = wasDefeated ? 'Injured' : 'Idle';
    await pal.save();
    
    let finalSummary = `**Floors Cleared:** ${floorsCleared}\n` +
                       `**Gold Earned:** ${rewards.gold}\n` +
                       `**XP Gained:** ${rewards.xp}`;
    
    if (levelUpInfo.leveledUp) {
        finalSummary += `\n\n**LEVEL UP!** Your **${pal.nickname}** is now **Level ${levelUpInfo.newLevel}**!`;
    }
    
    // Add status message if pet was injured
    if (wasDefeated) {
        finalSummary += `\n\n⚠️ Your **${pal.nickname}** is now **Injured** and needs to recover!`;
    }
    
    const summaryEmbed = createSuccessEmbed('Expedition Summary', finalSummary);
    await interaction.channel.send({ embeds: [summaryEmbed] });
    
    client.dungeonSessions.delete(interaction.user.id);
    
    // Only emit dungeonClear event if actually completed successfully
    if (!wasDefeated && floorsCleared > 0) {
        client.emit('dungeonClear', interaction.user.id);
    }
}