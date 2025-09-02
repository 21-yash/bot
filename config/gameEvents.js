const { checkAchievements } = require('../utils/achievements');

/**
 * This handler registers listeners for custom game-related events.
 * It connects player actions to progression systems like achievements.
 * @param {import('discord.js').Client} client The Discord client instance.
 */
function initializeGameEventListeners(client) {
    console.log('[Game Events] Initializing listeners...');

    // --- FORAGE EVENT ---
    // Emitted whenever a player successfully completes a forage action.
    client.on('forage', (playerId) => {
        checkAchievements(client, playerId, 'forage');
    });

    // --- EGG HATCH EVENT ---
    // Emitted when a player successfully hatches an egg.
    client.on('eggHatch', (playerId) => {
        checkAchievements(client, playerId, 'eggHatch');
    });

    // --- DUNGEON CLEAR EVENT ---
    // Emitted when a player's Pal returns from a dungeon.
    client.on('dungeonClear', (playerId) => {
        checkAchievements(client, playerId, 'dungeonClear');
    });
    
    // --- POTION BREW EVENT ---
    // Emitted when a player successfully brews a potion.
    client.on('potionBrew', (playerId) => {
        checkAchievements(client, playerId, 'potionBrew');
    });

    console.log('[Game Events] Listeners initialized.');
}

module.exports = { initializeGameEventListeners };