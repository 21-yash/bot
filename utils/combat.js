const allMonsters = require('../gamedata/monsters');

/**
 * Converts a Roman numeral string to an integer.
 * @param {string} roman The Roman numeral (e.g., 'I', 'IV').
 * @returns {number} The integer value.
 */
function romanToInt(roman) {
    const romanMap = { 'I': 1, 'V': 5, 'X': 10 };
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const currentVal = romanMap[roman[i]];
        const nextVal = romanMap[roman[i + 1]];
        if (nextVal > currentVal) {
            total -= currentVal;
        } else {
            total += currentVal;
        }
    }
    return total;
}

/**
 * Simulates a turn-based battle between a Pal and a monster.
 * @param {object} pal The player's Pal document from the database.
 * @param {object} enemy The generated enemy object with scaled stats.
 * @returns {object} An object containing the battle result and a detailed log.
 */
function simulateBattle(pal, enemy) {
    let palCurrentHp = pal.stats.hp;
    let enemyCurrentHp = enemy.stats.hp;
    const battleLog = [];
    let turn = 0;

    const calculateDamage = (attacker, defender) => {
        const damage = Math.max(1, Math.floor(attacker.atk - (defender.def / 2)));
        return damage;
    };

    while (palCurrentHp > 0 && enemyCurrentHp > 0) {
        turn++;
        battleLog.push(`\n**--- Turn ${turn} ---**`);

        const palDamage = calculateDamage(pal.stats, enemy.stats);
        enemyCurrentHp -= palDamage;
        battleLog.push(`> Your **${pal.nickname}** attacks, dealing **${palDamage}** damage!`);
        if (enemyCurrentHp <= 0) {
            battleLog.push(`> The **${enemy.name}** has been defeated!`);
            break;
        }
        battleLog.push(`> *${enemy.name} HP: ${enemyCurrentHp}/${enemy.stats.hp}*`);

        const enemyDamage = calculateDamage(enemy.stats, pal.stats);
        palCurrentHp -= enemyDamage;
        battleLog.push(`> The **${enemy.name}** retaliates, dealing **${enemyDamage}** damage!`);
        if (palCurrentHp <= 0) {
            battleLog.push(`> Your **${pal.nickname}** has been defeated!`);
            break;
        }
        battleLog.push(`> *${pal.nickname} HP: ${palCurrentHp}/${pal.stats.hp}*`);

        if (turn > 50) {
            battleLog.push('The battle is a stalemate and both combatants retreat.');
            break;
        }
    }

    return {
        playerWon: palCurrentHp > 0,
        log: battleLog.join('\n'),
        remainingHp: Math.max(0, palCurrentHp)
    };
}

/**
 * Generates scaled stats for a specific enemy based on the dungeon floor.
 * @param {object} dungeon The dungeon data.
 * @param {number} floor The current floor number.
 * @param {boolean} isBoss Whether to generate the boss monster.
 * @returns {object} An object containing the enemy's name and scaled stats.
 */
function generateEnemy(dungeon, floor, isBoss = false) {
    const enemyId = isBoss ? dungeon.boss : dungeon.enemyPool[Math.floor(Math.random() * dungeon.enemyPool.length)];
    const enemyBase = allMonsters[enemyId];

    // Convert the Roman numeral tier to an integer for calculations
    const tierValue = romanToInt(dungeon.tier);
    const scaleFactor = 1 + (0.2 * (floor - 1)) + (0.1 * tierValue);

    return {
        name: enemyBase.name,
        stats: {
            hp: Math.round(enemyBase.baseStats.hp * scaleFactor),
            atk: Math.round(enemyBase.baseStats.atk * scaleFactor),
            def: Math.round(enemyBase.baseStats.def * scaleFactor),
        }
    };
}

const allItems = require('../gamedata/items');

/**
 * Calculates the final rewards for a specific floor of a dungeon.
 * @param {object} dungeon The dungeon data from gamedata/dungeons.js.
 * @param {number} floor The current floor number the player has cleared.
 * @returns {object} An object containing the calculated gold, xp, loot, and egg.
 */
function generateDungeonRewards(dungeon, floor) {
    // Get the base rewards from the dungeon data
    const { baseRewards, scaleFactors, floors, guaranteedReward } = dungeon;
    const { gold, xp, lootTable, eggTable } = baseRewards;

    // Scale gold and xp with dungeon multipliers
    const gold1 = Math.floor(
        (Math.random() * (gold[1] - gold[0]) + gold[0]) * Math.pow(scaleFactors.gold, floor - 1)
    );

    const xp1 = Math.floor(
        (Math.random() * (xp[1] - xp[0]) + xp[0]) * Math.pow(scaleFactors.xp, floor - 1)
    );

    // Loot chances increase with floor
    const loot = (lootTable || []).map(item => {
        if (Math.random() < item.baseChance * Math.pow(scaleFactors.lootChance, floor - 1)) {
            return {
                itemId: item.itemId,
                quantity: Math.floor(Math.random() * (item.quantityRange[1] - item.quantityRange[0] + 1)) + item.quantityRange[0]
            };
        }
        return null;
    }).filter(item => item !== null); // Remove items that didn't drop

    // Eggs (if dungeon has them)
    const eggDrop = (eggTable || []).find(e => Math.random() < e.chance * Math.pow(scaleFactors.lootChance, floor - 1));

    // Add the guaranteed reward only on the final floor
    if (floor === floors && guaranteedReward) {
        loot.push(guaranteedReward);
    }

    return {
        gold1,
        xp1,
        loot,
        egg: eggDrop ? { itemId: eggDrop.itemId, quantity: 1 } : null,
    };
}


module.exports = { simulateBattle, generateEnemy, generateDungeonRewards };