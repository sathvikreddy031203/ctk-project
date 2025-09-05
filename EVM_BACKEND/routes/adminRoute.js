import express from "express";
import multer from "multer";


const adminRouter=express.Router();

const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


adminRouter.post("/upload", upload.single("eventImage"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
    res.status(201).json({ imageUrl });
});





export default adminRouter;

