const express = require("express");
const authMiddleware = require("../middlewares/auth");
const multer = require("multer");
const supabase = require("../config/supabase");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileModel = require("../models/files.models");

router.get("/home", authMiddleware, (req, res) => {
  res.render("home");
});

router.post(
  "/upload-file",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const filePath = `${Date.now()}-${file.originalname}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("drive")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });
    console.log(data.path);

    const newFile = await fileModel.create({
      path: data.path,
      user: req.user.userId,
    });
    res.json(newFile);

    if (error) {
      console.error("Supabase Upload Error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    const fileUrl = `https://cxvqxouxjjoobewavndh.supabase.co/storage/v1/object/public/drive/${filePath}`;

    res.json({ success: true, url: fileUrl });
  }
);

module.exports = router;
