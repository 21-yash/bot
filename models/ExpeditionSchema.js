const mongoose = require('mongoose');

const ExpeditionSchema = new mongoose.Schema({
    playerId: { type: String, required: true },
    petId: { type: String, required: true },
    dungeonId: { type: String, required: true }, // e.g., 'sunken_crypts'
    
    finishAt: { type: Date, required: true }, // The exact time the dungeon will be completed
});

module.exports = mongoose.model('Expedition', ExpeditionSchema);