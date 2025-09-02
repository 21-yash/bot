const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Player = require('../../models/Player');
const Pet = require('../../models/Pet');
const { createErrorEmbed, createSuccessEmbed, createInfoEmbed } = require('../../utils/embed');
const { restoreStamina } = require('../../utils/stamina');
const allBiomes = require('../../gamedata/biomes');
const allItems = require('../../gamedata/items');
const allPals = require('../../gamedata/pets');
const config = require('../../config/config.json');

module.exports = {
    name: 'forage',
    description: 'Forage for alchemical ingredients in a specific biome.',
    usage: '[biome name]',
    aliases: ['gather'],
    async execute(message, args, client, prefix) {
        try {
            let player = await Player.findOne({ userId: message.author.id });
            if (!player) {
                return message.reply({ embeds: [createErrorEmbed('No Adventure Started', `You haven't started your journey yet! Use \`${prefix}start\` to begin.`)] });
            }

            // --- 1. Determine and Validate Biome ---
            const biomeId = (args.length > 0 ? args.join('_') : Object.keys(allBiomes)[0]).toLowerCase();
            const biome = allBiomes[biomeId];

            if (!biome) {
                const availableBiomes = Object.values(allBiomes).map(b => `\`${b.name}\``).join(', ');
                return message.reply({ embeds: [createErrorEmbed('Invalid Biome', `That biome does not exist. Available biomes: ${availableBiomes}`)] });
            }

            if (player.level < biome.levelRequirement) {
                return message.reply({ embeds: [createErrorEmbed('Level Too Low', `You must be level **${biome.levelRequirement}** to forage in the **${biome.name}**.`)] });
            }

            // --- 2. Handle Stamina ---
            player = await restoreStamina(player);

            if (player.stamina < biome.staminaCost) {
                const staminaNeeded = biome.staminaCost - player.stamina;
                const timeToWaitMinutes = Math.ceil(staminaNeeded / 1) * 5; // Assuming 1 stamina per 5 mins
                return message.reply({ embeds: [
                    createErrorEmbed('Not Enough Stamina!', `You are too tired. You need **${staminaNeeded}** more stamina.\nPlease wait approximately **${timeToWaitMinutes} minutes**.`)] 
                });
            }

            // --- 3. Calculate Loot ---
            const foundLoot = [];
            for (const lootItem of biome.lootTable) {
                if (Math.random() < lootItem.chance) {
                    const quantity = Math.floor(Math.random() * (lootItem.quantityRange[1] - lootItem.quantityRange[0] + 1)) + lootItem.quantityRange[0];
                    foundLoot.push({ itemId: lootItem.itemId, quantity });
                }
            }

            // --- 4. Update Player Data ---
            player.stamina -= biome.staminaCost;
            player.lastStaminaUpdate = new Date();
            player.stats.forageCount += 1;

            let lootDescription = '';
            if (foundLoot.length > 0) {
                foundLoot.forEach(loot => {
                    const existingItem = player.inventory.find(i => i.itemId === loot.itemId);
                    if (existingItem) {
                        existingItem.quantity += loot.quantity;
                    } else {
                        player.inventory.push({ itemId: loot.itemId, quantity: loot.quantity });
                    }
                    lootDescription += `+ **${loot.quantity}x** ${allItems[loot.itemId].name}\n`;
                });
            } else {
                lootDescription = 'You searched carefully but found nothing of value.';
            }

            await player.save();
            client.emit('forage', message.author.id);

            const successEmbed = createSuccessEmbed(
                `Foraging in the ${biome.name}`,
                lootDescription, { footer: { text: `Stamina: ${player.stamina}/${player.maxStamina}` } }
            );
            await message.reply({ embeds: [successEmbed] });

            // --- 5. Pal Encounter Logic ---
            let encounteredPalInfo = null;
            if (biome.possiblePals && biome.possiblePals.length > 0) {
                for (const pal of biome.possiblePals) {
                    if (Math.random() < pal.chance) {
                        encounteredPalInfo = { ...allPals[pal.palId], id: pal.palId };
                        break;
                    }
                }
            }

            if (encounteredPalInfo) {
                const encounterEmbed = createInfoEmbed(
                    `A wild ${encounteredPalInfo.name} appeared!`,
                    `While foraging, you stumble upon a wild **${encounteredPalInfo.name}**. It looks at you curiously.`
                );

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`tame_${encounteredPalInfo.id}`).setLabel('Attempt to Tame').setStyle(ButtonStyle.Success).setEmoji('🐾'),
                    new ButtonBuilder().setCustomId('ignore').setLabel('Leave it Be').setStyle(ButtonStyle.Secondary)
                );

                const encounterMessage = await message.channel.send({ embeds: [encounterEmbed], components: [buttons] });
                
                const collector = encounterMessage.createMessageComponentCollector({
                    filter: i => i.user.id === message.author.id,
                    time: 2 * 60 * 1000,
                    componentType: ComponentType.Button
                });

                collector.on('collect', async i => {
                    if (i.customId === 'ignore') {
                        await i.update({
                            embeds: [createInfoEmbed(`You left the ${encounteredPalInfo.name} alone.`, 'It watches you for a moment before disappearing back into the wilds.')],
                            components: []
                        });
                        return collector.stop();
                    }

                    if (i.customId.startsWith('tame_')) {

                        player.palCounter += 1;
                        newShortId = player.palCounter;

                        const newPal = new Pet({
                            ownerId: message.author.id,
                            basePetId: encounteredPalInfo.id,
                            shortId: newShortId,
                            nickname: encounteredPalInfo.name,
                            level: 1,
                            xp: 0,
                            stats: encounteredPalInfo.baseStats,
                        });
                        await newPal.save();
                        
                        await i.update({
                            embeds: [createSuccessEmbed('Tamed!', `You successfully tamed the **${encounteredPalInfo.name}**! It has been added to your collection.`)],
                            components: []
                        });
                        return collector.stop();
                    }
                });

                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        encounterMessage.edit({
                            embeds: [createInfoEmbed(`The ${encounteredPalInfo.name} got away.`, 'The wild Pal grew impatient and vanished before you could decide.')],
                            components: []
                        });
                    }
                });
            }

        } catch (error) {
            console.error('Forage command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem while trying to forage.')] });
        }
    }
};