import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    billNo: {
        type: String,
        required: true,
        unique: true
    },
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
    },
    materialName: {
        type: String
    },
    category: {
        type: String,
        enum: ['Raw', 'Semi-Finished', 'Final']
    },
    type: {
        type: String,
        enum: ['Purchase', 'Sale', 'Payment', 'Receipt'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    debit: {
        type: Number,
        default: 0,
        min: 0
    },
    credit: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        default: 0
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party'
    },
    partyName: {
        type: String
    },
    notes: {
        type: String,
        trim: true
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
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, partyId: 1, date: 1 });
transactionSchema.index({ billNo: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;

