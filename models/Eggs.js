const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const EggSchema = new mongoose.Schema({
    eggInstanceId: { type: String, default: () => uuidv4(), unique: true }, 
    
    ownerId: { type: String, required: true },

    baseEggId: { type: String, required: true }, 

    hatchesAt: { type: Date, required: true },
});

EggSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Egg', EggSchema);