import express from "express";
import cloudinary from '../lib/cloudinary.js'
import protectedRoute from "../middleware/auth.middleware.js";
import Book from "../models/Books.js";
import { populate } from "dotenv";
const router = express.Router();

router.post("/", protectedRoute, async (req, res) => {
    try {
        const { title, caption, image, rating } = req.body;

        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ message: "Please provide all field" });
        }

        //    cloudinary image uploaded
        const uploadRespons = await cloudinary.uploader.upload(image);
        const imageUrl = uploadRespons.secure_url;

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })

        newBook.save();

        res.status(201).json(newBook)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})




router.get("/", protectedRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find().sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        populate("user", "username profileImage")

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" });
    }
})




router.get("/user", protectedRoute, async (req, res) => {
    try {
        const books = await find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books)

    } catch (error) {
        console.log("Get user books error",error.message)
        res.status(500).json({ message: "internal server error" });
    }
})


// delete
router.delete("/:id", protectedRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });


        if (book.user.toString !== req.user._id.toString()) {
            return res.status(401).json({ message: "unauthorize" });
        }

        // cloudinary image deleted
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting from courdinary image", deleteError)
            }
        }

        await book.deleteOne();

        res.json({ message: "The book successfully deleted" });

    } catch (error) {
        console.log("Delete book:", error);
        res.status(500).json({ message: "internal server error" })
    }
})

export default router;