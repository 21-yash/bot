const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Player = require('../../models/Player');
const { createErrorEmbed, createSuccessEmbed, createWarningEmbed, createInfoEmbed } = require('../../utils/embed');
const { grantPlayerXp } = require('../../utils/leveling');
const allItems = require('../../gamedata/items');
const allRecipes = require('../../gamedata/recipes');
const config = require('../../config/config.json');

// Helper function to get a player's crafting materials
function getPlayerCraftingMaterials(player) {
    const materialTypes = ['crafting_material']; // Allow both for flexibility
    return player.inventory
        .filter(item => allItems[item.itemId] && materialTypes.includes(allItems[item.itemId].type))
        .map(item => ({
            label: `${allItems[item.itemId].name} (x${item.quantity})`,
            value: item.itemId,
            description: allItems[item.itemId].description.substring(0, 100),
        }));
}

module.exports = {
    name: 'craft',
    description: 'Craft equipment and items at the workshop.',
    async execute(message, args, client, prefix) {
        try {
            const player = await Player.findOne({ userId: message.author.id });
            if (!player) {
                return message.reply({ embeds: [createErrorEmbed('No Adventure Started', `You haven't started your journey yet! Use \`${prefix}start\` to begin.`)] });
            }

            const materials = getPlayerCraftingMaterials(player);
            if (materials.length === 0) {
                return message.reply({ embeds: [createErrorEmbed('No Materials', `You don't have any materials to craft with! Find them in dungeons.`)] });
            }

            // --- REDESIGNED Interactive Workshop UI ---
            const MAX_SLOTS = 5;
            let selectedMaterials = [];

            const createWorkshopEmbed = () => {
                let description = `Add materials to the workbench using the select menu.\n\n**Workbench Contents:**\n`;
                for (let i = 0; i < MAX_SLOTS; i++) {
                    const id = selectedMaterials[i];
                    description += `> **Slot ${i + 1}:** ${id ? allItems[id].name : '*(Empty)*'}\n`;
                }
                return createInfoEmbed('Craftsman\'s Workshop', description, { footer: { text: 'Click "Craft" when you are ready.' } });
            };

            const createComponents = () => {
                const materialMenu = new StringSelectMenuBuilder()
                    .setCustomId('craft_add_material')
                    .setPlaceholder('Select a material to add...')
                    .addOptions(materials.slice(0, 25));

                const buttonRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('craft_confirm').setLabel('Craft').setStyle(ButtonStyle.Success).setEmoji('🔨').setDisabled(selectedMaterials.length === 0),
                    new ButtonBuilder().setCustomId('craft_clear_last').setLabel('Clear Last').setStyle(ButtonStyle.Secondary).setDisabled(selectedMaterials.length === 0),
                    new ButtonBuilder().setCustomId('craft_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
                );

                return [new ActionRowBuilder().addComponents(materialMenu), buttonRow];
            };

            const reply = await message.reply({
                embeds: [createWorkshopEmbed()],
                components: createComponents(),
                ephemeral: true,
            });

            const collector = reply.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 5 * 60 * 1000,
            });

            collector.on('collect', async (i) => {
                if (i.isStringSelectMenu()) {
                    if (selectedMaterials.length < MAX_SLOTS) {
                        selectedMaterials.push(i.values[0]);
                    }
                    await i.update({ embeds: [createWorkshopEmbed()], components: createComponents() });
                }

                if (i.isButton()) {
                    if (i.customId === 'craft_clear_last') {
                        selectedMaterials.pop();
                        await i.update({ embeds: [createWorkshopEmbed()], components: createComponents() });
                        return;
                    }

                    if (i.customId === 'craft_cancel') {
                        await i.update({ embeds: [createWarningEmbed('Crafting Cancelled', 'You have cleared the workbench.')], components: [] });
                        return collector.stop();
                    }

                    if (i.customId === 'craft_confirm') {
                        const submittedCounts = selectedMaterials.reduce((acc, id) => {
                            acc[id] = (acc[id] || 0) + 1;
                            return acc;
                        }, {});

                        let matchedRecipe = null;
                        let matchedRecipeId = null;

                        for (const [recipeId, recipeData] of Object.entries(allRecipes)) {
                            const resultItem = allItems[recipeData.result.itemId];
                            if (!resultItem || resultItem.source !== 'crafting') continue; // Only check crafting recipes

                            const requiredCounts = recipeData.ingredients.reduce((acc, ing) => {
                                acc[ing.itemId] = ing.quantity;
                                return acc;
                            }, {});

                            const submittedKeys = Object.keys(submittedCounts);
                            const requiredKeys = Object.keys(requiredCounts);

                            if (submittedKeys.length !== requiredKeys.length) continue;

                            const isMatch = requiredKeys.every(id => submittedCounts[id] === requiredCounts[id]);
                            
                            if (isMatch) {
                                const hasEnough = recipeData.ingredients.every(ing => {
                                    const playerItem = player.inventory.find(item => item.itemId === ing.itemId);
                                    return playerItem && playerItem.quantity >= ing.quantity;
                                });

                                if (hasEnough) {
                                    matchedRecipe = recipeData;
                                    matchedRecipeId = recipeId;
                                    break;
                                }
                            }
                        }

                        if (matchedRecipe) {
                            player.stats.itemsCrafted = (player.stats.itemsCrafted || 0) + 1;
                            const levelUpInfo = await grantPlayerXp(client, message, player, matchedRecipe.xp);

                            if (!player.grimoire.includes(matchedRecipeId)) {
                                player.grimoire.push(matchedRecipeId);
                            }

                            matchedRecipe.ingredients.forEach(ing => {
                                const item = player.inventory.find(i => i.itemId === ing.itemId);
                                item.quantity -= ing.quantity;
                            });
                            player.inventory = player.inventory.filter(item => item.quantity > 0);
                            
                            const resultItem = player.inventory.find(i => i.itemId === matchedRecipe.result.itemId);
                            if (resultItem) {
                                resultItem.quantity += matchedRecipe.result.quantity;
                            } else {
                                player.inventory.push({ itemId: matchedRecipe.result.itemId, quantity: matchedRecipe.result.quantity });
                            }
                            
                            await player.save();
                            client.emit('itemCraft', message.author.id); // For achievements

                            let successMsg = `You successfully crafted **${allItems[matchedRecipe.result.itemId].name}**!`;

                            await i.update({ embeds: [createSuccessEmbed('Success!', successMsg)], components: [] });

                        } else {
                            selectedMaterials.forEach(id => {
                                const item = player.inventory.find(i => i.itemId === id);
                                if (item) item.quantity -= 1;
                            });
                            player.inventory = player.inventory.filter(item => item.quantity > 0);
                            
                            await player.save();
                            
                            await i.update({ embeds: [createErrorEmbed('Failure!', `The materials broke apart during crafting. You salvaged **${selectedMaterials.length} Scrap** from the failure.`)], components: [] });
                        }
                        
                        return collector.stop();
                    }
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    reply.edit({ embeds: [createWarningEmbed('Crafting Timed Out', 'Your crafting session has expired.')], components: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Craft command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem starting your crafting session.')] });
        }
    }
};