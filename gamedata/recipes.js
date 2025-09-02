module.exports = {

    'recipe_alchemical_incubator': {
        result: { itemId: 'alchemical_incubator', quantity: 1 },
        ingredients: [
            { itemId: 'iron_ore', quantity: 10 },
            { itemId: 'crystal_shard', quantity: 5 },
            { itemId: 'sun_kissed_fern', quantity: 1 } // Requires a rare ingredient
        ],
        xp: 100, // A big XP reward
        level: 5
    },
    'recipe_breeding_pen': {
        result: { itemId: 'breeding_pen', quantity: 1 },
        ingredients: [
            { itemId: 'sun_kissed_fern', quantity: 5 },  // Rare forage item
            { itemId: 'mystic_thread', quantity: 10 },   // Rare dungeon material
            { itemId: 'wood_log', quantity: 15 }     // Guaranteed drop from a mid-tier dungeon
        ],
        xp: 500, // A massive XP reward
        level: 15
    },

    // --- BREWING RECIPES (Potions) ---
    'recipe_minor_healing': {
        result: { itemId: 'minor_healing_potion', quantity: 1 },
        ingredients: [
            { itemId: 'moonpetal_herb', quantity: 2 },
            { itemId: 'crystal_shard', quantity: 1 },
        ],
        xp: 10,
        level: 1
    },
    'recipe_elixir_strength': {
        result: { itemId: 'elixir_of_strength', quantity: 1 },
        ingredients: [
            { itemId: 'sun_kissed_fern', quantity: 2 },
            { itemId: 'iron_ore', quantity: 1 },
        ],
        xp: 25,
        level: 3
    },
    'recipe_mana_draught': {
        result: { itemId: 'mana_draught', quantity: 1 },
        ingredients: [
            { itemId: 'moonpetal_herb', quantity: 1 },
            { itemId: 'silverleaf', quantity: 2 },
        ],
        xp: 18,
        level: 2
    },
    'recipe_greater_healing': {
        result: { itemId: 'greater_healing_potion', quantity: 1 },
        ingredients: [
            { itemId: 'frost_lily', quantity: 2 },
            { itemId: 'crystal_shard', quantity: 3 },
            { itemId: 'silverleaf', quantity: 1 },
        ],
        xp: 45,
        level: 8
    },
    'recipe_storm_elixir': {
        result: { itemId: 'storm_elixir', quantity: 1 },
        ingredients: [
            { itemId: 'storm_essence', quantity: 2 },
            { itemId: 'wind_crystal', quantity: 1 },
            { itemId: 'moonpetal_herb', quantity: 1 },
        ],
        xp: 60,
        level: 12
    },
    'recipe_void_tonic': {
        result: { itemId: 'void_tonic', quantity: 1 },
        ingredients: [
            { itemId: 'shadow_essence', quantity: 2 },
            { itemId: 'void_crystal', quantity: 1 },
            { itemId: 'spirit_dust', quantity: 1 },
        ],
        xp: 120,
        level: 20
    },
    'recipe_celestial_elixir': {
        result: { itemId: 'celestial_elixir', quantity: 1 },
        ingredients: [
            { itemId: 'celestial_fragment', quantity: 1 },
            { itemId: 'storm_essence', quantity: 3 },
            { itemId: 'frost_lily', quantity: 2 },
            { itemId: 'fire_bloom', quantity: 1 },
        ],
        xp: 250,
        level: 30
    },

    // --- CRAFTING RECIPES (Weapons & Armor) ---
    'recipe_wooden_sword': {
        result: { itemId: 'wooden_sword', quantity: 1 },
        ingredients: [
            { itemId: 'wood_log', quantity: 5 },
            { itemId: 'crystal_shard', quantity: 1 },
        ],
        xp: 15,
        level: 2
    },
    'recipe_leather_helmet': {
        result: { itemId: 'leather_helmet', quantity: 1 },
        ingredients: [
            { itemId: 'beast_hide', quantity: 3 },
            { itemId: 'iron_ore', quantity: 1 },
        ],
        xp: 20,
        level: 3
    },
    'recipe_iron_sword': {
        result: { itemId: 'iron_sword', quantity: 1 },
        ingredients: [
            { itemId: 'iron_ore', quantity: 5 },
            { itemId: 'crystal_shard', quantity: 3 },
        ],
        xp: 55,
        level: 10
    },
    'recipe_bronze_sword': {
        result: { itemId: 'bronze_sword', quantity: 1 },
        ingredients: [
            { itemId: 'iron_ore', quantity: 2 },
            { itemId: 'ancient_coin', quantity: 2 },
            { itemId: 'crystal_shard', quantity: 2 },
        ],
        xp: 30,
        level: 4
    },
    'recipe_mechanical_gauntlets': {
        result: { itemId: 'mechanical_gauntlets', quantity: 1 },
        ingredients: [
            { itemId: 'gear_component', quantity: 4 },
            { itemId: 'scrap_metal', quantity: 8 },
            { itemId: 'oil_essence', quantity: 2 },
        ],
        xp: 65,
        level: 12
    },
    'recipe_storm_boots': {
        result: { itemId: 'storm_boots', quantity: 1 },
        ingredients: [
            { itemId: 'wind_crystal', quantity: 3 },
            { itemId: 'feathered_plume', quantity: 5 },
            { itemId: 'beast_hide', quantity: 2 },
        ],
        xp: 70,
        level: 14
    },
    'recipe_stormcaller_staff': {
        result: { itemId: 'stormcaller_staff', quantity: 1 },
        ingredients: [
            { itemId: 'storm_essence', quantity: 3 },
            { itemId: 'thunder_shard', quantity: 1 },
            { itemId: 'wind_crystal', quantity: 5 },
            { itemId: 'wood_log', quantity: 10 },
        ],
        xp: 180,
        level: 25
    },
    'recipe_void_cloak': {
        result: { itemId: 'void_cloak', quantity: 1 },
        ingredients: [
            { itemId: 'shadow_essence', quantity: 4 },
            { itemId: 'soul_fragment', quantity: 2 },
            { itemId: 'mystic_thread', quantity: 8 },
        ],
        xp: 150,
        level: 22
    },
    'recipe_celestial_crown': {
        result: { itemId: 'celestial_crown', quantity: 1 },
        ingredients: [
            { itemId: 'celestial_fragment', quantity: 2 },
            { itemId: 'dragon_scale', quantity: 1 },
            { itemId: 'ancient_coin', quantity: 10 },
            { itemId: 'storm_core', quantity: 1 },
        ],
        xp: 350,
        level: 35
    },

    // --- ENCHANTING RECIPES (Special Gear / Buffs) ---
    'recipe_enchanted_charm': {
        result: { itemId: 'enchanted_charm', quantity: 1 },
        ingredients: [
            { itemId: 'crystal_shard', quantity: 3 },
            { itemId: 'sun_kissed_fern', quantity: 1 },
            { itemId: 'mana_draught', quantity: 1 },
        ],
        xp: 50,
        level: 6
    },
    'recipe_glowing_amulet': {
        result: { itemId: 'glowing_amulet', quantity: 1 },
        ingredients: [
            { itemId: 'iron_ore', quantity: 2 },
            { itemId: 'whispering_bloom', quantity: 1 },
        ],
        xp: 40,
        level: 5
    },
    'recipe_guardian_shield': {
        result: { itemId: 'guardian_shield', quantity: 1 },
        ingredients: [
            { itemId: 'iron_ore', quantity: 8 },
            { itemId: 'crystal_shard', quantity: 5 },
            { itemId: 'echo_crystal', quantity: 1 },
        ],
        xp: 75,
        level: 15
    },
    'recipe_phoenix_crown': {
        result: { itemId: 'phoenix_crown', quantity: 1 },
        ingredients: [
            { itemId: 'fire_bloom', quantity: 1 },
            { itemId: 'molten_core', quantity: 1 },
            { itemId: 'dragon_scale', quantity: 2 },
            { itemId: 'volcanic_core', quantity: 1 },
        ],
        xp: 400,
        level: 40
    },

    // --- ADVANCED POTION RECIPES ---
    'recipe_elixir_focus': {
        result: { itemId: 'elixir_of_focus', quantity: 1 },
        ingredients: [
            { itemId: 'echo_crystal', quantity: 1 },
            { itemId: 'silverleaf', quantity: 2 },
            { itemId: 'moonpetal_herb', quantity: 1 },
        ],
        xp: 35,
        level: 7
    },
    'recipe_shadow_draught': {
        result: { itemId: 'shadow_draught', quantity: 1 },
        ingredients: [
            { itemId: 'shadow_essence', quantity: 1 },
            { itemId: 'void_crystal', quantity: 1 },
            { itemId: 'spirit_dust', quantity: 1 },
            { itemId: 'ember_moss', quantity: 2 },
        ],
        xp: 100,
        level: 18
    },

    // --- SPECIAL MATERIAL CONVERSION RECIPES ---
    'recipe_mechanical_core': {
        result: { itemId: 'mechanical_core', quantity: 1 },
        ingredients: [
            { itemId: 'gear_component', quantity: 10 },
            { itemId: 'scrap_metal', quantity: 15 },
            { itemId: 'oil_essence', quantity: 5 },
            { itemId: 'iron_ore', quantity: 5 },
        ],
        xp: 80,
        level: 16
    },
    'recipe_storm_core': {
        result: { itemId: 'storm_core', quantity: 1 },
        ingredients: [
            { itemId: 'storm_fragment', quantity: 5 },
            { itemId: 'thunder_shard', quantity: 2 },
            { itemId: 'wind_crystal', quantity: 10 },
            { itemId: 'storm_essence', quantity: 8 },
        ],
        xp: 200,
        level: 28
    },
    'recipe_volcanic_core': {
        result: { itemId: 'volcanic_core', quantity: 1 },
        ingredients: [
            { itemId: 'molten_core', quantity: 3 },
            { itemId: 'lava_gem', quantity: 5 },
            { itemId: 'fire_essence', quantity: 10 },
            { itemId: 'obsidian_fragment', quantity: 8 },
        ],
        xp: 220,
        level: 30
    },
    'recipe_nightmare_orb': {
        result: { itemId: 'nightmare_orb', quantity: 1 },
        ingredients: [
            { itemId: 'soul_fragment', quantity: 10 },
            { itemId: 'shadow_essence', quantity: 15 },
            { itemId: 'void_crystal', quantity: 8 },
            { itemId: 'echo_core', quantity: 3 },
        ],
        xp: 300,
        level: 32
    }

};