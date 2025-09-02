const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Player = require('../../models/Player');
const { createErrorEmbed, createSuccessEmbed, createWarningEmbed, createInfoEmbed } = require('../../utils/embed');
const { grantPlayerXp } = require('../../utils/leveling');
const allItems = require('../../gamedata/items');
const allRecipes = require('../../gamedata/recipes');
const config = require('../../config/config.json');

// Helper function to get a player's ingredients
function getPlayerIngredients(player) {
    return player.inventory
        .filter(item => allItems[item.itemId]?.type === 'ingredient')
        .map(item => ({
            label: `${allItems[item.itemId].name} (x${item.quantity})`,
            value: item.itemId,
            description: allItems[item.itemId].description.substring(0, 100),
        }));
}

module.exports = {
    name: 'brew',
    description: 'Brew potions and craft items in the alchemist\'s cauldron.',
    async execute(message, args, client, prefix) {
        try {
            const player = await Player.findOne({ userId: message.author.id });
            if (!player) {
                return message.reply({ embeds: [createErrorEmbed('No Adventure Started', `You haven't started your journey yet! Use \`${prefix}start\` to begin.`)] });
            }

            const ingredients = getPlayerIngredients(player);
            if (ingredients.length === 0) {
                return message.reply({ embeds: [createErrorEmbed('No Ingredients', `You don't have any ingredients to brew with! Use \`${prefix}forage\` to find some.`)] });
            }

            // --- REDESIGNED Interactive Cauldron UI ---
            const MAX_SLOTS = 5; // A reasonable max for the UI
            let selectedIngredients = []; // Stores the ordered list of added ingredients

            const createCauldronEmbed = () => {
                let description = `Add ingredients to the cauldron using the select menu.\n\n**Cauldron Contents:**\n`;
                for (let i = 0; i < MAX_SLOTS; i++) {
                    const id = selectedIngredients[i];
                    description += `> **Slot ${i + 1}:** ${id ? allItems[id].name : '*(Empty)*'}\n`;
                }
                return createInfoEmbed('Alchemist\'s Cauldron', description, { footer: { text: 'Click "Brew" when you are ready.' } });
            };

            const createComponents = () => {
                const ingredientMenu = new StringSelectMenuBuilder()
                    .setCustomId('brew_add_ingredient')
                    .setPlaceholder('Select an ingredient to add...')
                    .addOptions(ingredients.slice(0, 25)); // Max 25 options

                const buttonRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('brew_confirm').setLabel('Brew').setStyle(ButtonStyle.Success).setEmoji('⚗️').setDisabled(selectedIngredients.length === 0),
                    new ButtonBuilder().setCustomId('brew_clear_last').setLabel('Clear Last').setStyle(ButtonStyle.Secondary).setDisabled(selectedIngredients.length === 0),
                    new ButtonBuilder().setCustomId('brew_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
                );

                return [new ActionRowBuilder().addComponents(ingredientMenu), buttonRow];
            };

            const reply = await message.reply({
                embeds: [createCauldronEmbed()],
                components: createComponents(),
                ephemeral: true,
            });

            const collector = reply.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 5 * 60 * 1000, // 5 minutes
            });

            collector.on('collect', async (i) => {
                if (i.isStringSelectMenu()) {
                    if (selectedIngredients.length < MAX_SLOTS) {
                        selectedIngredients.push(i.values[0]);
                    }
                    await i.update({ embeds: [createCauldronEmbed()], components: createComponents() });
                }

                if (i.isButton()) {
                    if (i.customId === 'brew_clear_last') {
                        selectedIngredients.pop();
                        await i.update({ embeds: [createCauldronEmbed()], components: createComponents() });
                        return;
                    }

                    if (i.customId === 'brew_cancel') {
                        await i.update({ embeds: [createWarningEmbed('Brewing Cancelled', 'You have cleared the cauldron.')], components: [] });
                        return collector.stop();
                    }

                    if (i.customId === 'brew_confirm') {
                        // --- Recipe Matching Logic ---
                        const submittedCounts = selectedIngredients.reduce((acc, id) => {
                            acc[id] = (acc[id] || 0) + 1;
                            return acc;
                        }, {});

                        let matchedRecipe = null;
                        let matchedRecipeId = null;

                        for (const [recipeId, recipeData] of Object.entries(allRecipes)) {
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

                        // --- Handle Success or Failure ---
                        if (matchedRecipe) {
                            player.stats.potionsBrewed = (player.stats.potionsBrewed || 0) + 1;

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
                            client.emit('potionBrew', message.author.id);

                            let successMsg = `You successfully brewed **${allItems[matchedRecipe.result.itemId].name}**!`;
                            await i.update({ embeds: [createSuccessEmbed('Success!', successMsg)], components: [] });

                        } else {
                            selectedIngredients.forEach(id => {
                                const item = player.inventory.find(i => i.itemId === id);
                                if (item) item.quantity -= 1;
                            });
                            player.inventory = player.inventory.filter(item => item.quantity > 0);
                            
                            player.arcaneDust += selectedIngredients.length;
                            await player.save();
                            
                            await i.update({ embeds: [createErrorEmbed('Failure!', `The ingredients fizzled into a useless concoction. You salvaged **${selectedIngredients.length} Arcane Dust** from the failure.`)], components: [] });
                        }
                        
                        return collector.stop();
                    }
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    reply.edit({ embeds: [createWarningEmbed('Brewing Timed Out', 'Your brewing session has expired.')], components: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Brew command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem starting your brewing session.')] });
        }
    }
};