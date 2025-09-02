const Player = require('../models/Player');
const allAchievements = require('../gamedata/achievement');
const { createSuccessEmbed } = require('./embed');

/**
 * Checks and unlocks achievements for a player based on a specific event type.
 * @param {import('discord.js').Client} client The Discord client instance.
 * @param {string} playerId The Discord ID of the player.
 * @param {string} eventType The type of event that was triggered (e.g., 'forage', 'eggHatch').
 */
async function checkAchievements(client, playerId, eventType) {
    try {
        
        const player = await Player.findOne({ userId: playerId });
        if (!player) return;

        const achievementsToAnalyse = allAchievements.filter(a => a.condition.type === eventType);

        for (const achievement of achievementsToAnalyse) {

            const statValue = player.stats[`${eventType}Count`] || 0;
            
            const isAlreadyUnlocked = player.achievements.includes(achievement.id);

            if (statValue >= achievement.condition.count && !isAlreadyUnlocked) {
                
                player.achievements.push(achievement.id);

                if (achievement.reward?.xp) {
                    player.xp += achievement.reward.xp;
                    // xp function to add
                }
                if (achievement.reward?.item) {

                    const itemInInventory = player.inventory.find(i => i.itemId === achievement.reward.item);
                    if (itemInInventory) {
                        itemInInventory.quantity += 1;
                    } else {
                        player.inventory.push({ itemId: achievement.reward.item, quantity: 1 });
                    }
                }

                await player.save();

                const user = await client.users.fetch(playerId).catch(() => null);
                if (user) {
                    const achievementEmbed = createSuccessEmbed(
                        '🏆 Achievement Unlocked!',
                        `**${achievement.name}**\n*${achievement.description}*`
                    );
                    user.send({ embeds: [achievementEmbed] }).catch(() => {}); // Catch if DMs are closed
                }
            }
        }
    } catch (error) {
        console.error(`[Achievements] Error checking achievements for ${playerId}:`, error);
    }
}

module.exports = { checkAchievements };