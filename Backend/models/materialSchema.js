import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Raw', 'Semi-Finished', 'Final'],
        required: true
    },
    unit: {
        type: String,
        enum: ['kg', 'pcs'],
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    unitPrice: {
        type: Number,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    lowStockThreshold: {
        type: Number,
        default: 0,
        min: 0
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
materialSchema.index({ userId: 1, category: 1 });
materialSchema.index({ userId: 1, name: 1 });

const Material = mongoose.model("Material", materialSchema);
export default Material;
