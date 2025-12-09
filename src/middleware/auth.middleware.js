import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.headers("Authorization").replace("Bearer", "");
        if (!token) return res.status(401).json({ message: "no authorization access token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password")
        if (!user) return res.status(401).json({ message: "token is not valid" });

        req.user = user;
        next()

    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "token is not valid" });
    }
}

export default protectedRoute;