// load environment variables before any other imports
import 'dotenv/config';

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";

// debug log loaded credentials so mis-spellings are obvious
console.log('env loaded:', {
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: !!process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: !!process.env.CLOUD_API_SECRET,
});

import userRoutes from "./routes/users.js";
import formRoutes from "./routes/FormRoutes.js";
import responseRoutes from "./routes/responses.js";
import uploadRoute from "./routes/upload.js";


// ===== Setup __dirname in ES modules =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== CORS =====
app.use(
  cors({
    origin: [
      "https://form-builder-frontend-cyan-omega.vercel.app", 
      "http://localhost:5173" 
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true, 
  })
);

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ===== Session =====
app.set("trust proxy", 1);

const isProd = process.env.NODE_ENV === "production";

app.use(session({
  name: "formbuilder.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    httpOnly: true,
    secure: isProd,                 // ✅ true only in production
    sameSite: isProd ? "none" : "lax", // ✅ prod vs local
    maxAge: 1000 * 60 * 60 * 24,
  },
}));


// ===== Routes =====
app.use("/api/users", userRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/upload", uploadRoute);

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


