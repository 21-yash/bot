const Player = require('../models/Player');

// --- Game Configuration ---
const STAMINA_REGEN_RATE = 1; // How much stamina is restored per interval.
const STAMINA_REGEN_INTERVAL_MINUTES = 5; // How many minutes it takes to restore the amount above.
// -------------------------

/**
 * Calculates and restores a player's stamina based on the time elapsed since the last update.
 * This function should be called before any action that uses stamina.
 * @param {object} playerDocument The Mongoose document for the player.
 * @returns {Promise<object>} The updated player document.
 */
async function restoreStamina(playerDocument) {
    const now = new Date();
    const timeDiffMinutes = (now - playerDocument.lastStaminaUpdate) / (1000 * 60);

    // Only proceed if the player is not already at max stamina
    if (playerDocument.stamina < playerDocument.maxStamina && timeDiffMinutes > 0) {
        const staminaToRestore = Math.floor(timeDiffMinutes / STAMINA_REGEN_INTERVAL_MINUTES) * STAMINA_REGEN_RATE;

        if (staminaToRestore > 0) {
            const oldStamina = playerDocument.stamina;
            playerDocument.stamina = Math.min(playerDocument.maxStamina, oldStamina + staminaToRestore);
            
            // Important: We only update the timestamp by the amount of time that was "used up" for regeneration.
            // This prevents losing fractional minutes of regeneration time.
            const minutesAccountedFor = Math.floor(timeDiffMinutes / STAMINA_REGEN_INTERVAL_MINUTES) * STAMINA_REGEN_INTERVAL_MINUTES;
            playerDocument.lastStaminaUpdate = new Date(playerDocument.lastStaminaUpdate.getTime() + minutesAccountedFor * 60000);

            await playerDocument.save();
        }
    }

    return playerDocument;
}

module.exports = { restoreStamina };