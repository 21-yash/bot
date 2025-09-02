const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    itemId: { type: String, required: true }, 
    quantity: { type: Number, required: true, default: 1 },
}, { _id: false });

const PlayerSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, 

    gold: { type: Number, default: 100 },
    arcaneDust: { type: Number, default: 0 },

    level: { type: Number, default: 1 }, 
    xp: { type: Number, default: 0 },
    stamina: { type: Number, default: 100 },
    maxStamina: { type: Number, default: 100 },
    lastStaminaUpdate: { type: Date, default: Date.now }, 

    inventory: [inventoryItemSchema],
    grimoire: { type: [String], default: [] },
    craftingJournal: { type: [String], default: [] },

    hatchingSlot: {
        eggId: { type: String, default: null },
        hatchesAt: { type: Date, default: null }
    },
    breedingPen: {
        pal1Id: { type: String, default: null },
        pal2Id: { type: String, default: null },
        eggReadyAt: { type: Date, default: null }
    },

    achievements: { type: [String], default: [] },
    stats: {
        forageCount: { type: Number, default: 0 },
        eggsHatched: { type: Number, default: 0 },
        dungeonClears: { type: Number, default: 0 },
        potionsBrewed: { type: Number, default: 0 },
        itemsCrafted: { type: Number, default: 0}
    },

    palCounter: { type: Number, default: 0 }

});

module.exports = mongoose.model('Player', PlayerSchema);