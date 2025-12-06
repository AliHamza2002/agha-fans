import express from 'express';
import {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

// GET all transactions (with optional filters)
router.get('/', getTransactions);

// GET single transaction by ID
router.get('/:id', getTransactionById);

// CREATE new transaction
router.post('/', createTransaction);

// UPDATE transaction
router.put('/:id', updateTransaction);

// DELETE transaction
router.delete('/:id', deleteTransaction);

export default router;

