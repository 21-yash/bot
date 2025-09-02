module.exports = {
    'whispering_woods_path': {
        name: 'Whispering Woods Path',
        tier: 'I',
        floors: 20,
        durationMinutes: 10,
        staminaCost: 20,
        levelRequirement: 1,
        enemyPool: ['crypt_bat', 'skeletal_warrior'],
        boss: 'grave_golem',
        baseRewards: {
            gold: [20, 50],
            xp: [10, 25],
            lootTable: [
                { itemId: 'moonpetal_herb', baseChance: 0.8, quantityRange: [1, 3] },
                { itemId: 'beast_hide', baseChance: 0.3, quantityRange: [1, 2] }
            ],
            eggTable: [
                { itemId: 'common_beast_egg', chance: 0.10 }, // 10% chance
                { itemId: 'uncommon_elemental_egg', chance: 0.03 } // 3% chance
            ]
        },
        scaleFactors: { gold: 1.05, xp: 1.04, lootChance: 1.02 },
        guaranteedReward: { itemId: 'whispering_bloom', quantity: 1 }
    },

    'sunken_crypts': {
        name: 'The Sunken Crypts',
        tier: 'II',
        floors: 15,
        durationMinutes: 30,
        staminaCost: 40,
        levelRequirement: 8,
        enemyPool: ['lava_serpent', 'fire_elemental'],
        boss: 'molten_titan',
        baseRewards: {
            gold: [100, 250],
            xp: [50, 100],
            lootTable: [
                { itemId: 'crystal_shard', baseChance: 0.7, quantityRange: [2, 5] },
                { itemId: 'iron_ore', baseChance: 0.5, quantityRange: [3, 6] },
            ],
            eggTable: [ // <<< NEW PROPERTY
                { itemId: 'uncommon_mystic_egg', chance: 0.10 }, // 10% chance
                { itemId: 'uncommon_undead_egg', chance: 0.03 } // 3% chance
            ]
        },
        scaleFactors: { gold: 1.06, xp: 1.05, lootChance: 1.03 },
        guaranteedReward: { itemId: 'ancient_coin', quantity: 1 }
    },

    'molten_caverns': {
        name: 'Molten Caverns',
        tier: 'III',
        floors: 25,
        durationMinutes: 45,
        staminaCost: 60,
        levelRequirement: 15,
        enemyPool: ['lava_serpent', 'fire_elemental'],
        boss: 'molten_titan',
        baseRewards: {
            gold: [200, 400],
            xp: [100, 200],
            lootTable: [
                { itemId: 'fire_essence', baseChance: 0.6, quantityRange: [1, 2] },
                { itemId: 'lava_gem', baseChance: 0.3, quantityRange: [1, 1] }
            ],
            eggTable: [ // <<< NEW PROPERTY
                { itemId: 'rare_mystic_egg', chance: 0.03 }, // 10% chance
                { itemId: 'rare_beast_egg', chance: 0.03 },
                { itemId: 'rare_mechanical_egg', chance: 0.03 } // 3% chance
            ]
        },
        scaleFactors: { gold: 1.07, xp: 1.06, lootChance: 1.04 },
        guaranteedReward: { itemId: 'molten_core', quantity: 1 }
    },

    'cavern_of_echoes': {
        name: 'Cavern of Echoes',
        tier: 'III',
        floors: 7,
        durationMinutes: 45,
        staminaCost: 60,
        levelRequirement: 15,
        enemyPool: ['echo_shade', 'crystal_guardian'],
        boss: 'spirit_wraith',
        baseRewards: {
            gold: [200, 400],
            xp: [80, 160],
            lootTable: [
                { itemId: 'echo_crystal', baseChance: 0.6, quantityRange: [1, 3] },
                { itemId: 'iron_ore', baseChance: 0.5, quantityRange: [2, 4] },
                { itemId: 'moonpetal_herb', baseChance: 0.4, quantityRange: [1, 2] },
                { itemId: 'spirit_dust', baseChance: 0.1, quantityRange: [1, 1] }
            ]
        },
        scaleFactors: { gold: 1.07, xp: 1.06, lootChance: 1.03 },
        guaranteedReward: { itemId: 'echo_core', quantity: 1 }
    },

    'frozen_peak': {
        name: 'Frozen Peak',
        tier: 'III',
        floors: 30,
        durationMinutes: 50,
        staminaCost: 70,
        levelRequirement: 18,
        enemyPool: ['frost_wolf', 'ice_golem'],
        boss: 'frozen_wyvern',
        baseRewards: {
            gold: [250, 500],
            xp: [120, 250],
            lootTable: [
                { itemId: 'ice_crystal', baseChance: 0.65, quantityRange: [1, 2] },
                { itemId: 'frost_shard', baseChance: 0.35, quantityRange: [1, 1] }
            ]
        },
        scaleFactors: { gold: 1.07, xp: 1.06, lootChance: 1.03 },
        guaranteedReward: { itemId: 'frost_core', quantity: 1 }
    },

    'stormy_cliffs': {
        name: 'Stormy Cliffs',
        tier: 'IV',
        floors: 20,
        durationMinutes: 40,
        staminaCost: 60,
        levelRequirement: 20,
        enemyPool: ['storm_harpy', 'thunder_giant'],
        boss: 'tempest_dragon',
        baseRewards: {
            gold: [300, 600],
            xp: [150, 300],
            lootTable: [
                { itemId: 'storm_fragment', baseChance: 0.6, quantityRange: [1, 2] },
                { itemId: 'thunder_shard', baseChance: 0.25, quantityRange: [1, 1] }
            ]
        },
        scaleFactors: { gold: 1.08, xp: 1.07, lootChance: 1.04 },
        guaranteedReward: { itemId: 'storm_core', quantity: 1 }
    },

    'volcanic_abyss': {
        name: 'Volcanic Abyss',
        tier: 'IV',
        floors: 10,
        durationMinutes: 60,
        staminaCost: 80,
        levelRequirement: 25,
        enemyPool: ['obsidian_beast', 'ash_phoenix'],
        boss: 'volcano_lord',
        baseRewards: {
            gold: [400, 800],
            xp: [150, 300],
            lootTable: [
                { itemId: 'molten_core', baseChance: 0.5, quantityRange: [1, 2] },
                { itemId: 'obsidian_fragment', baseChance: 0.6, quantityRange: [2, 5] },
                { itemId: 'crystal_shard', baseChance: 0.4, quantityRange: [2, 4] },
                { itemId: 'fire_bloom', baseChance: 0.1, quantityRange: [1, 1] }
            ]
        },
        scaleFactors: { gold: 1.08, xp: 1.07, lootChance: 1.04 },
        guaranteedReward: { itemId: 'volcanic_core', quantity: 1 }
    }
};