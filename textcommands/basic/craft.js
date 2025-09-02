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

// Helper function to get a player's crafting materials
function getPlayerCraftingMaterials(player) {
    const materialTypes = ["crafting_material", "ingredient"]; // Allow both for flexibility
    return player.inventory
        .filter(
            (item) =>
                allItems[item.itemId] &&
                materialTypes.includes(allItems[item.itemId].type),
        )
        .map((item) => ({
            label: `${allItems[item.itemId].name} (x${item.quantity})`,
            value: item.itemId,
            description: allItems[item.itemId].description.substring(0, 100),
        }));
}

// Track active crafting sessions to prevent multiple interfaces
const activeCraftingSessions = new Set();

module.exports = {
    name: "craft",
    description: "Craft equipment and items at the workshop.",
    async execute(message, args, client, prefix) {
        try {
            // Check if user already has an active crafting session
            if (activeCraftingSessions.has(message.author.id)) {
                return message.reply({
                    embeds: [
                        createErrorEmbed(
                            "Already Crafting",
                            "You already have an active crafting session! Please finish or cancel it first.",
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

            const materials = getPlayerCraftingMaterials(player);
            if (materials.length === 0) {
                return message.reply({
                    embeds: [
                        createErrorEmbed(
                            "No Materials",
                            `You don't have any materials to craft with! Find them in dungeons.`,
                        ),
                    ],
                });
            }

            // Mark user as having an active session
            activeCraftingSessions.add(message.author.id);

            // --- Text Input Workshop UI ---
            let selectedMaterials = {}; // Track material quantities { itemId: quantity }

            const createWorkshopEmbed = () => {
                let description = `Enter materials in format: **quantity item_name, quantity item_name**\nExample: \`5 iron_ore, 3 crystal_shard\`\n`;

                if (Object.keys(selectedMaterials).length > 0) {
                    description += `\n**Selected Materials:**\n`;
                    Object.entries(selectedMaterials).forEach(
                        ([itemId, qty]) => {
                            description += `> ${allItems[itemId].name} x${qty}\n`;
                        },
                    );
                }

                return createInfoEmbed("Craftsman's Workshop", description, {
                    footer: {
                        text: 'Type your materials below, then click "Craft"',
                    },
                });
            };

            const createComponents = () => {
                const buttonRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("craft_confirm")
                        .setLabel("Craft")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("🔨")
                        .setDisabled(
                            Object.keys(selectedMaterials).length === 0,
                        ),
                    new ButtonBuilder()
                        .setCustomId("craft_clear")
                        .setLabel("Clear All")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(
                            Object.keys(selectedMaterials).length === 0,
                        ),
                    new ButtonBuilder()
                        .setCustomId("craft_cancel")
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger),
                );

                return [buttonRow];
            };

            const reply = await message.reply({
                embeds: [createWorkshopEmbed()],
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
                    activeCraftingSessions.delete(message.author.id);
                    await reply.edit({
                        embeds: [
                            createWarningEmbed(
                                "Crafting Cancelled",
                                "You have cleared the workbench.",
                            ),
                        ],
                        components: [],
                    });
                    messageCollector.stop();
                    componentCollector.stop();
                    return;
                }

                // Parse input like "5 iron_ore, 3 crystal_shard"
                const inputParts = m.content
                    .split(",")
                    .map((part) => part.trim());
                const newMaterials = {};
                let hasError = false;
                let errorMsg = "";

                for (const part of inputParts) {
                    const match = part.match(/^(\d+)\s+(.+)$/);
                    if (!match) {
                        errorMsg = `Invalid format: "${part}". Use format: quantity item_name`;
                        hasError = true;
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
                        errorMsg = `Item "${match[2]}" not found.`;
                        hasError = true;
                        break;
                    }

                    // Check if it's a crafting material
                    const materialTypes = ["crafting_material", "ingredient"];
                    if (!materialTypes.includes(allItems[itemId].type)) {
                        errorMsg = `"${allItems[itemId].name}" is not a crafting material.`;
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

                    newMaterials[itemId] = quantity;
                }

                if (hasError) {
                    await m.reply({
                        embeds: [createErrorEmbed("Invalid Input", errorMsg)],
                        allowedMentions: { repliedUser: false },
                    });
                    return;
                }

                selectedMaterials = newMaterials;
                await reply.edit({
                    embeds: [createWorkshopEmbed()],
                    components: createComponents(),
                });

                // Delete user's input message
                try {
                    await m.delete();
                } catch (e) {
                    // Ignore if can't delete
                }
            });

            componentCollector.on("collect", async (i) => {
                if (i.isButton()) {
                    if (i.customId === "craft_clear") {
                        selectedMaterials = {};
                        await i.update({
                            embeds: [createWorkshopEmbed()],
                            components: createComponents(),
                        });
                        return;
                    }

                    if (i.customId === "craft_cancel") {
                        activeCraftingSessions.delete(message.author.id);
                        await i.update({
                            embeds: [
                                createWarningEmbed(
                                    "Crafting Cancelled",
                                    "You have cleared the workbench.",
                                ),
                            ],
                            components: [],
                        });
                        componentCollector.stop();
                        return messageCollector.stop();
                    }

                    if (i.customId === "craft_confirm") {
                        const submittedCounts = selectedMaterials;

                        let matchedRecipe = null;
                        let matchedRecipeId = null;

                        for (const [recipeId, recipeData] of Object.entries(
                            allRecipes,
                        )) {
                            const resultItem =
                                allItems[recipeData.result.itemId];
                            if (!resultItem || resultItem.source !== "crafting")
                                continue; // Only check crafting recipes

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

                        if (matchedRecipe) {
                            player.stats.itemsCrafted =
                                (player.stats.itemsCrafted || 0) + 1;
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
                                item.quantity -= ing.quantity;
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
                            client.emit("itemCraft", message.author.id); // For achievements

                            let successMsg = `You successfully crafted **${allItems[matchedRecipe.result.itemId].name}**!`;

                            await i.update({
                                embeds: [
                                    createSuccessEmbed("Success!", successMsg),
                                ],
                                components: [],
                            });
                        } else {
                            selectedMaterials.forEach((id) => {
                                const item = player.inventory.find(
                                    (i) => i.itemId === id,
                                );
                                if (item) item.quantity -= 1;
                            });
                            player.inventory = player.inventory.filter(
                                (item) => item.quantity > 0,
                            );

                            await player.save();

                            await i.update({
                                embeds: [
                                    createErrorEmbed(
                                        "Failure!",
                                        `The materials broke apart during crafting. You salvaged **${selectedMaterials.length} Scrap** from the failure.`,
                                    ),
                                ],
                                components: [],
                            });
                        }

                        activeCraftingSessions.delete(message.author.id);
                        messageCollector.stop();
                        return componentCollector.stop();
                    }
                }
            });

            const cleanupCollectors = () => {
                activeCraftingSessions.delete(message.author.id);
                messageCollector.stop();
                componentCollector.stop();
            };

            componentCollector.on("end", (collected, reason) => {
                if (reason === "time") {
                    reply
                        .edit({
                            embeds: [
                                createWarningEmbed(
                                    "Crafting Timed Out",
                                    "Your crafting session has expired.",
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
            console.error("Craft command error:", error);
            message.reply({
                embeds: [
                    createErrorEmbed(
                        "An Error Occurred",
                        "There was a problem starting your crafting session.",
                    ),
                ],
            });
        }
    },
};
