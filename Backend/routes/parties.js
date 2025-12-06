import express from 'express';
import {
    getParties,
    getPartyById,
    createParty,
    updateParty,
    deleteParty,
    getPartyItems // *** FEATURE: Import new function ***
} from '../controllers/partyController.js';

const router = express.Router();

// GET all parties (with optional type filter)
router.get('/', getParties);

// *** FEATURE: GET items for a specific party (must be before /:id route) ***
router.get('/:partyId/items', getPartyItems);

// GET single party by ID
router.get('/:id', getPartyById);

// CREATE new party
router.post('/', createParty);

// UPDATE party
router.put('/:id', updateParty);

// DELETE party
router.delete('/:id', deleteParty);

export default router;

