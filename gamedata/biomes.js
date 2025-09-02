module.exports = {

    'whispering_forest': {
        name: 'Whispering Forest',
        description: 'A dense, ancient forest where common herbs and beasts are plentiful.',
        staminaCost: 10,
        levelRequirement: 1,
        lootTable: [
            { itemId: 'moonpetal_herb', chance: 0.70, quantityRange: [1, 3] },
            { itemId: 'wood_log', chance: 0.50, quantityRange: [1, 2] },
            { itemId: 'beast_hide', chance: 0.20, quantityRange: [1, 1] },
            { itemId: 'sun_kissed_fern', chance: 0.05, quantityRange: [1, 1] },
            { itemId: 'whispering_bloom', chance: 0.01, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Common (20% base chance)
            { palId: 'forest_rabbit', chance: 0.20},
            { palId: 'sproutling', chance: 0.20},
            // Uncommon (10% base chance)
            { palId: 'dire_wolf', chance: 0.10},
            { palId: 'grove_guardian', chance: 0.10},
            // Rare (5% base chance)
            { palId: 'moon_owl', chance: 0.05},
        ]
    },

    'glimmering_caves': {
        name: 'Glimmering Caves',
        description: 'A network of underground caves filled with glowing crystals and valuable ores.',
        levelRequirement: 5,
        staminaCost: 10,
        lootTable: [
            { itemId: 'crystal_shard', chance: 0.75, quantityRange: [2, 4] },
            { itemId: 'iron_ore', chance: 0.40, quantityRange: [1, 3] },
            { itemId: 'silverleaf', chance: 0.15, quantityRange: [1, 2] },
            { itemId: 'starlight_berry', chance: 0.03, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Common (20% base chance)
            { palId: 'gear_pup', chance: 0.20},
            { palId: 'skeletal_rat', chance: 0.20},
            // Uncommon (10% base chance)
            { palId: 'tin_golem', chance: 0.10},
            { palId: 'crystal_sprite', chance: 0.10},
            { palId: 'steel_hound', chance: 0.10},
            { palId: 'bone_hound', chance: 0.10},
            // Epic (2% base chance)
            { palId: 'prism_guardian', chance: 0.02},
        ]
    },

    'sunken_swamp': {
        name: 'Sunken Swamp',
        description: 'A murky, dangerous swamp where potent and mysterious ingredients grow.',
        levelRequirement: 12,
        staminaCost: 20,
        lootTable: [
            { itemId: 'moonpetal_herb', chance: 0.30, quantityRange: [1, 2] },
            { itemId: 'spirit_dust', chance: 0.10, quantityRange: [1, 1] },
            { itemId: 'echo_crystal', chance: 0.08, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Uncommon (10% base chance)
            { palId: 'shellback_turtle', chance: 0.10},
            // Rare (5% base chance)
            { palId: 'stone_boar', chance: 0.05},
            // Epic (2% base chance)
            { palId: 'phantom_knight', chance: 0.02},
        ]
    },

    'volcanic_peaks': {
        name: 'Volcanic Peaks',
        description: 'A treacherous mountain range flowing with magma and home to fire-resistant flora.',
        levelRequirement: 20,
        staminaCost: 20,
        lootTable: [
            { itemId: 'ember_moss', chance: 0.50, quantityRange: [1, 3] },
            { itemId: 'obsidian_fragment', chance: 0.25, quantityRange: [1, 2] },
            { itemId: 'fire_essence', chance: 0.10, quantityRange: [1, 1] },
            { itemId: 'fire_bloom', chance: 0.02, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Common (20% base chance)
            { palId: 'flame_sprite', chance: 0.20},
            // Uncommon (10% base chance)
            { palId: 'pyre_elemental', chance: 0.10},
            // Legendary (0.5% base chance)
            { palId: 'star_phoenix', chance: 0.005},
        ]
    },

    'frozen_forest': {
        name: 'Frozen Forest',
        description: 'A dense, cold forest, where only the hardiest ingredients can survive.',
        levelRequirement: 25,
        staminaCost: 20,
        lootTable: [
            { itemId: 'frost_lily', chance: 0.40, quantityRange: [1, 2] },
            { itemId: 'ice_crystal', chance: 0.20, quantityRange: [1, 3] },
            { itemId: 'frost_shard', chance: 0.07, quantityRange: [1, 1] },
            { itemId: 'dragonbone_charm', chance: 0.005, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Epic (2% base chance)
            { palId: 'frost_serpent', chance: 0.02},
            // Legendary (0.5% base chance)
            { palId: 'ancient_treant', chance: 0.005},
        ]
    },

    'sky_citadel': {
        name: 'Sky Citadel',
        description: 'Ancient floating ruins high above the clouds, where storm winds carry rare treasures.',
        levelRequirement: 30,
        staminaCost: 25,
        lootTable: [
            { itemId: 'storm_essence', chance: 0.35, quantityRange: [1, 2] },
            { itemId: 'wind_crystal', chance: 0.25, quantityRange: [1, 3] },
            { itemId: 'feathered_plume', chance: 0.15, quantityRange: [1, 2] },
            { itemId: 'celestial_fragment', chance: 0.03, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Rare (5% base chance)
            { palId: 'iron_gryphon', chance: 0.05},
            // Epic (2% base chance)
            { palId: 'storm_roc', chance: 0.02},
            // Legendary (0.5% base chance)
            { palId: 'celestial_kirin', chance: 0.005},
        ]
    },

    'iron_foundry': {
        name: 'Iron Foundry',
        description: 'Abandoned mechanical workshops filled with rusted gears and ancient automatons.',
        levelRequirement: 15,
        staminaCost: 15,
        lootTable: [
            { itemId: 'scrap_metal', chance: 0.60, quantityRange: [2, 4] },
            { itemId: 'gear_component', chance: 0.35, quantityRange: [1, 3] },
            { itemId: 'oil_essence', chance: 0.20, quantityRange: [1, 2] },
            { itemId: 'mechanical_core', chance: 0.02, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Rare (5% base chance)
            { palId: 'iron_colossus', chance: 0.05},
            // Legendary (0.5% base chance)
            { palId: 'clockwork_dragon', chance: 0.005},
        ]
    },

    'shadow_realm': {
        name: 'Shadow Realm',
        description: 'A dark dimension where the boundary between life and death grows thin.',
        levelRequirement: 35,
        staminaCost: 30,
        lootTable: [
            { itemId: 'shadow_essence', chance: 0.40, quantityRange: [1, 2] },
            { itemId: 'soul_fragment', chance: 0.25, quantityRange: [1, 1] },
            { itemId: 'void_crystal', chance: 0.15, quantityRange: [1, 2] },
            { itemId: 'nightmare_orb', chance: 0.01, quantityRange: [1, 1] },
        ],
        possiblePals: [
            // Legendary (0.5% base chance)
            { palId: 'shadow_wyrm', chance: 0.005},
        ]
    }

};

/*
RARITY ENCOUNTER RATES:
- Common: 20% base chance
- Uncommon: 10% base chance  
- Rare: 5% base chance
- Epic: 2% base chance
- Legendary: 0.5% base chance

BIOME DISTRIBUTION:
- Whispering Forest: Forest/nature pets (Forest Rabbit, Sproutling, Dire Wolf, Grove Guardian, Moon Owl)
- Glimmering Caves: Underground/crystal/mechanical pets (Gear Pup, Skeletal Rat, Tin Golem, Crystal Sprite, Steel Hound, Bone Hound, Prism Guardian)
- Sunken Swamp: Swamp/defensive pets (Shellback Turtle, Stone Boar, Phantom Knight)
- Volcanic Peaks: Fire/phoenix pets (Flame Sprite, Pyre Elemental, Star Phoenix)
- Frozen Forest: Ice/ancient pets (Frost Serpent, Ancient Treant)
- Sky Citadel: Flying/storm/celestial pets (Iron Gryphon, Storm Roc, Celestial Kirin)
- Iron Foundry: Large mechanical pets (Iron Colossus, Clockwork Dragon)
- Shadow Realm: Dark/undead legendary pets (Shadow Wyrm)
*/