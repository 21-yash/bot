const Player = require('../models/Player');

// --- Game Configuration ---
const STAMINA_REGEN_RATE = 1; // How much stamina is restored per interval.
const STAMINA_REGEN_INTERVAL_MINUTES = 2; // How many minutes it takes to restore the amount above.
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


const Pet = require('../models/Pet');

// --- Game Configuration ---
const HP_REGEN_RATE = 1; // How much HP is restored per interval
const HP_REGEN_INTERVAL_MINUTES = 2; // How many minutes it takes to restore the amount above
// -------------------------

/**
 * Calculates and restores a pet's HP based on the time elapsed since the last update.
 * This function should be called before any action that uses the pet.
 * @param {object} petDocument The Mongoose document for the pet.
 * @returns {Promise<object>} The updated pet document.
 */
async function restorePetHp(petDocument) {
    // Only heal if pet is injured and has currentHp set
    if (petDocument.status !== 'Injured' || petDocument.currentHp === null) {
        return petDocument;
    }

    const maxHp = petDocument.stats.hp;
    
    // If already at full health, set status back to Idle
    if (petDocument.currentHp >= maxHp) {
        petDocument.currentHp = null;
        petDocument.status = 'Idle';
        await petDocument.save();
        return petDocument;
    }

    const now = new Date();
    const timeDiffMinutes = (now - petDocument.lastInjuryUpdate) / (1000 * 60);

    if (timeDiffMinutes > 0) {
        const hpToRestore = Math.floor(timeDiffMinutes / HP_REGEN_INTERVAL_MINUTES) * HP_REGEN_RATE;

        if (hpToRestore > 0) {
            const oldHp = petDocument.currentHp;
            petDocument.currentHp = Math.min(maxHp, oldHp + hpToRestore);
            
            // Update timestamp by the amount of time that was "used up" for regeneration
            const minutesAccountedFor = Math.floor(timeDiffMinutes / HP_REGEN_INTERVAL_MINUTES) * HP_REGEN_INTERVAL_MINUTES;
            petDocument.lastInjuryUpdate = new Date(petDocument.lastInjuryUpdate.getTime() + minutesAccountedFor * 60000);

            // Check if fully healed
            if (petDocument.currentHp >= maxHp) {
                petDocument.currentHp = null;
                petDocument.status = 'Idle';
            }

            await petDocument.save();
        }
    }

    return petDocument;
}

/**
 * Heals a pet using a potion
 * @param {object} petDocument The Mongoose document for the pet
 * @param {number} healAmount The amount of HP to heal
 * @returns {Promise<object>} The updated pet document
 */
async function healPetWithPotion(petDocument, healAmount) {
    if (petDocument.status !== 'Injured' || petDocument.currentHp === null) {
        return petDocument;
    }

    const maxHp = petDocument.stats.hp;
    petDocument.currentHp = Math.min(maxHp, petDocument.currentHp + healAmount);
    
    // Check if fully healed
    if (petDocument.currentHp >= maxHp) {
        petDocument.currentHp = null;
        petDocument.status = 'Idle';
    }

    await petDocument.save();
    return petDocument;
}

module.exports = { restorePetHp, healPetWithPotion, restoreStamina };