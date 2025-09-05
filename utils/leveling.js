const Player = require('../models/Player');
const Pet = require('../models/Pet');
const allPals = require('../gamedata/pets');
const { createInfoEmbed } = require('./embed');

/**
 * Calculates the total XP required to reach a certain level using a scaling formula.
 * @param {number} level The target level.
 * @returns {number} The total XP needed for that level.
 */
function calculateXpForNextLevel(level) {
    // New Formula: 100 * (level ^ 1.5)
    // This makes leveling up progressively harder.
    const baseXP = 50;
    const exponent = 1.5;
    return Math.floor(baseXP * Math.pow(level, exponent));
}

/**
 * Handles XP gain and potential level-ups for a Player (Alchemist).
 * @param {import('discord.js').Client} client The Discord client.
 * @param {import('discord.js').Message} message The message that triggered the action.
 * @param {string} userId The ID of the user gaining XP.
 * @param {number} xpGained The amount of XP to grant.
 */
async function grantPlayerXp(client, message, userId, xpGained) {
    const player = await Player.findOne({ userId });
    if (!player) return;

    player.xp += xpGained;

    let xpNeeded = calculateXpForNextLevel(player.level);
    let leveledUp = false;

    while (player.xp >= xpNeeded) {
        player.level++;
        player.xp -= xpNeeded;
        leveledUp = true;
        xpNeeded = calculateXpForNextLevel(player.level);

        player.maxStamina += 10;

        // Announce the level up
        const levelUpEmbed = createInfoEmbed(
            '🎉 Alchemist Level Up!',
            `Congratulations, you are now **Level ${player.level}**!`
        ).setThumbnail(message.author.displayAvatarURL());
        await message.channel.send({ embeds: [levelUpEmbed] });
    }

    await player.save();
    return leveledUp;
}

/**
 * Handles XP gain and potential level-ups for a Pal.
 * @param {import('discord.js').Client} client The Discord client.
 * @param {import('discord.js').Message} message The message that triggered the action.
 * @param {object} palDocument The Mongoose document for the Pal gaining XP.
 * @param {number} xpGained The amount of XP to grant.
 */
async function grantPalXp(client, message, palDocument, xpGained) {
    palDocument.xp += xpGained;

    let xpNeeded = calculateXpForNextLevel(palDocument.level);
    let leveledUp = false;

    while (palDocument.xp >= xpNeeded) {
        palDocument.level++;
        palDocument.xp -= xpNeeded;
        leveledUp = true;
        
        // Apply stat gains
        const basePal = allPals[palDocument.basePetId];
        if (basePal && basePal.statGrowth) {
            palDocument.stats.hp += basePal.statGrowth.hp;
            palDocument.stats.atk += basePal.statGrowth.atk;
            palDocument.stats.def += basePal.statGrowth.def;
            palDocument.stats.spd += basePal.statGrowth.spd;
            palDocument.stats.luck += basePal.statGrowth.luck;
        }

        xpNeeded = calculateXpForNextLevel(palDocument.level);

        // Announce the level up
        const levelUpEmbed = createInfoEmbed(
            `🐾 Your ${palDocument.nickname} Leveled Up!`,
            `It is now **Level ${palDocument.level}**!`
        );
        await message.channel.send({ embeds: [levelUpEmbed] });

        // Check for evolution
        if (basePal.evolution && palDocument.level >= basePal.evolution.level) {
            const evolutionData = allPals[basePal.evolution.evolvesTo];
            const oldName = palDocument.nickname;
            
            palDocument.basePetId = basePal.evolution.evolvesTo;
            palDocument.nickname = evolutionData.name; // Update nickname to new species name
            palDocument.stats = evolutionData.baseSats;
            
            const evolutionEmbed = createInfoEmbed(
                `✨ What's this? Your ${oldName} is evolving! ✨`,
                `Congratulations! Your Pal evolved into a **${evolutionData.name}**!`
            );
            await message.channel.send({ embeds: [evolutionEmbed] });
        }
    }

    await palDocument.save();
    return leveledUp;
}


module.exports = { grantPlayerXp, grantPalXp, calculateXpForNextLevel };