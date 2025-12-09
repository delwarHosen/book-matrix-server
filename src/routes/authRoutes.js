import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d"
    });
};


router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All field are rewuired" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 character long" });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: "UserName must be at least 3 character long" });
        }


        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: "This Email has been already exist" });


        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: "This userName has been already exist" });

        const profileImage = `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}`

        const user = new User({
            username,
            email,
            password,
            profileImage
        })

        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All field are rewuired" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid cradential" });


        const isPasswordCurrect = await user.comparePassword(password);
        if (!isPasswordCurrect) return res.status(400).json({ message: "Invalid cradential" });

        const token = generateToken(user._id);
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

export default router;


