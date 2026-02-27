import express from "express";
import { uploadImage, uploadDocument } from "../upload.js";
import { requireLogin } from "../middleware.js";

const router = express.Router();

// POST /api/upload/image - Upload profile image
router.post("/image", requireLogin, (req, res) => {
  console.log('🔄 image upload endpoint called');
  uploadImage.single("file")(req, res, (err) => {
    if (err) {
      console.error("❌ Image upload error:", err.message);
      if (err.message.includes("only")) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: "Image upload failed", error: err.message });
    }

    if (!req.file) {
      console.warn("⚠️ No file provided in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      console.log("✅ Image uploaded successfully:", {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      });

      res.status(200).json({
        message: "Image upload successful",
        filePath: req.file.path,  
        url: req.file.path,
        public_id: req.file.filename,
        size: req.file.size,
      });
    } catch (err) {
      console.error("❌ Response error:", err);
      res.status(500).json({ message: "Error processing upload response", error: err.message });
    }
  });
});

// POST /api/upload/document - Upload form document
router.post("/document", requireLogin, (req, res) => {
  console.log('🔄 document upload endpoint called');
  uploadDocument.single("file")(req, res, (err) => {
    if (err) {
      console.error("❌ Document upload error:", err.message);
      if (err.message.includes("only")) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: "Document upload failed", error: err.message });
    }

    if (!req.file) {
      console.warn("⚠️ No file provided in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      console.log("✅ Document uploaded successfully:", {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      });

      res.status(200).json({
        message: "Document upload successful",
        filePath: req.file.path,
        url: req.file.path,
        public_id: req.file.filename,
        size: req.file.size,
      });
    } catch (err) {
      console.error("❌ Response error:", err);
      res.status(500).json({ message: "Error processing upload response", error: err.message });
    }
  });
});

// Legacy endpoint - defaults to image upload for backwards compatibility
router.post("/", requireLogin, (req, res) => {
  uploadImage.single("file")(req, res, (err) => {
    if (err) {
      console.error("❌ Upload error:", err.message);
      return res.status(500).json({ message: "Upload failed", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      message: "Upload successful",
      filePath: req.file.path,  
      url: req.file.path,
      public_id: req.file.filename,
      size: req.file.size,
    });
  });
});

export default router;
