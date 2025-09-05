const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");
const Player = require("../../models/Player");
const {
    createErrorEmbed,
    createSuccessEmbed,
    createWarningEmbed,
    createInfoEmbed,
} = require("../../utils/embed");
const { grantPlayerXp } = require("../../utils/leveling");
const allItems = require("../../gamedata/items");
const allRecipes = require("../../gamedata/recipes");
const config = require("../../config/config.json");

// Track active brewing sessions to prevent multiple interfaces
const activeBrewingSessions = new Set();

// Helper function to get a player's ingredients
function getPlayerIngredients(player) {
    return player.inventory
        .filter((item) => allItems[item.itemId]?.type === "ingredient")
        .map((item) => ({
            label: `${allItems[item.itemId].name} (x${item.quantity})`,
            value: item.itemId,
            description: allItems[item.itemId].description.substring(0, 100),
        }));
}

module.exports = {
    name: "brew",
    description: "Brew potions and craft items in the alchemist's cauldron.",
    async execute(message, args, client, prefix) {
        try {
            // Check if user already has an active brewing session
            if (activeBrewingSessions.has(message.author.id)) {
                return message.reply({
                    embeds: [
                        createErrorEmbed(
                            "Already Brewing",
                            "You already have an active brewing session! Please finish or cancel it first.",
                        ),
                    ],
                });
            }

            const player = await Player.findOne({ userId: message.author.id });
            if (!player) {
                return message.reply({
                    embeds: [
                        createErrorEmbed(
                            "No Adventure Started",
                            `You haven't started your journey yet! Use \`${prefix}start\` to begin.`,
                        ),
                    ],
                });
            }

            const ingredients = getPlayerIngredients(player);
            if (ingredients.length === 0) {
                return message.reply({
                    embeds: [
                        createErrorEmbed(
                            "No Ingredients",
                            `You don't have any ingredients to brew with! Use \`${prefix}forage\` to find some.`,
                        ),
                    ],
                });
            }

            // Mark user as having an active session
            activeBrewingSessions.add(message.author.id);

            // --- Text Input Cauldron UI ---
            let selectedIngredients = {}; // Track ingredient quantities { itemId: quantity }

            const createCauldronEmbed = () => {
                let description = `Enter ingredients in format: **quantity ingredient_name, quantity ingredient_name**\nExample: \`2 moonpetal_herb, 1 crystal_shard\`\n`;

                if (Object.keys(selectedIngredients).length > 0) {
                    description += `\n**Selected Ingredients:**\n`;
                    Object.entries(selectedIngredients).forEach(
                        ([itemId, qty]) => {
                            description += `> ${allItems[itemId].name} x${qty}\n`;
                        },
                    );
                }

                return createInfoEmbed("Alchemist's Cauldron", description, {
                    footer: {
                        text: 'Type your ingredients below, then click "Brew"',
                    },
                });
            };

            const createComponents = () => {
                const buttonRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("brew_confirm")
                        .setLabel("Brew")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("⚗️")
                        .setDisabled(
                            Object.keys(selectedIngredients).length === 0,
                        ),
                    new ButtonBuilder()
                        .setCustomId("brew_clear")
                        .setLabel("Clear All")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(
                            Object.keys(selectedIngredients).length === 0,
                        ),
                    new ButtonBuilder()
                        .setCustomId("brew_cancel")
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger),
                );

                return [buttonRow];
            };

            const reply = await message.reply({
                embeds: [createCauldronEmbed()],
                components: createComponents(),
                ephemeral: true,
            });

            // Message collector for text input
            const messageCollector = message.channel.createMessageCollector({
                filter: (m) => m.author.id === message.author.id,
                time: 5 * 60 * 1000,
            });

            // Component collector for buttons
            const componentCollector = reply.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 5 * 60 * 1000,
            });

            messageCollector.on("collect", async (m) => {
                if (m.content.toLowerCase() === "cancel") {
                    activeBrewingSessions.delete(message.author.id);
                    await reply.edit({
                        embeds: [
                            createWarningEmbed(
                                "Brewing Cancelled",
                                "You have cleared the cauldron.",
                            ),
                        ],
                        components: [],
                    });
                    messageCollector.stop();
                    componentCollector.stop();
                    return;
                }

                // Parse input like "2 moonpetal_herb, 1 crystal_shard"
                const inputParts = m.content
                    .split(",")
                    .map((part) => part.trim());
                const newIngredients = {};
                let hasError = false;
                let errorMsg = "";

                for (const part of inputParts) {
                    const match = part.match(/^(\d+)\s+(.+)$/);
                    if (!match) {
                        errorMsg = `Invalid format: "${part}". Use format: quantity ingredient_name`;
                        hasError = false;
                        break;
                    }

                    const quantity = parseInt(match[1]);
                    const itemName = match[2]
                        .toLowerCase()
                        .replace(/\s+/g, "_");

                    // Find item by name or ID
                    const itemId = Object.keys(allItems).find(
                        (id) =>
                            id.toLowerCase() === itemName ||
                            allItems[id].name
                                .toLowerCase()
                                .replace(/\s+/g, "_") === itemName,
                    );

                    if (!itemId) {
                        errorMsg = `Ingredient "${match[2]}" not found.`;
                        hasError = true;
                        break;
                    }

                    // Check if it's an ingredient
                    if (allItems[itemId].type !== "ingredient") {
                        errorMsg = `"${allItems[itemId].name}" is not an ingredient.`;
                        hasError = true;
                        break;
                    }

                    // Check if player has enough
                    const playerItem = player.inventory.find(
                        (item) => item.itemId === itemId,
                    );
                    if (!playerItem || playerItem.quantity < quantity) {
                        errorMsg = `You don't have ${quantity} ${allItems[itemId].name}. You have ${playerItem ? playerItem.quantity : 0}.`;
                        hasError = true;
                        break;
                    }

                    newIngredients[itemId] = quantity;
                }

                if (hasError) {
                    await m.reply({
                        embeds: [createErrorEmbed("Invalid Input", errorMsg)],
                        allowedMentions: { repliedUser: false },
                    });
                    return;
                }

                selectedIngredients = newIngredients;
                await reply.edit({
                    embeds: [createCauldronEmbed()],
                    components: createComponents(),
                });

                // Delete user's input message
                // try {
                //     await m.delete();
                // } catch (e) {
                //     // Ignore if can't delete
                // }
            });

            componentCollector.on("collect", async (i) => {
                if (i.isButton()) {
                    if (i.customId === "brew_clear") {
                        selectedIngredients = {};
                        await i.update({
                            embeds: [createCauldronEmbed()],
                            components: createComponents(),
                        });
                        return;
                    }

                    if (i.customId === "brew_cancel") {
                        activeBrewingSessions.delete(message.author.id);
                        await i.update({
                            embeds: [
                                createWarningEmbed(
                                    "Brewing Cancelled",
                                    "You have cleared the cauldron.",
                                ),
                            ],
                            components: [],
                        });
                        messageCollector.stop();
                        return componentCollector.stop();
                    }

                    if (i.customId === "brew_confirm") {
                        // --- Recipe Matching Logic ---
                        const submittedCounts = selectedIngredients;

                        let matchedRecipe = null;
                        let matchedRecipeId = null;

                        for (const [recipeId, recipeData] of Object.entries(
                            allRecipes,
                        )) {
                            const requiredCounts =
                                recipeData.ingredients.reduce((acc, ing) => {
                                    acc[ing.itemId] = ing.quantity;
                                    return acc;
                                }, {});

                            const submittedKeys = Object.keys(submittedCounts);
                            const requiredKeys = Object.keys(requiredCounts);

                            if (submittedKeys.length !== requiredKeys.length)
                                continue;

                            const isMatch = requiredKeys.every(
                                (id) =>
                                    submittedCounts[id] === requiredCounts[id],
                            );

                            if (isMatch) {
                                const hasEnough = recipeData.ingredients.every(
                                    (ing) => {
                                        const playerItem =
                                            player.inventory.find(
                                                (item) =>
                                                    item.itemId === ing.itemId,
                                            );
                                        return (
                                            playerItem &&
                                            playerItem.quantity >= ing.quantity
                                        );
                                    },
                                );

                                if (hasEnough) {
                                    matchedRecipe = recipeData;
                                    matchedRecipeId = recipeId;
                                    break;
                                }
                            }
                        }

                        // --- Handle Success or Failure ---
                        if (matchedRecipe) {
                            player.stats.potionsBrewed =
                                (player.stats.potionsBrewed || 0) + 1;

                            const levelUpInfo = await grantPlayerXp(
                                client,
                                message,
                                player,
                                matchedRecipe.xp,
                            );

                            if (!player.grimoire.includes(matchedRecipeId)) {
                                player.grimoire.push(matchedRecipeId);
                            }

                            matchedRecipe.ingredients.forEach((ing) => {
                                const item = player.inventory.find(
                                    (i) => i.itemId === ing.itemId,
                                );
                                if (item) {
                                    // Ensure item exists before decrementing
                                    item.quantity -= ing.quantity;
                                }
                            });
                            player.inventory = player.inventory.filter(
                                (item) => item.quantity > 0,
                            );

                            const resultItem = player.inventory.find(
                                (i) => i.itemId === matchedRecipe.result.itemId,
                            );
                            if (resultItem) {
                                resultItem.quantity +=
                                    matchedRecipe.result.quantity;
                            } else {
                                player.inventory.push({
                                    itemId: matchedRecipe.result.itemId,
                                    quantity: matchedRecipe.result.quantity,
                                });
                            }

                            await player.save();
                            client.emit("potionBrewed", message.author.id);

                            let successMsg = `You successfully brewed **${allItems[matchedRecipe.result.itemId].name}**!`;
                            await i.update({
                                embeds: [
                                    createSuccessEmbed("Success!", successMsg),
                                ],
                                components: [],
                            });
                        } else {
                            selectedIngredients.forEach((id) => {
                                const item = player.inventory.find(
                                    (i) => i.itemId === id,
                                );
                                if (item) {
                                    // Ensure item exists before decrementing
                                    item.quantity -= 1;
                                }
                            });
                            player.inventory = player.inventory.filter(
                                (item) => item.quantity > 0,
                            );

                            player.arcaneDust =
                                (player.arcaneDust || 0) +
                                selectedIngredients.length;
                            await player.save();

                            await i.update({
                                embeds: [
                                    createErrorEmbed(
                                        "Failure!",
                                        `The ingredients fizzled into a useless concoction. You salvaged **${selectedIngredients.length} Arcane Dust** from the failure.`,
                                    ),
                                ],
                                components: [],
                            });
                        }

                        activeBrewingSessions.delete(message.author.id);
                        messageCollector.stop();
                        return componentCollector.stop();
                    }
                }
            });

            const cleanupCollectors = () => {
                activeBrewingSessions.delete(message.author.id);
                messageCollector.stop();
                componentCollector.stop();
            };

            componentCollector.on("end", (collected, reason) => {
                if (reason === "time") {
                    reply
                        .edit({
                            embeds: [
                                createWarningEmbed(
                                    "Brewing Timed Out",
                                    "Your brewing session has expired.",
                                ),
                            ],
                            components: [],
                        })
                        .catch(() => {});
                }
                cleanupCollectors();
            });

            messageCollector.on("end", (collected, reason) => {
                if (reason === "time") {
                    cleanupCollectors();
                }
            });
        } catch (error) {
            console.error("Brew command error:", error);
            message.reply({
                embeds: [
                    createErrorEmbed(
                        "An Error Occurred",
                        "There was a problem starting your brewing session.",
                    ),
                ],
            });
        }
    },
};