import User from "../models/userSchema.js";

// Simple authentication middleware
// For now, we'll use a header-based approach since we don't have JWT yet
export const authenticate = async (req, res, next) => {
    try {
        // Get user email from header (sent by frontend)
        const userEmail = req.headers['x-user-email'];

        if (!userEmail) {
            return res.status(401).json({ error: "Authentication required" });
        }

        // Find user by email
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        // Map frontend roles to backend roles
        const roleMap = {
            'Admin': 'admin',
            'StoreBoy': 'storeBoy',
            'FinalBoy': 'finalBoy'
        };

        const userRole = req.user.role;
        const normalizedAllowedRoles = allowedRoles.map(role => roleMap[role] || role);

        if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({ error: "Access denied. Insufficient permissions." });
        }

        next();
    };
};
