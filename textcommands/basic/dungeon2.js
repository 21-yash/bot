const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const Player = require('../../models/Player');
const Pet = require('../../models/Pet');
const { createErrorEmbed, createSuccessEmbed, createWarningEmbed, createCustomEmbed, createInfoEmbed } = require('../../utils/embed');
const allDungeons = require('../../gamedata/dungeons');
const allItems = require('../../gamedata/items');
const { generateEnemy, simulateBattle, generateDungeonRewards } = require('../../utils/combat');
const { grantPalXp } = require('../../utils/leveling');

module.exports = {
    name: 'dungeon2',
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

                // --- Potion Selection ---
                const availablePotions = player.inventory.filter(item => {
                    const itemData = allItems[item.itemId];
                    return itemData && itemData.type === 'potion' && item.quantity > 0;
                });

                if (availablePotions.length > 0) {
                    const potionOptions = availablePotions.map(item => ({
                        label: `${allItems[item.itemId].name} (${item.quantity}x)`,
                        description: allItems[item.itemId].description.substring(0, 100),
                        value: item.itemId
                    }));

                    // Add "No Potion" option
                    potionOptions.unshift({
                        label: 'No Potion',
                        description: 'Enter the dungeon without using any potions',
                        value: 'none'
                    });

                    const potionMenu = new StringSelectMenuBuilder()
                        .setCustomId('select_potion_for_dungeon')
                        .setPlaceholder('Select a potion to use (optional)...')
                        .addOptions(potionOptions);

                    await i.update({
                        embeds: [createInfoEmbed('Select Potion', 'Choose a potion to enhance your Pal for this dungeon expedition.')],
                        components: [new ActionRowBuilder().addComponents(potionMenu)]
                    });

                    // Handle potion selection
                    const potionCollector = reply.createMessageComponentCollector({
                        filter: i => i.user.id === message.author.id,
                        time: 2 * 60000,
                        componentType: ComponentType.StringSelect
                    });

                    potionCollector.on('collect', async potionInteraction => {
                        potionCollector.stop();
                        const selectedPotionId = potionInteraction.values[0];
                        let selectedPotion = null;

                        if (selectedPotionId !== 'none') {
                            selectedPotion = allItems[selectedPotionId];
                            // Consume the potion
                            const potionItem = player.inventory.find(item => item.itemId === selectedPotionId);
                            potionItem.quantity -= 1;
                            if (potionItem.quantity <= 0) {
                                player.inventory = player.inventory.filter(item => item.itemId !== selectedPotionId);
                            }
                            await player.save();
                        }

                        // --- Start the Dungeon Run ---
                        await runDungeon(potionInteraction, selectedPal, dungeon, client, selectedPotion);
                    });
                } else {
                    // No potions available, proceed directly
                    await runDungeon(i, selectedPal, dungeon, client, null);
                }
            });

        } catch (error) {
            console.error('Dungeon command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem starting the dungeon.')] });
            client.dungeonSessions.delete(message.author.id);
        }
    }
};

async function runDungeon(interaction, pal, dungeon, client, selectedPotion = null) {
    let currentFloor = 1;
    let palCurrentHp = pal.stats.hp;
    const sessionRewards = { gold: 0, xp: 0, loot: [], egg: null };
    
    // Get the player instance at the start of the function
    const player = await Player.findOne({ userId: interaction.user.id });
    
    // Apply potion effects
    const enhancedPal = applyPotionEffects(pal, selectedPotion);
    let potionEffects = {};
    
    if (selectedPotion) {
        potionEffects = getPotionEffects(selectedPotion);
        palCurrentHp = enhancedPal.stats.hp; // Update HP if potion boosted it
        
        const potionEmbed = createSuccessEmbed(
            'Potion Applied!',
            `Your **${pal.nickname}** consumed a **${selectedPotion.name}** and feels empowered!`
        );
        await interaction.update({ embeds: [potionEmbed], components: [] });
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
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
                    { name: `${pal.nickname} (Your Pal)`, value: `❤️ HP: ${palCurrentHp}/${enhancedPal.stats.hp}`, inline: true },
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
            const battleResult = simulateBattleWithPotions(enhancedPal, enemy, potionEffects);
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

// Helper function to apply potion effects to a pal
function applyPotionEffects(pal, potion) {
    if (!potion) return pal;

    const enhancedPal = JSON.parse(JSON.stringify(pal.toObject())); // Deep copy
    const effect = potion.effect;

    if (effect.type === 'heal') {
        enhancedPal.stats.hp += effect.value;
    } else if (effect.type === 'stat_boost') {
        if (enhancedPal.stats[effect.stat] !== undefined) {
            enhancedPal.stats[effect.stat] += effect.value;
        }
    } else if (effect.type === 'multi_boost') {
        Object.keys(effect.stats).forEach(stat => {
            if (enhancedPal.stats[stat] !== undefined) {
                enhancedPal.stats[stat] += effect.stats[stat];
            }
        });
    }

    return enhancedPal;
}

// Helper function to get potion effects for battle simulation
function getPotionEffects(potion) {
    if (!potion) return {};

    const effect = potion.effect;
    const effects = {};

    if (effect.type === 'special') {
        effects.special = {
            ability: effect.ability,
            chance: effect.chance || 1.0,
            duration: effect.duration
        };
    }

    return effects;
}

// Enhanced battle simulation with potion effects
function simulateBattleWithPotions(pal, enemy, potionEffects = {}) {
    let palCurrentHp = pal.stats.hp;
    let enemyCurrentHp = enemy.stats.hp;
    const battleLog = [];
    let turn = 0;

    const calculateDamage = (attacker, defender) => {
        const damage = Math.max(1, Math.floor(attacker.atk - (defender.def / 2)));
        return damage;
    };

    const checkSpecialAbility = (ability, chance) => {
        return Math.random() < chance;
    };

    while (palCurrentHp > 0 && enemyCurrentHp > 0) {
        turn++;
        battleLog.push(`\n**--- Turn ${turn} ---**`);

        // Pal's turn
        let palDamage = calculateDamage(pal.stats, enemy.stats);
        
        // Apply special abilities
        let specialActivated = false;
        if (potionEffects.special) {
            const { ability, chance } = potionEffects.special;
            
            if (ability === 'shadow_strike' && checkSpecialAbility(ability, chance || 0.3)) {
                palDamage *= 2;
                battleLog.push(`> **Shadow Strike!** Your ${pal.nickname} attacks from the shadows!`);
                specialActivated = true;
            }
        }

        enemyCurrentHp -= palDamage;
        if (!specialActivated) {
            battleLog.push(`> Your **${pal.nickname}** attacks, dealing **${palDamage}** damage!`);
        } else {
            battleLog.push(`> The shadow attack deals **${palDamage}** damage!`);
        }
        
        if (enemyCurrentHp <= 0) {
            battleLog.push(`> The **${enemy.name}** has been defeated!`);
            break;
        }
        battleLog.push(`> *${enemy.name} HP: ${enemyCurrentHp}/${enemy.stats.hp}*`);

        // Enemy's turn
        let enemyDamage = calculateDamage(enemy.stats, pal.stats);
        
        // Check for dodge abilities
        let dodged = false;
        if (potionEffects.special) {
            const { ability, chance } = potionEffects.special;
            
            if (ability === 'phase_dodge' && checkSpecialAbility(ability, chance || 0.25)) {
                dodged = true;
                battleLog.push(`> **Phase Dodge!** Your ${pal.nickname} phases through the attack!`);
            }
        }

        if (!dodged) {
            palCurrentHp -= enemyDamage;
            battleLog.push(`> The **${enemy.name}** retaliates, dealing **${enemyDamage}** damage!`);
            if (palCurrentHp <= 0) {
                battleLog.push(`> Your **${pal.nickname}** has been defeated!`);
                break;
            }
            battleLog.push(`> *${pal.nickname} HP: ${palCurrentHp}/${pal.stats.hp}*`);
        } else {
            battleLog.push(`> The attack passes harmlessly through your **${pal.nickname}**!`);
        }

        if (turn > 50) {
            battleLog.push('The battle is a stalemate and both combatants retreat.');
            break;
        }
    }

    return {
        playerWon: palCurrentHp > 0,
        log: battleLog.join('\n'),
        remainingHp: Math.max(0, palCurrentHp)
    };
}