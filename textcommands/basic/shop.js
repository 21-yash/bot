const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Player = require('../../models/Player');
const { createErrorEmbed, createSuccessEmbed, createCustomEmbed } = require('../../utils/embed');
const allItems = require('../../gamedata/items');
const config = require('../../config/config.json');

// --- Shop Configuration ---
const SHOP_CONFIG = {
    dailyStockCount: 3,
    priceMultiplier: 5, // Items are 5x their base value in dust
    currency: 'arcaneDust',
    // Pool of common ingredients that can appear in the shop
    itemPool: [
        'moonpetal_herb',
        'crystal_shard',
        // Add other common ingredient IDs here
    ],
};
// -------------------------

// A simple pseudo-random generator that uses the date as a seed
function getDailyDeals() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    let rng = seed;

    const deals = [];
    const availableItems = [...SHOP_CONFIG.itemPool];
    
    for (let i = 0; i < SHOP_CONFIG.dailyStockCount; i++) {
        if (availableItems.length === 0) break;
        rng = (rng * 9301 + 49297) % 233280;
        const randomIndex = Math.floor(rng / 233280 * availableItems.length);
        const itemId = availableItems.splice(randomIndex, 1)[0];
        deals.push(itemId);
    }
    return deals;
}

module.exports = {
    name: 'shop',
    description: 'Visit the shop to spend your Arcane Dust on ingredients.',
    // ... other properties
    async execute(message, args, client, prefix) {
        try {
            const player = await Player.findOne({ userId: message.author.id });
            if (!player) {
                return message.reply({ embeds: [createErrorEmbed('No Adventure Started', `You haven't started your journey yet! Use \`${prefix}start\` to begin.`)] });
            }

            const dailyDeals = getDailyDeals();
            let shopDescription = 'Welcome to the shop! Here are today\'s deals. Prices are in Arcane Dust.\n\n';
            const buttons = new ActionRowBuilder();

            dailyDeals.forEach(itemId => {
                const item = allItems[itemId];
                const price = (item.rarity === 'Common' ? 10 : 20) * SHOP_CONFIG.priceMultiplier; // Simple pricing
                shopDescription += `> **${item.name}** - \`${price}\` Dust\n`;
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`buy_${itemId}`)
                        .setLabel(`Buy ${item.name}`)
                        .setStyle(ButtonStyle.Secondary)
                );
            });
            
            const shopEmbed = createCustomEmbed(
                '🔮 Alchemist\'s Shop',
                shopDescription,
                '#9B59B6', // A nice purple color
                {
                    footer: { text: `Your Arcane Dust: ${player.arcaneDust}` }
                }
            );

            const reply = await message.reply({ embeds: [shopEmbed], components: [buttons] });
            
            const collector = reply.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 3 * 60 * 1000, // 3 minutes
                componentType: ComponentType.Button
            });

            collector.on('collect', async i => {
                // --- FIX: Use substring to correctly get the full item ID ---
                const itemId = i.customId.substring('buy_'.length);
                const item = allItems[itemId];

                // Check if the item exists, just in case
                if (!item) {
                    console.error(`[Shop] Could not find item with ID: ${itemId}`);
                    return i.reply({ content: 'An error occurred with this item. It might be outdated.', ephemeral: true });
                }

                const price = (item.rarity === 'Common' ? 10 : 20) * SHOP_CONFIG.priceMultiplier;
                
                // We need to fetch the player again to get the most up-to-date dust amount
                const currentPlayer = await Player.findOne({ userId: i.user.id });

                if (currentPlayer.arcaneDust < price) {
                    return i.reply({ content: `You don't have enough Arcane Dust! You need ${price}.`, ephemeral: true });
                }

                currentPlayer.arcaneDust -= price;
                const existingItem = currentPlayer.inventory.find(invItem => invItem.itemId === itemId);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    currentPlayer.inventory.push({ itemId: itemId, quantity: 1 });
                }

                await currentPlayer.save();

                await i.reply({ content: `You successfully purchased 1x ${item.name} for ${price} Arcane Dust!`, ephemeral: true });

                // Update the shop embed with the new dust balance
                shopEmbed.setFooter({ text: `Your Arcane Dust: ${currentPlayer.arcaneDust}` });
                await reply.edit({ embeds: [shopEmbed] });
            });

            collector.on('end', () => {
                buttons.components.forEach(button => button.setDisabled(true));
                reply.edit({ components: [buttons] }).catch(() => {}); // Catch errors if the message was deleted
            });

        } catch (error) {
            console.error('Shop command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem opening the shop.')] });
        }
    }
};