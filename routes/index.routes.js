const express = require("express");
const authMiddleware = require("../middlewares/auth");
const multer = require("multer");
const supabase = require("../config/supabase");
const axios = require("axios");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileModel = require("../models/files.models");

router.get("/home", authMiddleware, async (req, res) => {
  try {
    const userFiles = await fileModel.find({ user: req.user.userId });
    res.render("home", { files: userFiles });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post(
  "/upload-file",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
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

      if (error) {
        console.error("Supabase Upload Error:", error.message);
        return res.status(500).json({ error: error.message });
      }

      // Save file record to database
      const newFile = await fileModel.create({
        path: data.path,
        user: req.user.userId,
      });

      const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/drive/${data.path}`;

      return res.json({ success: true, file: newFile, url: fileUrl });
    } catch (err) {
      console.error("Unexpected Error:", err);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.get("/download/:path", authMiddleware, async (req, res) => {
  try {
    const filePath = req.params.path;

    // Get the public URL of the file
    const { data } = supabase.storage.from("drive").getPublicUrl(filePath);
    const fileUrl = data.publicUrl;

    if (!fileUrl) {
      return res.status(404).json({ error: "File not found" });
    }

    // Fetch the file from Supabase Storage
    const response = await axios.get(fileUrl, { responseType: "stream" });

    // Set headers to force download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filePath.split("/").pop()}"`
    );
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Stream the file to the user
    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
