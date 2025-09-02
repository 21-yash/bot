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
            description: allItems[item.itemId].description,
        }));
}

module.exports = {
    name: 'brew2',
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

            // --- Interactive Cauldron UI ---
            let selectedIngredients = [null, null, null]; // To store the selected item IDs

            const createCauldronEmbed = () => {
                let description = 'Select up to 3 ingredients from the menus below to add them to the cauldron.\n\n**Cauldron Contents:**\n';
                selectedIngredients.forEach((id, index) => {
                    description += `> **Slot ${index + 1}:** ${id ? allItems[id].name : '*(Empty)*'}\n`;
                });
                return createInfoEmbed('Alchemist\'s Cauldron', description, { footer: { text: 'Click "Brew" when you are ready.' } });
            };

            const createSelectMenus = () => {
                const rows = [];
                for (let i = 0; i < 3; i++) {
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId(`brew_ingredient_${i}`)
                        .setPlaceholder(`Select Ingredient for Slot ${i + 1}...`)
                        .addOptions([{ label: '--- Clear Slot ---', value: 'clear' }, ...ingredients]);
                    rows.push(new ActionRowBuilder().addComponents(selectMenu));
                }
                return rows;
            };

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('brew_confirm').setLabel('Brew Potion').setStyle(ButtonStyle.Success).setEmoji('⚗️'),
                new ButtonBuilder().setCustomId('brew_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
            );

            const reply = await message.reply({
                embeds: [createCauldronEmbed()],
                components: [...createSelectMenus(), actionRow],
                ephemeral: true, // Make it private to the user
            });

            const collector = reply.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 5 * 60 * 1000, // 5 minutes
                componentType: ComponentType.StringSelect,
            });

            const buttonCollector = reply.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 5 * 60 * 1000, // 5 minutes
                componentType: ComponentType.Button,
            });

            collector.on('collect', async (i) => {
                const slotIndex = parseInt(i.customId.split('_')[2]);
                const value = i.values[0];
                selectedIngredients[slotIndex] = value === 'clear' ? null : value;
                await i.update({ embeds: [createCauldronEmbed()] });
            });

            buttonCollector.on('collect', async (i) => {
                if (i.customId === 'brew_cancel') {
                    await i.update({ embeds: [createWarningEmbed('Brewing Cancelled', 'You have cleared the cauldron.')], components: [] });
                    collector.stop();
                    return;
                }

                if (i.customId === 'brew_confirm') {
                    const finalIngredients = selectedIngredients.filter(id => id !== null);
                    if (finalIngredients.length === 0) {
                        return i.reply({ content: 'You must add at least one ingredient to the cauldron!', ephemeral: true });
                    }

                    // --- FIXED Recipe Matching Logic ---
                    // Count how many of each ingredient the player submitted
                    const submittedIngredientCounts = finalIngredients.reduce((acc, id) => {
                        acc[id] = (acc[id] || 0) + 1;
                        return acc;
                    }, {});

                    let matchedRecipe = null;
                    let matchedRecipeId = null;

                    // Check each recipe to see if it matches
                    for (const [recipeId, recipeData] of Object.entries(allRecipes)) {
                        // Convert recipe ingredients to a count object
                        const requiredIngredientCounts = recipeData.ingredients.reduce((acc, ingredient) => {
                            acc[ingredient.itemId] = ingredient.quantity;
                            return acc;
                        }, {});

                        // Check if the submitted ingredients exactly match the required ingredients
                        const submittedKeys = Object.keys(submittedIngredientCounts);
                        const requiredKeys = Object.keys(requiredIngredientCounts);

                        // Must have the same number of unique ingredient types
                        if (submittedKeys.length !== requiredKeys.length) continue;

                        // Check if all ingredients match exactly
                        const isExactMatch = requiredKeys.every(ingredientId => {
                            return submittedIngredientCounts[ingredientId] === requiredIngredientCounts[ingredientId];
                        });

                        if (isExactMatch) {
                            // Also verify player has enough of each ingredient
                            const hasEnoughIngredients = recipeData.ingredients.every(ingredient => {
                                const playerItem = player.inventory.find(item => item.itemId === ingredient.itemId);
                                return playerItem && playerItem.quantity >= ingredient.quantity;
                            });

                            if (hasEnoughIngredients) {
                                matchedRecipe = recipeData;
                                matchedRecipeId = recipeId;
                                break;
                            }
                        }
                    }

                    // --- Handle Success or Failure ---
                    if (matchedRecipe) {
                        // SUCCESS
                        player.stats.potionsBrewed += 1;
                        player.xp += matchedRecipe.xp;
                        
                        // Check for level up
                        const levelUpResult = await grantPlayerXp(client, message, player, matchedRecipe.xp);
                        
                        // Add recipe to grimoire if not already there
                        if (!player.grimoire.includes(matchedRecipeId)) {
                            player.grimoire.push(matchedRecipeId);
                        }
                        
                        // Remove ingredients and add result
                        matchedRecipe.ingredients.forEach(ing => {
                            const item = player.inventory.find(i => i.itemId === ing.itemId);
                            if (item) {
                                item.quantity -= ing.quantity;
                            }
                        });
                        player.inventory = player.inventory.filter(item => item.quantity > 0);
                        
                        const resultItem = player.inventory.find(i => i.itemId === matchedRecipe.result.itemId);
                        if (resultItem) {
                            resultItem.quantity += matchedRecipe.result.quantity;
                        } else {
                            player.inventory.push({ itemId: matchedRecipe.result.itemId, quantity: matchedRecipe.result.quantity });
                        }
                        
                        await player.save();
                        client.emit('potionBrew', message.author.id); // For achievements
                        
                        let successMessage = `You successfully brewed **${matchedRecipe.result.quantity}x ${allItems[matchedRecipe.result.itemId].name}**!`;
                        
                        await i.update({ embeds: [createSuccessEmbed('Success!', successMessage)], components: [] });
                        
                    } else {
                        // FAILURE - Remove one of each ingredient used
                        const ingredientsToRemove = {};
                        finalIngredients.forEach(id => {
                            ingredientsToRemove[id] = (ingredientsToRemove[id] || 0) + 1;
                        });

                        Object.keys(ingredientsToRemove).forEach(ingredientId => {
                            const item = player.inventory.find(i => i.itemId === ingredientId);
                            if (item) {
                                item.quantity -= ingredientsToRemove[ingredientId];
                            }
                        });
                        
                        player.inventory = player.inventory.filter(item => item.quantity > 0);
                        
                        player.arcaneDust += finalIngredients.length; // 1 dust per ingredient
                        await player.save();
                        
                        await i.update({ embeds: [createErrorEmbed('Failure!', `The ingredients fizzled into a useless concoction. You salvaged **${finalIngredients.length} Arcane Dust** from the failure.`)], components: [] });
                    }

                    collector.stop();
                    buttonCollector.stop();
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    reply.edit({ embeds: [createWarningEmbed('Brewing Timed Out', 'Your brewing session has expired.')], components: [] });
                }
            });

        } catch (error) {
            console.error('Brew command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem starting your brewing session.')] });
        }
    }
};