module.exports = {
    // BEASTS
    'forest_rabbit': {
        name: 'Forest Rabbit',
        rarity: 'Common',
        type: 'Beast',
        description: 'A swift and nimble creature of the woods.',
        baseStats: { hp: 50, atk: 10, def: 8, spd: 15, luck: 10 }, // Total: 93
        statGrowth: { hp: 5, atk: 2, def: 1, spd: 2, luck: 1 },
        evolution: { level: 10, evolvesTo: 'dire_wolf' }
    },
    'dire_wolf': {
        name: 'Dire Wolf',
        rarity: 'Uncommon',
        type: 'Beast',
        description: 'A formidable hunter, tempered by countless battles.',
        baseStats: { hp: 100, atk: 25, def: 15, spd: 20, luck: 5 }, // Total: 165
        statGrowth: { hp: 10, atk: 4, def: 3, spd: 1, luck: 1 },
        evolution: null,
        breeding: {
            partner: 'pyre_elemental',      
            result: 'lava_hound',           
            egg: 'hybrid_beast_egg',        
            timeMinutes: 480                
        }
    },
    'stone_boar': {
        name: 'Stone Boar',
        rarity: 'Rare',
        type: 'Beast',
        description: 'A boar with rocky skin, hard to pierce but slow-moving.',
        baseStats: { hp: 180, atk: 20, def: 35, spd: 8, luck: 7 }, // Total: 250
        statGrowth: { hp: 20, atk: 3, def: 5, spd: 1, luck: 1 },
        evolution: null
    },
    'iron_gryphon': {
        name: 'Iron Gryphon',
        rarity: 'Rare',
        type: 'Beast',
        description: 'A majestic flying predator with metallic feathers and razor-sharp talons.',
        baseStats: { hp: 140, atk: 35, def: 30, spd: 41, luck: 4 }, // Total: 250
        statGrowth: { hp: 14, atk: 4, def: 4, spd: 4, luck: 1 },
        evolution: null
    },

    // ELEMENTALS
    'flame_sprite': {
        name: 'Flame Sprite',
        rarity: 'Common',
        type: 'Elemental',
        description: 'A mischievous flicker of pure fire.',
        baseStats: { hp: 40, atk: 15, def: 5, spd: 21, luck: 12 }, // Total: 93
        statGrowth: { hp: 4, atk: 3, def: 1, spd: 3, luck: 2 },
        evolution: { level: 12, evolvesTo: 'pyre_elemental' }
    },
    'pyre_elemental': {
        name: 'Pyre Elemental',
        rarity: 'Uncommon',
        type: 'Elemental',
        description: 'A raging inferno given sentient form.',
        baseStats: { hp: 80, atk: 35, def: 10, spd: 32, luck: 8 }, // Total: 165
        statGrowth: { hp: 8, atk: 5, def: 2, spd: 4, luck: 1 },
        evolution: null,
        breeding: {
            partner: 'dire_wolf',      
            result: 'lava_hound',           
            egg: 'hybrid_beast_egg',        
            timeMinutes: 480                
        }
    },
    'crystal_sprite': {
        name: 'Crystal Sprite',
        rarity: 'Uncommon',
        type: 'Elemental',
        description: 'A shard of living crystal that glimmers with magical energy.',
        baseStats: { hp: 75, atk: 18, def: 30, spd: 27, luck: 15 }, // Re-balanced from { hp: 60, def: 15, spd: 57 }
        statGrowth: { hp: 6, atk: 2, def: 3, spd: 6, luck: 3 },
        evolution: { level: 15, evolvesTo: 'prism_guardian' }
    },
    'prism_guardian': {
        name: 'Prism Guardian',
        rarity: 'Epic',
        type: 'Elemental',
        description: 'A radiant sentinel of refracted light, both beautiful and deadly.',
        baseStats: { hp: 160, atk: 50, def: 75, spd: 40, luck: 20 }, // Re-balanced from { hp: 120, atk: 40, def: 25, spd: 140 }
        statGrowth: { hp: 12, atk: 5, def: 4, spd: 14, luck: 2 },
        evolution: null
    },
    'frost_serpent': {
        name: 'Frost Serpent',
        rarity: 'Epic',
        type: 'Elemental',
        description: 'A sinuous ice dragon that brings the chill of eternal winter.',
        baseStats: { hp: 200, atk: 50, def: 45, spd: 42, luck: 8 }, // Re-balanced from { hp: 160, atk: 40, def: 35, spd: 102 }
        statGrowth: { hp: 16, atk: 5, def: 4, spd: 10, luck: 1 },
        evolution: null
    },
    'storm_roc': {
        name: 'Storm Roc',
        rarity: 'Epic',
        type: 'Elemental',
        description: 'A colossal bird that commands lightning and thunder.',
        baseStats: { hp: 190, atk: 50, def: 48, spd: 47, luck: 10 }, // Re-balanced from { hp: 150, atk: 38, def: 30, spd: 117 }
        statGrowth: { hp: 15, atk: 4, def: 3, spd: 12, luck: 1 },
        evolution: null
    },

    // MYSTICS
    'moon_owl': {
        name: 'Moon Owl',
        rarity: 'Rare',
        type: 'Mystic',
        description: 'An ethereal owl said to guide travelers under the night sky.',
        baseStats: { hp: 110, atk: 32, def: 42, spd: 41, luck: 25 }, // Re-balanced from { hp: 70, atk: 22, def: 12, spd: 121 }
        statGrowth: { hp: 7, atk: 3, def: 2, spd: 12, luck: 3 },
        evolution: { level: 18, evolvesTo: 'star_phoenix' }
    },
    'star_phoenix': {
        name: 'Star Phoenix',
        rarity: 'Legendary',
        type: 'Mystic',
        description: 'Reborn in cosmic fire, this bird is said to herald destiny itself.',
        baseStats: { hp: 250, atk: 80, def: 115, spd: 75, luck: 35 }, // Re-balanced from { hp: 160, atk: 60, def: 25, spd: 275 }
        statGrowth: { hp: 15, atk: 7, def: 4, spd: 28, luck: 3 },
        evolution: null
    },
    'sproutling': { 
        name: 'Sproutling',
        rarity: 'Common',
        type: 'Mystic',
        description: 'A tiny, sentient plant that hums with the energy of the earth.',
        baseStats: { hp: 60, atk: 8, def: 12, spd: 3, luck: 10 }, // Total: 93
        statGrowth: { hp: 6, atk: 1, def: 3, spd: 1, luck: 1 },
        evolution: { level: 10, evolvesTo: 'grove_guardian' }
    },
    'grove_guardian': { 
        name: 'Grove Guardian',
        rarity: 'Uncommon',
        type: 'Mystic',
        description: 'A sturdy protector of the forest, its bark as hard as iron.',
        baseStats: { hp: 100, atk: 15, def: 35, spd: 15, luck: 10 }, // Total: 165
        statGrowth: { hp: 12, atk: 2, def: 5, spd: 1, luck: 1 },
        evolution: null
    },
    'shellback_turtle': {
        name: 'Shellback Turtle',
        rarity: 'Uncommon',
        type: 'Mystic',
        description: 'An ancient turtle with an impenetrable shell, slow but incredibly resilient.',
        baseStats: { hp: 104, atk: 18, def: 37, spd: 5, luck: 1 }, // Total: 165
        statGrowth: { hp: 14, atk: 2, def: 4, spd: 1, luck: 1 },
        evolution: null
    },
    'ancient_treant': {
        name: 'Ancient Treant',
        rarity: 'Legendary',
        type: 'Mystic',
        description: 'A colossal tree guardian that has witnessed the rise and fall of civilizations.',
        baseStats: { hp: 360, atk: 45, def: 135, spd: 9, luck: 6 }, // Re-balanced from { hp: 280, def: 55, spd: 169 }
        statGrowth: { hp: 28, atk: 5, def: 6, spd: 17, luck: 1 },
        evolution: null
    },
    'celestial_kirin': {
        name: 'Celestial Kirin',
        rarity: 'Legendary',
        type: 'Mystic',
        description: 'A divine unicorn that brings fortune and prosperity to the pure of heart.',
        baseStats: { hp: 270, atk: 68, def: 102, spd: 75, luck: 32 }, // Re-balanced from { hp: 230, atk: 48, def: 42, spd: 225 } 
        statGrowth: { hp: 23, atk: 5, def: 5, spd: 22, luck: 2 },
        evolution: null
    },

    // UNDEAD
    'skeletal_rat': {
        name: 'Skeletal Rat',
        rarity: 'Common',
        type: 'Undead',
        description: 'A weak but relentless swarm creature animated by dark magic.',
        baseStats: { hp: 40, atk: 8, def: 5, spd: 35, luck: 5 }, // Total: 93
        statGrowth: { hp: 3, atk: 2, def: 1, spd: 4, luck: 1 },
        evolution: { level: 8, evolvesTo: 'bone_hound' }
    },
    'bone_hound': {
        name: 'Bone Hound',
        rarity: 'Uncommon',
        type: 'Undead',
        description: 'A vicious dog made from fused bones and spite.',
        baseStats: { hp: 90, atk: 28, def: 18, spd: 19, luck: 10 }, // Total: 165
        statGrowth: { hp: 9, atk: 4, def: 3, spd: 2, luck: 1 },
        evolution: null
    },
    'phantom_knight': {
        name: 'Phantom Knight',
        rarity: 'Epic',
        type: 'Undead',
        description: 'A cursed warrior, bound eternally to its ghostly armor.',
        baseStats: { hp: 170, atk: 45, def: 45, spd: 70, luck: 15 }, // Total: 345
        statGrowth: { hp: 15, atk: 6, def: 6, spd: 7, luck: 1 },
        evolution: null
    },
    'shadow_wyrm': {
        name: 'Shadow Wyrm',
        rarity: 'Legendary',
        type: 'Undead',
        description: 'A draconic nightmare that emerges from the darkest corners of the underworld.',
        baseStats: { hp: 250, atk: 110, def: 105, spd: 72, luck: 18 }, // Re-balanced from { hp: 200, atk: 60, def: 45, spd: 242 }
        statGrowth: { hp: 20, atk: 7, def: 5, spd: 24, luck: 1 },
        evolution: null
    },

    // MECHANICAL
    'gear_pup': { 
        name: 'Gear Pup',
        rarity: 'Common',
        type: 'Mechanical',
        description: 'A small, loyal automaton built from spare parts. It\'s tougher than it looks.',
        baseStats: { hp: 55, atk: 9, def: 14, spd: 7, luck: 8 }, // Total: 93
        statGrowth: { hp: 6, atk: 2, def: 3, spd: 1, luck: 1 },
        evolution: { level: 11, evolvesTo: 'steel_hound' }
    },
    'steel_hound': { 
        name: 'Steel Hound',
        rarity: 'Uncommon',
        type: 'Mechanical',
        description: 'An upgraded, more robust version of the Gear Pup, reinforced with steel plates.',
        baseStats: { hp: 80, atk: 25, def: 30, spd: 23, luck: 7 }, // Total: 165
        statGrowth: { hp: 11, atk: 3, def: 5, spd: 1, luck: 1 },
        evolution: null
    },
    'tin_golem': {
        name: 'Tin Golem',
        rarity: 'Uncommon',
        type: 'Mechanical',
        description: 'A clunky but reliable automaton.',
        baseStats: { hp: 80, atk: 20, def: 50, spd: 10, luck: 5 }, // Total: 165
        statGrowth: { hp: 11, atk: 2, def: 4, spd: 1, luck: 1 },
        evolution: { level: 20, evolvesTo: 'iron_colossus' }
    },
    'iron_colossus': {
        name: 'Iron Colossus',
        rarity: 'Rare',
        type: 'Mechanical',
        description: 'A towering machine forged for war, slow but nearly indestructible.',
        baseStats: { hp: 120, atk: 50, def: 60, spd: 15, luck: 8 }, // Total: 250
        statGrowth: { hp: 25, atk: 5, def: 7, spd: 0, luck: 1 },
        evolution: null
    },
    'clockwork_dragon': {
        name: 'Clockwork Dragon',
        rarity: 'Legendary',
        type: 'Mechanical',
        description: 'An artificial dragon of gears and steam, a marvel of ancient engineering.',
        baseStats: { hp: 250, atk: 90, def: 120, spd: 75, luck: 20 }, // Re-balanced from { hp: 200, atk: 70, def: 40, spd: 223 }
        statGrowth: { hp: 20, atk: 8, def: 5, spd: 22, luck: 2 },
        evolution: null
    },

};