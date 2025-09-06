const { createArgEmbed, createErrorEmbed, createSuccessEmbed, createWarningEmbed } = require('../../utils/embed');
const Pet = require('../../models/Pet');
const Player = require('../../models/Player');
const allItems = require('../../gamedata/items');
const { grantPalXp, calculateXpForNextLevel } = require('../../utils/leveling');

module.exports = {
    name: 'use',
    description: 'Use a potion from your inventory on one of your Pals.',
    usage: '<item_name> <pal_id>',
    async execute(message, args, client, prefix) {
        try {
            const player = await Player.findOne({ userId: message.author.id });
            if (!player) {
                return message.reply({ embeds: [ createErrorEmbed('No Adventure Started', `You haven't started your journey yet! Use \`${prefix}start\` to begin.`) ]});
            }

            if (args.length < 2) {
                return message.reply({ embeds: [ createArgEmbed(prefix, this.name, this.usage) ]});
            }

            const itemName = args[0].toLowerCase();
            const shortId = parseInt(args[1]);

            if (isNaN(shortId)) {
                return message.reply({ embeds: [ createWarningEmbed('Invalid Pal ID', 'The Pal ID must be a number.') ]});
            }

            // --- 1. Find the Pal ---
            const pal = await Pet.findOne({ ownerId: message.author.id, shortId });
            if (!pal) {
                return message.reply({ embeds: [ createWarningEmbed('Pal Not Found', `You don't own a Pal with the ID **#${shortId}**.`) ]});
            }

            // --- 2. Find the item in inventory ---
            const itemInInventory = player.inventory.find(i => i.itemId === itemName);
            if (!itemInInventory) {
                const itemData = allItems[itemName];
                const cleanItemName = itemData ? itemData.name : itemName.replace(/_/g, ' ');
                return message.reply({ embeds: [ createWarningEmbed('Item Not Found', `You don't have a **${cleanItemName}** in your inventory.`) ]});
            }

            const itemData = allItems[itemName];
            if (!itemData || itemData.type !== 'potion' || !itemData.usable) {
                return message.reply({ embeds: [ createWarningEmbed('Not Usable', `**${itemData.name}** is not a usable potion.`) ]});
            }

            // --- 3. Apply the item's effect ---
            const effect = itemData.effect;
            let successMessage = '';

            switch (effect.type) {
                case 'heal':
                    // Initialize currentHp if it's missing (for older Pals)
                    if (pal.currentHp === -1 || typeof pal.currentHp === 'undefined') {
                        pal.currentHp = pal.stats.hp;
                    }

                    if (pal.currentHp >= pal.stats.hp) {
                        return message.reply({ embeds: [ createWarningEmbed('Already at Full Health', `**${pal.nickname}** is already at full health!`) ]});
                    }

                    const healthBefore = pal.currentHp;
                    pal.currentHp = Math.min(pal.stats.hp, pal.currentHp + effect.value);
                    const healthHealed = pal.currentHp - healthBefore;
                    successMessage = `You used a **${itemData.name}** on **${pal.nickname}**, restoring **${healthHealed} HP**! (${pal.currentHp}/${pal.stats.hp})`;
                    break;
                
                case 'level_up':
                    const xpNeeded = calculateXpForNextLevel(pal.level) - pal.xp;
                    await grantPalXp(client, message, pal, xpNeeded + effect.value); // Add value to ensure level up
                    successMessage = `You used a **${itemData.name}** on **${pal.nickname}**! It grew stronger!`;
                    // The grantPalXp function will send its own level-up message.
                    break;

                // Add cases for other potion types like permanent stat boosts here in the future
                
                default:
                    return message.reply({ embeds: [ createWarningEmbed('Unknown Effect', `This potion's effect is not yet implemented.`) ]});
            }

            // --- 4. Decrement item from inventory ---
            itemInInventory.quantity -= 1;
            if (itemInInventory.quantity <= 0) {
                player.inventory = player.inventory.filter(i => i.itemId !== itemName);
            }

            // --- 5. Save and send confirmation ---
            await player.save();
            await pal.save();

            const successEmbed = createSuccessEmbed('Potion Used!', successMessage);
            await message.reply({ embeds: [successEmbed] });

        } catch (err) {
            console.error('Use command error:', err);
            message.reply({ embeds: [ createErrorEmbed('An Error Occurred', 'There was a problem using this item.') ]});
        }
    }
};