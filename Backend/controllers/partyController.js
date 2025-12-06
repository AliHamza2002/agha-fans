import Party from "../models/partySchema.js";
import Transaction from "../models/transactionSchema.js";

// GET all parties (visible to all users)
export const getParties = async (req, res) => {
    try {
        const userRole = req.user.role;
        const { type } = req.query;

        // *** SHARED ACCESS: All users can see all parties ***
        const query = {};
        
        if (type) {
            query.type = type;
        }

        // *** FIX: Explicitly select all fields including items ***
        const parties = await Party.find(query).select('+items').sort({ name: 1 });
        
        // *** DEBUG: Log parties with items count ***
        console.log(`Fetched ${parties.length} parties for ${userRole}`);
        parties.forEach(p => {
            console.log(`Party: ${p.name}, Items: ${p.items?.length || 0}`);
        });
        
        res.status(200).json({ parties });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET single party by ID (visible to all users)
export const getPartyById = async (req, res) => {
    try {
        const { id } = req.params;

        // *** SHARED ACCESS: All users can view any party ***
        const query = { _id: id };

        // *** FIX: Explicitly select items field ***
        const party = await Party.findOne(query).select('+items');
        if (!party) {
            return res.status(404).json({ error: "Party not found" });
        }

        res.status(200).json({ party });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE new party
export const createParty = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, type, contact, items } = req.body; // *** FEATURE: Accept items ***

        // *** DEBUG: Log received data ***
        console.log('Creating party - Received data:', { name, type, contact, items });
        console.log('Items count:', items?.length || 0);

        // Validate required fields
        if (!name || !type) {
            return res.status(400).json({ error: "Name and type are required" });
        }

        // Validate party type
        if (!['Buyer', 'Supplier'].includes(type)) {
            return res.status(400).json({ error: "Invalid party type. Must be 'Buyer' or 'Supplier'" });
        }

        // *** FEATURE: Validate items array - must have at least one item ***
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "A party must contain at least one item." });
        }

        // *** FEATURE: Validate each item has required fields ***
        // *** ROLE-BASED: Allow price >= 0 (StoreBoy can have 0, Admin can set actual price) ***
        for (const item of items) {
            if (!item.itemName || item.itemName.trim() === '') {
                return res.status(400).json({ error: "Each item must have an itemName" });
            }
            // Allow price >= 0 for all users
            if (item.itemPrice === undefined || item.itemPrice < 0) {
                return res.status(400).json({ error: "Each item must have a valid itemPrice (>= 0)" });
            }
        }

        // *** FIX: Ensure items are explicitly passed (not undefined) ***
        if (!items) {
            return res.status(400).json({ error: "Items are required" });
        }

        // Create party with items
        const party = await Party.create({
            name,
            type,
            contact,
            items, // *** FEATURE: Store items with party ***
            userId
        });

        // *** DEBUG: Log created party ***
        console.log('Party created successfully:', party);
        console.log('Saved items:', party.items);

        res.status(201).json({ party });
    } catch (error) {
        // *** FIX: Better error handling for validation errors ***
        console.error('Error creating party:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// UPDATE party
export const updateParty = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;
        const { name, type, contact, items } = req.body; // *** FEATURE: Accept items ***

        // *** ADMIN FEATURE: Admin can update any party ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        // Find party
        const party = await Party.findOne(query);
        if (!party) {
            return res.status(404).json({ error: "Party not found" });
        }

        // Update fields
        if (name !== undefined) party.name = name;
        if (type !== undefined) {
            if (!['Buyer', 'Supplier'].includes(type)) {
                return res.status(400).json({ error: "Invalid party type" });
            }
            party.type = type;
        }
        if (contact !== undefined) party.contact = contact;

        // *** FEATURE: Update items if provided ***
        if (items !== undefined) {
            // Validate items array
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: "A party must contain at least one item." });
            }
            
            // Validate each item
            // *** ROLE-BASED: Allow price >= 0 for all users ***
            for (const item of items) {
                if (!item.itemName || item.itemName.trim() === '') {
                    return res.status(400).json({ error: "Each item must have an itemName" });
                }
                if (item.itemPrice === undefined || item.itemPrice < 0) {
                    return res.status(400).json({ error: "Each item must have a valid itemPrice (>= 0)" });
                }
            }
            
            party.items = items;
        }

        await party.save();

        // Update party name in all related transactions
        if (name && name !== party.name) {
            await Transaction.updateMany(
                { userId, partyId: id },
                { $set: { partyName: name } }
            );
        }

        res.status(200).json({ party });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE party
export const deleteParty = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { id } = req.params;

        // *** ADMIN FEATURE: Admin can delete any party ***
        const query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        // Find party
        const party = await Party.findOne(query);
        if (!party) {
            return res.status(404).json({ error: "Party not found" });
        }

        // Check if party has transactions (check all transactions if admin)
        const txQuery = { partyId: id };
        if (userRole !== 'admin') {
            txQuery.userId = userId;
        }
        
        const transactionCount = await Transaction.countDocuments(txQuery);
        if (transactionCount > 0) {
            return res.status(400).json({ 
                error: "Cannot delete party with existing transactions. Please delete all transactions first." 
            });
        }

        await Party.deleteOne({ _id: id });

        res.status(200).json({ message: "Party deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// *** FEATURE: GET items for a specific party (visible to all users) ***
export const getPartyItems = async (req, res) => {
    try {
        const { partyId } = req.params;

        // *** SHARED ACCESS: All users can view any party's items ***
        const query = { _id: partyId };

        // Find party and return only items
        const party = await Party.findOne(query, 'items');
        if (!party) {
            return res.status(404).json({ error: "Party not found" });
        }

        res.status(200).json({ items: party.items || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

