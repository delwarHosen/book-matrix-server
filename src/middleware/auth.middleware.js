

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async (req, res, next) => {
    try {
        // সঠিকভাবে হেডার থেকে টোকেন নেওয়া
        const authHeader = req.headers.authorization; // ছোট 'a' ব্যবহার করুন
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No authorization access token" });
        }

        // "Bearer " অংশ কেটে টোকেন নিন
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(401).json({ message: "Token is not valid" });

        req.user = user;
        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Token is not valid" });
    }
}

export default protectedRoute;
