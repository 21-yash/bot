const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    StringSelectMenuBuilder,
} = require("discord.js");
const Player = require("../../models/Player");
const {
    createErrorEmbed,
    createSuccessEmbed,
    createCustomEmbed,
} = require("../../utils/embed");
const allItems = require("../../gamedata/items");
const config = require("../../config/config.json");

// --- Shop Configuration ---
const SHOP_CONFIG = {
    dailyStockCount: 3,
    dailyScrollCount: 5,
    priceMultiplier: 3n, // Items are 5x their base value in dust
    currency: "arcaneDust",
    // Pool of common ingredients that can appear in the shop
    itemPool: [
        "moonpetal_herb",
        "crystal_shard",
        "scrap_metal",
        "silver_leaf",
        "ember_moss",
        "wind_crystal",
        "feathered_plume",
        "oil_essence",
        "gear_component",
    ],
};

// --- Recipe Scroll Configuration ---
const RECIPE_SCROLLS = {
    // Potion scrolls
    scroll_minor_healing: {
        name: "Scroll of Minor Healing Recipe",
        recipeId: "recipe_minor_healing",
        price: 150,
        description: "Unlocks the recipe for Minor Healing Potion",
    },
    scroll_elixir_strength: {
        name: "Scroll of Strength Elixir Recipe",
        recipeId: "recipe_elixir_strength",
        price: 300,
        description: "Unlocks the recipe for Elixir of Strength",
    },
    scroll_mana_draught: {
        name: "Scroll of Mana Draught Recipe",
        recipeId: "recipe_mana_draught",
        price: 250,
        description: "Unlocks the recipe for Mana Draught",
    },
    scroll_greater_healing: {
        name: "Scroll of Greater Healing Recipe",
        recipeId: "recipe_greater_healing",
        price: 500,
        description: "Unlocks the recipe for Greater Healing Potion",
    },
    scroll_storm_elixir: {
        name: "Scroll of Storm Elixir Recipe",
        recipeId: "recipe_storm_elixir",
        price: 750,
        description: "Unlocks the recipe for Storm Elixir",
    },
    // Equipment scrolls
    scroll_wooden_sword: {
        name: "Scroll of Wooden Sword Recipe",
        recipeId: "recipe_wooden_sword",
        price: 200,
        description: "Unlocks the recipe for Wooden Sword",
    },
    scroll_iron_sword: {
        name: "Scroll of Iron Sword Recipe",
        recipeId: "recipe_iron_sword",
        price: 500,
        description: "Unlocks the recipe for Iron Sword",
    },
    scroll_bronze_sword: {
        name: "Scroll of Bronze Sword Recipe",
        recipeId: "recipe_bronze_sword",
        price: 300,
        description: "Unlocks the recipe for Iron Sword",
    },
    scroll_enchanted_charm: {
        name: "Scroll of Enchanted Charm Recipe",
        recipeId: "recipe_enchanted_charm",
        price: 400,
        description: "Unlocks the recipe for Enchanted Charm",
    },
    scroll_alchemical_incubator: {
        name: "Scroll of Alchemical Incubator Recipe",
        recipeId: "recipe_alchemical_incubator",
        price: 100,
        description: "Unlocks the recipe for incubator",
    },
    scroll_breeding_pen: {
        name: "Scroll of Breeding Pen Recipe",
        recipeId: "recipe_breeding_pen",
        price: 500,
        description: "Unlocks the recipe for Breeding Pen",
    },
};

// A simple pseudo-random generator that uses the date as a seed
function getDailyDeals() {
    const today = new Date();
    const seed =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate();
    let rng = seed;

    const deals = [];
    const availableItems = [...SHOP_CONFIG.itemPool];

    for (let i = 0; i < SHOP_CONFIG.dailyStockCount; i++) {
        if (availableItems.length === 0) break;
        rng = (rng * 9301 + 49297) % 233280;
        const randomIndex = Math.floor((rng / 233280) * availableItems.length);
        const itemId = availableItems.splice(randomIndex, 1)[0];
        deals.push(itemId);
    }
    return deals;
}

function getDailyScrolls() {
    const today = new Date();
    const seed =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate() +
        1000; // Different seed
    let rng = seed;

    const scrolls = [];
    const availableScrolls = Object.keys(RECIPE_SCROLLS);

    for (
        let i = 0;
        i < SHOP_CONFIG.dailyScrollCount && availableScrolls.length > 0;
        i++
    ) {
        rng = (rng * 9301 + 49297) % 233280;
        const randomIndex = Math.floor(
            (rng / 233280) * availableScrolls.length,
        );
        const scrollId = availableScrolls.splice(randomIndex, 1)[0];
        scrolls.push(scrollId);
    }
    return scrolls;
}

module.exports = {
    name: "shop",
    description: "Visit the shop to spend your Arcane Dust on ingredients.",
    async execute(message, args, client, prefix) {
        try {
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

            const dailyDeals = getDailyDeals();
            const dailyScrolls = getDailyScrolls();

            let shopDescription =
                "Welcome to the shop! Here are today's deals and recipe scrolls.\n\n";
            shopDescription += "**📜 Daily Ingredients** *(Arcane Dust)*\n";

            dailyDeals.forEach((itemId) => {
                const item = allItems[itemId];
                const price =
                    (item.rarity === "Common" ? 10 : 20) *
                    SHOP_CONFIG.priceMultiplier;
                shopDescription += `> **${item.name}** - \`${price}\` Dust\n`;
            });

            shopDescription += "\n**📚 Daily Recipe Scrolls** *(Gold)*\n";

            // Show today's scrolls (only ones player doesn't know yet)
            const availableScrolls = dailyScrolls.filter((scrollId) => {
                const scroll = RECIPE_SCROLLS[scrollId];
                return (
                    !player.grimoire.includes(scroll.recipeId) &&
                    !player.craftingJournal.includes(scroll.recipeId)
                );
            });

            availableScrolls.forEach((scrollId) => {
                const scroll = RECIPE_SCROLLS[scrollId];
                shopDescription += `> **${scroll.name}** - \`${scroll.price}\` Gold\n`;
            });

            if (availableScrolls.length === 0) {
                shopDescription +=
                    "> *No new recipes available today - you know them all or check back tomorrow!*\n";
            }

            const shopEmbed = createCustomEmbed(
                "🔮 Alchemist's Shop",
                shopDescription,
                "#9B59B6",
                {
                    footer: {
                        text: `Arcane Dust: ${player.arcaneDust} | Gold: ${player.gold} | Stock refreshes daily!`,
                    },
                },
            );

            const components = [];

            // Create ingredient select menu
            if (dailyDeals.length > 0) {
                const ingredientOptions = dailyDeals.map((itemId) => {
                    const item = allItems[itemId];
                    const price =
                        (item.rarity === "Common" ? 10 : 20) *
                        SHOP_CONFIG.priceMultiplier;
                    return {
                        label: `${item.name} - ${price} Dust`,
                        description: item.description.substring(0, 100),
                        value: `ingredient_${itemId}`,
                    };
                });

                const ingredientMenu = new StringSelectMenuBuilder()
                    .setCustomId("shop_ingredient_select")
                    .setPlaceholder("Select an ingredient to purchase...")
                    .addOptions(ingredientOptions);

                components.push(
                    new ActionRowBuilder().addComponents(ingredientMenu),
                );
            }

            // Create scroll select menu
            if (availableScrolls.length > 0) {
                const scrollOptions = availableScrolls.map((scrollId) => {
                    const scroll = RECIPE_SCROLLS[scrollId];
                    return {
                        label: `${scroll.name} - ${scroll.price} Gold`,
                        description: scroll.description.substring(0, 100),
                        value: `scroll_${scrollId}`,
                    };
                });

                const scrollMenu = new StringSelectMenuBuilder()
                    .setCustomId("shop_scroll_select")
                    .setPlaceholder("Select a recipe scroll to purchase...")
                    .addOptions(scrollOptions);

                components.push(
                    new ActionRowBuilder().addComponents(scrollMenu),
                );
            }

            const reply = await message.reply({
                embeds: [shopEmbed],
                components,
            });

            // Create collector for select menus only
            const selectCollector = reply.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id && i.isStringSelectMenu(),
                time: 3 * 60 * 1000, // 3 minutes
            });

            // Handle select menu interactions
            selectCollector.on("collect", async (i) => {
                const selectedValue = i.values[0];

                if (selectedValue.startsWith("ingredient_")) {
                    // Handle ingredient purchases
                    const itemId = selectedValue.substring("ingredient_".length);
                    const item = allItems[itemId];

                    if (!item) {
                        console.error(`[Shop] Could not find item with ID: ${itemId}`);
                        return i.reply({
                            content: "An error occurred with this item. It might be outdated.",
                            ephemeral: true,
                        });
                    }

                    const price = (item.rarity === "Common" ? 10 : 20) * SHOP_CONFIG.priceMultiplier;

                    // Create confirmation embed
                    const confirmEmbed = createCustomEmbed(
                        "💰 Purchase Confirmation",
                        `Are you sure you want to buy **${item.name}** for **${price} Arcane Dust**?`,
                        "#F39C12",
                    );

                    const confirmButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`confirm_buy_${itemId}`)
                            .setLabel("Yes, Buy It!")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId("cancel_purchase")
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Secondary),
                    );

                    await i.reply({
                        embeds: [confirmEmbed],
                        components: [confirmButtons],
                    });
                    const confirmMessage = await i.fetchReply();
                    // Create button collector for this specific confirmation
                    const buttonCollector = confirmMessage.createMessageComponentCollector({
                        filter: (buttonInteraction) => buttonInteraction.user.id === message.author.id,
                        time: 60 * 1000, // 1 minute for confirmation
                    });

                    buttonCollector.on("collect", async (buttonInteraction) => {
                        if (buttonInteraction.customId === "cancel_purchase") {
                            return buttonInteraction.update({
                                embeds: [
                                    createCustomEmbed(
                                        "Purchase Cancelled",
                                        "You decided not to make the purchase.",
                                        "#95A5A6",
                                    ),
                                ],
                                components: [],
                            });
                        }

                        if (buttonInteraction.customId === `confirm_buy_${itemId}`) {
                            const currentPlayer = await Player.findOne({
                                userId: buttonInteraction.user.id,
                            });

                            if (currentPlayer.arcaneDust < price) {
                                return buttonInteraction.update({
                                    embeds: [
                                        createErrorEmbed(
                                            "Insufficient Funds",
                                            `You don't have enough Arcane Dust! You need ${price}.`,
                                        ),
                                    ],
                                    components: [],
                                });
                            }

                            currentPlayer.arcaneDust -= price;
                            const existingItem = currentPlayer.inventory.find(
                                (invItem) => invItem.itemId === itemId,
                            );
                            if (existingItem) {
                                existingItem.quantity += 1;
                            } else {
                                currentPlayer.inventory.push({
                                    itemId: itemId,
                                    quantity: 1,
                                });
                            }

                            await currentPlayer.save();

                            await buttonInteraction.update({
                                embeds: [
                                    createSuccessEmbed(
                                        "Purchase Complete!",
                                        `You successfully purchased 1x **${item.name}** for ${price} Arcane Dust!`,
                                    ),
                                ],
                                components: [],
                            });

                            // Update the main shop embed footer
                            shopEmbed.setFooter({
                                text: `Arcane Dust: ${currentPlayer.arcaneDust} | Gold: ${currentPlayer.gold} | Stock refreshes daily!`,
                            });
                            await reply.edit({ embeds: [shopEmbed] });
                        }
                    });

                } else if (selectedValue.startsWith("scroll_")) {
                    // Handle scroll purchases
                    const scrollId = selectedValue.substring("scroll_".length);
                    const scroll = RECIPE_SCROLLS[scrollId];

                    if (!scroll) {
                        return i.reply({
                            content: "An error occurred with this scroll.",
                            ephemeral: true,
                        });
                    }

                    // Create confirmation embed
                    const confirmEmbed = createCustomEmbed(
                        "📜 Recipe Scroll Purchase",
                        `Are you sure you want to buy **${scroll.name}** for **${scroll.price} Gold**?\n\n*${scroll.description}*`,
                        "#E67E22",
                    );

                    const confirmButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`confirm_scroll_${scrollId}`)
                            .setLabel("Yes, Buy It!")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId("cancel_purchase")
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Secondary),
                    );

                    await i.reply({
                        embeds: [confirmEmbed],
                        components: [confirmButtons],
                    });
                    const confirmMessage = await i.fetchReply();
                    // Create button collector for this specific confirmation
                    const buttonCollector = confirmMessage.createMessageComponentCollector({
                        filter: (buttonInteraction) => buttonInteraction.user.id === message.author.id,
                        time: 60 * 1000, // 1 minute for confirmation
                    });

                    buttonCollector.on("collect", async (buttonInteraction) => {
                        if (buttonInteraction.customId === "cancel_purchase") {
                            return buttonInteraction.update({
                                embeds: [
                                    createCustomEmbed(
                                        "Purchase Cancelled",
                                        "You decided not to make the purchase.",
                                        "#95A5A6",
                                    ),
                                ],
                                components: [],
                            });
                        }

                        if (buttonInteraction.customId === `confirm_scroll_${scrollId}`) {
                            const currentPlayer = await Player.findOne({
                                userId: buttonInteraction.user.id,
                            });

                            if (currentPlayer.gold < scroll.price) {
                                return buttonInteraction.update({
                                    embeds: [
                                        createErrorEmbed(
                                            "Insufficient Funds",
                                            `You don't have enough Gold! You need ${scroll.price}.`,
                                        ),
                                    ],
                                    components: [],
                                });
                            }

                            if (
                                currentPlayer.grimoire.includes(scroll.recipeId) ||
                                currentPlayer.craftingJournal.includes(scroll.recipeId)
                            ) {
                                return buttonInteraction.update({
                                    embeds: [
                                        createErrorEmbed(
                                            "Recipe Already Known",
                                            "You already know this recipe!",
                                        ),
                                    ],
                                    components: [],
                                });
                            }

                            currentPlayer.gold -= scroll.price;

                            const recipes = require("../../gamedata/recipes");
                            const recipe = recipes[scroll.recipeId];
                            const resultItem = allItems[recipe.result.itemId];

                            if (resultItem.type === "potion") {
                                currentPlayer.grimoire.push(scroll.recipeId);
                            } else {
                                currentPlayer.craftingJournal.push(scroll.recipeId);
                            }

                            await currentPlayer.save();

                            await buttonInteraction.update({
                                embeds: [
                                    createSuccessEmbed(
                                        "Recipe Learned!",
                                        `You purchased **${scroll.name}** for ${scroll.price} Gold!\n\nYou can now craft **${resultItem.name}**!`,
                                    ),
                                ],
                                components: [],
                            });

                            // Update the main shop embed footer
                            shopEmbed.setFooter({
                                text: `Arcane Dust: ${currentPlayer.arcaneDust} | Gold: ${currentPlayer.gold} | Stock refreshes daily!`,
                            });
                            await reply.edit({ embeds: [shopEmbed] });
                        }
                    });
                }
            });

            // Handle collector end event
            selectCollector.on("end", () => {
                components.forEach((row) => {
                    row.components.forEach((component) => component.setDisabled(true));
                });
                reply.edit({ components: components }).catch(() => {});
            });

        } catch (error) {
            console.error("Shop command error:", error);
            message.reply({
                embeds: [
                    createErrorEmbed(
                        "An Error Occurred",
                        "There was a problem opening the shop.",
                    ),
                ],
            });
        }
    },
};