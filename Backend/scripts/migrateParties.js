import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Party from '../models/partySchema.js';

dotenv.config();

/**
 * Migration script to add default items to existing parties without items
 * Run this once to fix parties created before items feature was implemented
 */
async function migrateParties() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all parties without items or with empty items array
        const partiesWithoutItems = await Party.find({
            $or: [
                { items: { $exists: false } },
                { items: { $size: 0 } }
            ]
        });

        console.log(`Found ${partiesWithoutItems.length} parties without items`);

        if (partiesWithoutItems.length === 0) {
            console.log('No parties need migration. All parties have items.');
            process.exit(0);
        }

        // Update each party with a default item
        for (const party of partiesWithoutItems) {
            console.log(`Migrating party: ${party.name}`);
            
            // Add a default item
            party.items = [{
                itemName: 'Default Item',
                itemPrice: 0
            }];

            // Save with validation disabled temporarily
            await party.save({ validateBeforeSave: true });
            console.log(`✓ Added default item to: ${party.name}`);
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('⚠️  Please update these parties with actual items through the UI.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run migration
migrateParties();

