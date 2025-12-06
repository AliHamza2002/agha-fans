import Material from "../models/materialSchema.js";

// GET all materials for logged-in user
export const getMaterials = async (req, res) => {
    try {
        const userId = req.user._id; // Will be set by auth middleware
        const userRole = req.user.role; // Get user role
        const { category } = req.query;

        // *** ADMIN FEATURE: Admin can see all materials from all users ***
        const query = {};
        
        // If not admin, filter by userId
        if (userRole !== 'admin') {
            query.userId = userId;
        }
        
        if (category) {
            query.category = category;
        }

        const materials = await Material.find(query).sort({ createdAt: -1 });
        res.status(200).json({ materials });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET single material by ID
export const getMaterialById = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;

        // *** ADMIN FEATURE: Admin can view any material ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        const material = await Material.findOne(query);
        if (!material) {
            return res.status(404).json({ error: "Material not found" });
        }

        res.status(200).json({ material });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE new material
export const createMaterial = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { name, category, unit, quantity, unitPrice, description, lowStockThreshold } = req.body;

        // Validate required fields
        if (!name || !category || !unit) {
            return res.status(400).json({ error: "Name, category, and unit are required" });
        }

        // Role-based category validation
        if (userRole === 'storeBoy' && category === 'Final') {
            return res.status(403).json({ error: "StoreBoy cannot create Final category materials" });
        }

        // Create material
        const material = await Material.create({
            name,
            category,
            unit,
            quantity: quantity || 0,
            unitPrice,
            description,
            lowStockThreshold: lowStockThreshold || 0,
            userId
        });

        res.status(201).json({ material });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE material
export const updateMaterial = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;
        const { name, category, unit, quantity, unitPrice, description, lowStockThreshold } = req.body;

        // *** ADMIN FEATURE: Admin can update any material ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        // Find material
        const material = await Material.findOne(query);
        if (!material) {
            return res.status(404).json({ error: "Material not found" });
        }

        // Role-based category validation
        if (userRole === 'storeBoy' && (category === 'Final' || material.category === 'Final')) {
            return res.status(403).json({ error: "StoreBoy cannot modify Final category materials" });
        }

        // Update fields
        if (name !== undefined) material.name = name;
        if (category !== undefined) material.category = category;
        if (unit !== undefined) material.unit = unit;
        if (quantity !== undefined) material.quantity = quantity;
        if (unitPrice !== undefined) material.unitPrice = unitPrice;
        if (description !== undefined) material.description = description;
        if (lowStockThreshold !== undefined) material.lowStockThreshold = lowStockThreshold;

        await material.save();

        res.status(200).json({ material });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE material
export const deleteMaterial = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;

        // *** ADMIN FEATURE: Admin can delete any material ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        // Find material
        const material = await Material.findOne(query);
        if (!material) {
            return res.status(404).json({ error: "Material not found" });
        }

        // Role-based category validation
        if (userRole === 'storeBoy' && material.category === 'Final') {
            return res.status(403).json({ error: "StoreBoy cannot delete Final category materials" });
        }

        // TODO: Check if material has transactions before deleting
        // For now, we'll allow deletion

        await Material.deleteOne({ _id: id });

        res.status(200).json({ message: "Material deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
