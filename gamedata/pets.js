module.exports = {
    // BEASTS
    'forest_rabbit': {
        name: 'Forest Rabbit',
        rarity: 'Common',
        type: 'Beast',
        description: 'A swift and nimble creature of the woods.',
        baseStats: { hp: 50, atk: 10, def: 8, spd: 15, luck: 10 }, // Total: 93
        statGrowth: { hp: 5, atk: 2, def: 1, spd: 2, luck: 1 },
        evolution: { level: 10, evolvesTo: 'dire_wolf' },
        pic: "https://cdn.discordapp.com/attachments/920231858204200961/1412757235938885632/image-removebg-preview_22.png?ex=68b97434&is=68b822b4&hm=2de890d1889f534eb6c9ea6ba4af1c3bb9e1c15e360fa93ad4a8a092c879028d&"
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
        },
        pic: "https://cdn.discordapp.com/attachments/920231858204200961/1412757235280646154/image-removebg-preview_21.png?ex=68b97434&is=68b822b4&hm=c6d4f877d2ebb60d38f7c16c482de18632d07d092f49a4e93a4512f599cd56c9&"
    },
    'stone_boar': {
        name: 'Stone Boar',
        rarity: 'Rare',
        type: 'Beast',
        description: 'A boar with rocky skin, hard to pierce but slow-moving.',
        baseStats: { hp: 180, atk: 20, def: 35, spd: 8, luck: 7 }, // Total: 250
        statGrowth: { hp: 20, atk: 3, def: 5, spd: 1, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757234219356290/image-removebg-preview_20.png?ex=68b97434&is=68b822b4&hm=a213233f96f0ce97cbdb56d319c70aa773d938b83180972cc7398c2749646ed2&'
    },
    'iron_gryphon': {
        name: 'Iron Gryphon',
        rarity: 'Rare',
        type: 'Beast',
        description: 'A majestic flying predator with metallic feathers and razor-sharp talons.',
        baseStats: { hp: 140, atk: 35, def: 30, spd: 41, luck: 4 }, // Total: 250
        statGrowth: { hp: 14, atk: 4, def: 4, spd: 4, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757232826712125/image-removebg-preview_19.png?ex=68b97434&is=68b822b4&hm=0f55de81bbd609697b827f38cb39a9844e19c18fd006a3694fbf7942f3a75864&'
    },

    // ELEMENTALS
    'flame_sprite': {
        name: 'Flame Sprite',
        rarity: 'Common',
        type: 'Elemental',
        description: 'A mischievous flicker of pure fire.',
        baseStats: { hp: 40, atk: 15, def: 5, spd: 21, luck: 12 }, // Total: 93
        statGrowth: { hp: 4, atk: 3, def: 1, spd: 3, luck: 2 },
        evolution: { level: 12, evolvesTo: 'pyre_elemental' },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757032548831415/image-removebg-preview_1.png?ex=68b97404&is=68b82284&hm=cfb6f30e984eeb84c3202366d9c7829f6d50d103322b8a8b5c69694a22a99279&'
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
        },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757032976777407/image-removebg-preview_2.png?ex=68b97404&is=68b82284&hm=72550038b05cc33834b428ea83477672dbc130ac7c84898ffe5ccb58b5ad9025&'
    },
    'crystal_sprite': {
        name: 'Crystal Sprite',
        rarity: 'Uncommon',
        type: 'Elemental',
        description: 'A shard of living crystal that glimmers with magical energy.',
        baseStats: { hp: 75, atk: 18, def: 30, spd: 27, luck: 15 }, // Re-balanced from { hp: 60, def: 15, spd: 57 }
        statGrowth: { hp: 6, atk: 2, def: 3, spd: 6, luck: 3 },
        evolution: { level: 15, evolvesTo: 'prism_guardian' },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757033320579163/image-removebg-preview_4.png?ex=68b97404&is=68b82284&hm=644f7420f5dbf99aed269095102128e55332a01b64cd2bbd12240d994743ee5b&'
    },
    'prism_guardian': {
        name: 'Prism Guardian',
        rarity: 'Epic',
        type: 'Elemental',
        description: 'A radiant sentinel of refracted light, both beautiful and deadly.',
        baseStats: { hp: 160, atk: 50, def: 75, spd: 40, luck: 20 }, // Re-balanced from { hp: 120, atk: 40, def: 25, spd: 140 }
        statGrowth: { hp: 12, atk: 5, def: 4, spd: 14, luck: 2 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412752883136331879/image-removebg-preview_3.png?ex=68b97027&is=68b81ea7&hm=ba2852046c4e408d7206c9d117970fd784ddcbff45aaabfb2e77372478b273c3&'
    },
    'frost_serpent': {
        name: 'Frost Serpent',
        rarity: 'Epic',
        type: 'Elemental',
        description: 'A sinuous ice dragon that brings the chill of eternal winter.',
        baseStats: { hp: 200, atk: 50, def: 45, spd: 42, luck: 8 }, // Re-balanced from { hp: 160, atk: 40, def: 35, spd: 102 }
        statGrowth: { hp: 16, atk: 5, def: 4, spd: 10, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757033811185774/image-removebg-preview_5.png?ex=68b97404&is=68b82284&hm=921df449698f46b710c6e41554debb08247f56c808500f9a84c95792bc5dfb35&'
    },
    'storm_roc': {
        name: 'Storm Roc',
        rarity: 'Epic',
        type: 'Elemental',
        description: 'A colossal bird that commands lightning and thunder.',
        baseStats: { hp: 190, atk: 50, def: 48, spd: 47, luck: 10 }, // Re-balanced from { hp: 150, atk: 38, def: 30, spd: 117 }
        statGrowth: { hp: 15, atk: 4, def: 3, spd: 12, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757236534743131/image-removebg-preview_24.png?ex=68b97434&is=68b822b4&hm=3d49f8e19e270a47f9cf7625348b892fefb51dab49f3073711cbf63429c60a56&'
    },

    // MYSTICS
    'moon_owl': {
        name: 'Moon Owl',
        rarity: 'Rare',
        type: 'Mystic',
        description: 'An ethereal owl said to guide travelers under the night sky.',
        baseStats: { hp: 110, atk: 32, def: 42, spd: 41, luck: 25 }, // Re-balanced from { hp: 70, atk: 22, def: 12, spd: 121 }
        statGrowth: { hp: 7, atk: 3, def: 2, spd: 12, luck: 3 },
        evolution: { level: 18, evolvesTo: 'star_phoenix' },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757034260103272/image-removebg-preview_6.png?ex=68b97404&is=68b82284&hm=dc0c436bc42d608f0204f839faa8ab85bfcbd2571e143f0e50722596540be3ab&'
    },
    'star_phoenix': {
        name: 'Star Phoenix',
        rarity: 'Legendary',
        type: 'Mystic',
        description: 'Reborn in cosmic fire, this bird is said to herald destiny itself.',
        baseStats: { hp: 250, atk: 80, def: 115, spd: 75, luck: 35 }, // Re-balanced from { hp: 160, atk: 60, def: 25, spd: 275 }
        statGrowth: { hp: 15, atk: 7, def: 4, spd: 28, luck: 3 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412752882612179024/download.png?ex=68b97026&is=68b81ea6&hm=9f4e963567722c5e547bc29136f1d21aeb1b13b3fc980a5285490e882ddeb7e3&'
    },
    'sproutling': { 
        name: 'Sproutling',
        rarity: 'Common',
        type: 'Mystic',
        description: 'A tiny, sentient plant that hums with the energy of the earth.',
        baseStats: { hp: 60, atk: 8, def: 12, spd: 3, luck: 10 }, // Total: 93
        statGrowth: { hp: 6, atk: 1, def: 3, spd: 1, luck: 1 },
        evolution: { level: 10, evolvesTo: 'grove_guardian' },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757034910351380/image-removebg-preview_9.png?ex=68b97404&is=68b82284&hm=10c6ce1eed15ce5863c4338d7ba800b424d333b2f41a669a10f40ec993340343&'
    },
    'grove_guardian': { 
        name: 'Grove Guardian',
        rarity: 'Uncommon',
        type: 'Mystic',
        description: 'A sturdy protector of the forest, its bark as hard as iron.',
        baseStats: { hp: 100, atk: 15, def: 35, spd: 15, luck: 10 }, // Total: 165
        statGrowth: { hp: 12, atk: 2, def: 5, spd: 1, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757232122331187/image-removebg-preview_18.png?ex=68b97433&is=68b822b3&hm=50b828b4d54eb8b3734e0164aade36ebe4329d2c95ff92f588133fadb9f06219&'
    },
    'shellback_turtle': {
        name: 'Shellback Turtle',
        rarity: 'Uncommon',
        type: 'Mystic',
        description: 'An ancient turtle with an impenetrable shell, slow but incredibly resilient.',
        baseStats: { hp: 104, atk: 18, def: 37, spd: 5, luck: 1 }, // Total: 165
        statGrowth: { hp: 14, atk: 2, def: 4, spd: 1, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757231371419688/image-removebg-preview_17.png?ex=68b97433&is=68b822b3&hm=a255a7928f424fd9ccd83173f0edfb361a97eb757c560b0a1ffa53e912d533b2&'
    },
    'ancient_treant': {
        name: 'Ancient Treant',
        rarity: 'Legendary',
        type: 'Mystic',
        description: 'A colossal tree guardian that has witnessed the rise and fall of civilizations.',
        baseStats: { hp: 360, atk: 45, def: 135, spd: 9, luck: 6 }, // Re-balanced from { hp: 280, def: 55, spd: 169 }
        statGrowth: { hp: 28, atk: 5, def: 6, spd: 17, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412752883992231976/image-removebg-preview_23.png?ex=68b97027&is=68b81ea7&hm=93716d03848e69c802aef17ef189085392eaf1f3679ba306d96c853f11a4c361&'
    },
    'celestial_kirin': {
        name: 'Celestial Kirin',
        rarity: 'Legendary',
        type: 'Mystic',
        description: 'A divine unicorn that brings fortune and prosperity to the pure of heart.',
        baseStats: { hp: 270, atk: 68, def: 102, spd: 75, luck: 32 }, // Re-balanced from { hp: 230, atk: 48, def: 42, spd: 225 } 
        statGrowth: { hp: 23, atk: 5, def: 5, spd: 22, luck: 2 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757035425988728/image-removebg-preview_10.png?ex=68b97405&is=68b82285&hm=aec90404d85267aefbe55897b419aa76a430430bd5d7a90a40d69eeb265e897a&'
    },

    // UNDEAD
    'skeletal_rat': {
        name: 'Skeletal Rat',
        rarity: 'Common',
        type: 'Undead',
        description: 'A weak but relentless swarm creature animated by dark magic.',
        baseStats: { hp: 40, atk: 8, def: 5, spd: 35, luck: 5 }, // Total: 93
        statGrowth: { hp: 3, atk: 2, def: 1, spd: 4, luck: 1 },
        evolution: { level: 8, evolvesTo: 'bone_hound' },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757035795222579/image-removebg-preview_11.png?ex=68b97405&is=68b82285&hm=20faa9a89044c913e6903feeee6bb056a69d408ca3d5c394b1c2c1d5ca9f9ada&'
    },
    'bone_hound': {
        name: 'Bone Hound',
        rarity: 'Uncommon',
        type: 'Undead',
        description: 'A vicious dog made from fused bones and spite.',
        baseStats: { hp: 90, atk: 28, def: 18, spd: 19, luck: 10 }, // Total: 165
        statGrowth: { hp: 9, atk: 4, def: 3, spd: 2, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757032171208834/download_4.png?ex=68b97404&is=68b82284&hm=fe272524c2bf96d4acb602fe8e251bb081b76c92a89c8f2eaaeffd199896010a&'
    },
    'phantom_knight': {
        name: 'Phantom Knight',
        rarity: 'Epic',
        type: 'Undead',
        description: 'A cursed warrior, bound eternally to its ghostly armor.',
        baseStats: { hp: 150, atk: 65, def: 60, spd: 55, luck: 15 }, // Total: 345
        statGrowth: { hp: 14, atk: 7, def: 7, spd: 6, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412752881416802355/download_2.png?ex=68b97026&is=68b81ea6&hm=edf7d38cde36bd67f544c00539f96ff6dc8953b1cb5de0ad66861a1d820bfa96&'
    },
    'shadow_wyrm': {
        name: 'Shadow Wyrm',
        rarity: 'Legendary',
        type: 'Undead',
        description: 'A draconic nightmare that emerges from the darkest corners of the underworld.',
        baseStats: { hp: 250, atk: 110, def: 105, spd: 72, luck: 18 }, // Re-balanced from { hp: 200, atk: 60, def: 45, spd: 242 }
        statGrowth: { hp: 20, atk: 7, def: 5, spd: 24, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412752883530727546/image-removebg-preview_16.png?ex=68b97027&is=68b81ea7&hm=97cb22f48e7421149e0d5b66c614a4c3853fee07f9d5b560d407d98970e17efe&'
    },

    // MECHANICAL
    'gear_pup': { 
        name: 'Gear Pup',
        rarity: 'Common',
        type: 'Mechanical',
        description: 'A small, loyal automaton built from spare parts. It\'s tougher than it looks.',
        baseStats: { hp: 55, atk: 9, def: 14, spd: 7, luck: 8 }, // Total: 93
        statGrowth: { hp: 6, atk: 2, def: 3, spd: 1, luck: 1 },
        evolution: { level: 11, evolvesTo: 'steel_hound' },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757036269305888/image-removebg-preview_12.png?ex=68b97405&is=68b82285&hm=2bf0cfa5e1f31246faf8738fea13a787fae3d3461b784df1985156b439f02756&'
    },
    'steel_hound': { 
        name: 'Steel Hound',
        rarity: 'Uncommon',
        type: 'Mechanical',
        description: 'An upgraded, more robust version of the Gear Pup, reinforced with steel plates.',
        baseStats: { hp: 80, atk: 25, def: 30, spd: 23, luck: 7 }, // Total: 165
        statGrowth: { hp: 11, atk: 3, def: 5, spd: 1, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757229605617785/image-removebg-preview_13.png?ex=68b97433&is=68b822b3&hm=50b3f6398b7c369c861e3f96e2999528905cc60ab5ec57de2097a96ce6025fce&'
    },
    'tin_golem': {
        name: 'Tin Golem',
        rarity: 'Uncommon',
        type: 'Mechanical',
        description: 'A clunky but reliable automaton.',
        baseStats: { hp: 80, atk: 20, def: 50, spd: 10, luck: 5 }, // Total: 165
        statGrowth: { hp: 11, atk: 2, def: 4, spd: 1, luck: 1 },
        evolution: { level: 20, evolvesTo: 'iron_colossus' },
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757230104612874/image-removebg-preview_14.png?ex=68b97433&is=68b822b3&hm=33117960cfb019e982a66fced19ce82dbd8056ac970859a029c06ab523c7dc8c&'
    },
    'iron_colossus': {
        name: 'Iron Colossus',
        rarity: 'Rare',
        type: 'Mechanical',
        description: 'A towering machine forged for war, slow but nearly indestructible.',
        baseStats: { hp: 120, atk: 50, def: 60, spd: 15, luck: 8 }, // Total: 250
        statGrowth: { hp: 25, atk: 5, def: 7, spd: 0, luck: 1 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412757230675300444/image-removebg-preview_15.png?ex=68b97433&is=68b822b3&hm=6e41552e89c97795e9383b22ccdf39590bd15e440f54cd1b8cd1212dfd7685fc&'
    },
    'clockwork_dragon': {
        name: 'Clockwork Dragon',
        rarity: 'Legendary',
        type: 'Mechanical',
        description: 'An artificial dragon of gears and steam, a marvel of ancient engineering.',
        baseStats: { hp: 250, atk: 90, def: 120, spd: 75, luck: 20 }, // Re-balanced from { hp: 200, atk: 70, def: 40, spd: 223 }
        statGrowth: { hp: 20, atk: 8, def: 5, spd: 22, luck: 2 },
        evolution: null,
        pic: 'https://cdn.discordapp.com/attachments/920231858204200961/1412752884436566106/unnamed-removebg-preview.png?ex=68b97027&is=68b81ea7&hm=0f92dc22515dc885f96888601fa28d3d2d7b9a53cbcbc6f5e636b6b48b2a4abd&'
    },

};