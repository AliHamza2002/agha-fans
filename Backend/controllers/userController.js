import User from "../models/userSchema.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const allowedRoles = ["storeBoy", "admin", "finalBoy"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // Check if admin already exists when trying to register as admin
        if (role === "admin") {
            const existingAdmin = await User.findOne({ role: "admin" });
            if (existingAdmin) {
                return res.status(403).json({
                    error: "Admin already exists. Only one admin is allowed in the system."
                });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.status(201).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
