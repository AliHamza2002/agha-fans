import mongoose from "mongoose";

// *** FEATURE: Party Items Support ***
// Sub-schema for party items
const partyItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    itemPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: true }); // Enable _id for each item

const partySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Buyer', 'Supplier'],
        required: true
    },
    contact: {
        type: String,
        trim: true
    },
    // *** FEATURE: Items array for the party ***
    // *** FIX: Removed default to ensure items must be explicitly provided ***
    items: {
        type: [partyItemSchema],
        required: [true, 'Items array is required'],
        validate: {
            validator: function(items) {
                return Array.isArray(items) && items.length > 0;
            },
            message: 'A party must contain at least one item.'
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
partySchema.index({ userId: 1, type: 1 });
partySchema.index({ userId: 1, name: 1 });

const Party = mongoose.model("Party", partySchema);
export default Party;

