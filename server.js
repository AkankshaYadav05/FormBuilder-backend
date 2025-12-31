import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import userRoutes from "./routes/users.js";
import formRoutes from "./routes/FormRoutes.js";
import responseRoutes from "./routes/responses.js";

console.log("ENV CHECK:", {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: !!process.env.MONGO_URI,
  SESSION_SECRET: !!process.env.SESSION_SECRET,
});


// ===== Setup __dirname in ES modules =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== CORS =====
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "https://form-builder-frontend-cyan-omega.vercel.app",
        "http://localhost:5173"
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// ===== Multer Configuration =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads')); // save in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // or add timestamp for uniqueness
  }
});

const upload = multer({ storage });

// ===== File Upload Endpoint =====
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Return file path for frontend to save in DB
  res.json({ filePath: `/uploads/${req.file.filename}` });
});


// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ===== Session =====
app.set("trust proxy", 1); 

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 🔑
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);



// ===== Routes =====
app.use("/api/users", userRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

// ===== Serve Uploaded Files and frontend =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.get('*', (_,res) => {
//    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
// });

// ===== Test Route =====
app.get("/api/test", (req, res) => {
  res.json({ msg: "Backend is working!" });
});


const PORT = process.env.PORT || 5000;

// ===== MongoDB Connection & Start Server =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error("MongoDB connection error:", err));


