import express from 'express';
import {
    getMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
} from '../controllers/materialController.js';

const router = express.Router();

// GET all materials (with optional category filter)
router.get('/', getMaterials);

// GET single material by ID
router.get('/:id', getMaterialById);

// CREATE new material
router.post('/', createMaterial);

// UPDATE material
router.put('/:id', updateMaterial);

// DELETE material
router.delete('/:id', deleteMaterial);

export default router;
