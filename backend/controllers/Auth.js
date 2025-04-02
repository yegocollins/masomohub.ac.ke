const User = require('../models/user_model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();


class Auth {
    static async signup(req, res) {
        console.time("Signup Execution Time");
        try {
            const { f_name, l_name, email, password, major, role } = req.body;

            if (!f_name || !l_name || !email || !password || !major || !role) {
                return res.status(400).json({ error: "All fields are required" });
            }

            let existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "User already exists" });
            }

            let hashedPassword = await bcrypt.hash(password, 10);
            let newUser = new User({ f_name, l_name, email, password: hashedPassword, major, role });
            const response = await newUser.save();

            console.timeEnd("Signup Execution Time");
            return res.status(201).json({ message: "Signup successful", user: response });
        } catch (e) {
            console.error("Signup error:", e);
            return res.status(500).json({ error: "Registration failed", details: e.message });
        }
    }

    static async login(req, res) {
        try {
            console.log("Login request received");
            const { email, password } = req.body;
    
            if (!email || !password) {
                console.log("Missing credentials");
                return res.status(400).json({ error: "Email and password are required" });
            }
    
            console.log("Checking if user exists...");
            let user = await User.findOne({ email }).lean();
            if (!user) {
                console.log("User not found");
                return res.status(401).json({ error: "No account found. Please sign up." });
            }
    
            console.log("Comparing password...");
            let isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.log("Wrong password");
                return res.status(401).json({ error: "Wrong password" });
            }
    
            console.log("Generating token...");
            const token = jwt.sign(
                { user_id: user._id, user_role: user.role },
                process.env.TOKEN_SECRET,
                { expiresIn: '1h' }
            );
            console.log("Token generated successfully");
    
            return res.status(200).json({ token });
        } catch (e) {
            console.error("Login error:", e);
            return res.status(500).json({ error: "Login failed", details: e.message });
        }
    }
    

    static async profile(req, res) {
        try {
            const user = await User.findById(req.user.user_id).select("-password");
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json(user);
        } catch (e) {
            console.error("Profile error:", e);
            return res.status(500).json({ error: "Error fetching profile" });
        }
    }

    static async getStudents(req, res) {
        try {
            const users = await User.find({ role: "student" }).select("-password");
            if (users.length === 0) {
                return res.status(404).json({ message: "No students found" });
            }
            return res.status(200).json(users);
        } catch (e) {
            console.error("Get students error:", e);
            return res.status(500).json({ error: "Error getting students" });
        }
    }
}

module.exports = Auth;
