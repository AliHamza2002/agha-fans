import Transaction from "../models/transactionSchema.js";
import Material from "../models/materialSchema.js";
import Party from "../models/partySchema.js";

// Generate unique bill number
function generateBillNo() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BILL-${timestamp}-${random}`;
}

// GET all transactions for logged-in user
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { partyId, type, startDate, endDate } = req.query;

        // *** ADMIN FEATURE: Admin can see all transactions from all users ***
        const query = {};
        
        // If not admin, filter by userId
        if (userRole !== 'admin') {
            query.userId = userId;
        }
        
        if (partyId) query.partyId = partyId;
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET single transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;

        // *** ADMIN FEATURE: Admin can view any transaction ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        const transaction = await Transaction.findOne(query);
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.status(200).json({ transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE new transaction
export const createTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, materialId, type, quantity, unitPrice, partyId, notes } = req.body;

        // Validate required fields
        if (!type || !quantity || unitPrice === undefined) {
            return res.status(400).json({ error: "Type, quantity, and unitPrice are required" });
        }

        // Validate transaction type
        if (!['Purchase', 'Sale', 'Payment', 'Receipt'].includes(type)) {
            return res.status(400).json({ error: "Invalid transaction type" });
        }

        let materialName, category;
        
        // Get material details if materialId provided
        if (materialId && (type === 'Purchase' || type === 'Sale')) {
            // *** ADMIN FEATURE: Admin can create transactions for any material ***
            const material = await Material.findOne({ _id: materialId });
            if (!material) {
                return res.status(404).json({ error: "Material not found" });
            }
            materialName = material.name;
            category = material.category;

            // Update material quantity
            const delta = type === 'Purchase' ? quantity : -quantity;
            material.quantity = Math.max(0, material.quantity + delta);
            await material.save();
        }

        // Get party details if partyId provided
        let partyName;
        if (partyId) {
            // *** ADMIN FEATURE: Admin can create transactions for any party ***
            const party = await Party.findOne({ _id: partyId });
            if (party) {
                partyName = party.name;
            }
        }

        // Calculate debit/credit
        const totalAmount = quantity * unitPrice;
        let debit = 0, credit = 0;
        
        if (type === 'Purchase' || type === 'Sale') {
            debit = totalAmount;
        } else if (type === 'Payment' || type === 'Receipt') {
            credit = totalAmount;
        }

        // Calculate running balance
        const partyTransactions = await Transaction.find({ userId, partyId }).sort({ date: 1 });
        let runningTotal = partyTransactions.reduce((sum, t) => sum + t.debit - t.credit, 0);
        runningTotal += debit - credit;

        // Create transaction
        const transaction = await Transaction.create({
            date: date || new Date(),
            billNo: generateBillNo(),
            materialId,
            materialName,
            category,
            type,
            quantity,
            unitPrice,
            debit,
            credit,
            total: runningTotal,
            partyId,
            partyName,
            notes,
            userId
        });

        res.status(201).json({ transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE transaction
export const updateTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;
        const { date, materialId, type, quantity, unitPrice, partyId, notes } = req.body;

        // *** ADMIN FEATURE: Admin can update any transaction ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        // Find transaction
        const transaction = await Transaction.findOne(query);
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        // Revert previous material quantity change if applicable
        if (transaction.materialId && (transaction.type === 'Purchase' || transaction.type === 'Sale')) {
            // *** ADMIN FEATURE: Admin can update any transaction/material ***
            const material = await Material.findOne({ _id: transaction.materialId });
            if (material) {
                const revertDelta = transaction.type === 'Purchase' ? -transaction.quantity : transaction.quantity;
                material.quantity = Math.max(0, material.quantity + revertDelta);
                await material.save();
            }
        }

        // Update fields
        if (date !== undefined) transaction.date = date;
        if (type !== undefined) transaction.type = type;
        if (quantity !== undefined) transaction.quantity = quantity;
        if (unitPrice !== undefined) transaction.unitPrice = unitPrice;
        if (partyId !== undefined) transaction.partyId = partyId;
        if (notes !== undefined) transaction.notes = notes;

        // Update material details if materialId changed
        if (materialId && materialId !== transaction.materialId?.toString()) {
            // *** ADMIN FEATURE: Admin can update any material ***
            const material = await Material.findOne({ _id: materialId });
            if (!material) {
                return res.status(404).json({ error: "Material not found" });
            }
            transaction.materialId = materialId;
            transaction.materialName = material.name;
            transaction.category = material.category;
        }

        // Update party name if partyId changed
        if (partyId && partyId !== transaction.partyId?.toString()) {
            // *** ADMIN FEATURE: Admin can update any party ***
            const party = await Party.findOne({ _id: partyId });
            if (party) {
                transaction.partyName = party.name;
            }
        }

        // Apply new material quantity change
        if (transaction.materialId && (transaction.type === 'Purchase' || transaction.type === 'Sale')) {
            // *** ADMIN FEATURE: Admin can update any material ***
            const material = await Material.findOne({ _id: transaction.materialId });
            if (material) {
                const delta = transaction.type === 'Purchase' ? transaction.quantity : -transaction.quantity;
                material.quantity = Math.max(0, material.quantity + delta);
                await material.save();
            }
        }

        // Recalculate debit/credit
        const totalAmount = transaction.quantity * transaction.unitPrice;
        if (transaction.type === 'Purchase' || transaction.type === 'Sale') {
            transaction.debit = totalAmount;
            transaction.credit = 0;
        } else {
            transaction.debit = 0;
            transaction.credit = totalAmount;
        }

        await transaction.save();

        // Recalculate running balances for this party
        // *** ADMIN FEATURE: Use transaction's userId, not current user's ID ***
        await recalculatePartyBalances(transaction.userId, transaction.partyId);

        // Get updated transaction
        const updatedTransaction = await Transaction.findById(id);
        res.status(200).json({ transaction: updatedTransaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE transaction
export const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;

        // *** ADMIN FEATURE: Admin can delete any transaction ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        // Find transaction
        const transaction = await Transaction.findOne(query);
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        // Revert material quantity change if applicable
        if (transaction.materialId && (transaction.type === 'Purchase' || transaction.type === 'Sale')) {
            // *** ADMIN FEATURE: Admin can delete any transaction and revert any material ***
            const material = await Material.findOne({ _id: transaction.materialId });
            if (material) {
                const delta = transaction.type === 'Purchase' ? -transaction.quantity : transaction.quantity;
                material.quantity = Math.max(0, material.quantity + delta);
                await material.save();
            }
        }

        const partyId = transaction.partyId;
        await Transaction.deleteOne({ _id: id });

        // Recalculate running balances for this party
        // *** ADMIN FEATURE: Use transaction's userId, not current user's ID ***
        if (transaction.partyId) {
            await recalculatePartyBalances(transaction.userId, transaction.partyId);
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to recalculate running balances for a party
async function recalculatePartyBalances(userId, partyId) {
    if (!partyId) return;

    const transactions = await Transaction.find({ userId, partyId }).sort({ date: 1 });
    let runningTotal = 0;

    for (const tx of transactions) {
        runningTotal += tx.debit - tx.credit;
        tx.total = runningTotal;
        await tx.save();
    }
}

