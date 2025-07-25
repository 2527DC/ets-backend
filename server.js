import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { login } from "./src/modules/auth/auth.controller.js";
import { createCompany } from "./src/modules/company/company.controller.js";

import companyRoutes from "./src/modules/company/company.routes.js";
import driverRoutes from "./src/modules/driver/ driver.routes.js";
import roleRoutes from "./src/modules/Permission_and_Roles/role.routes.js";
import moduleRoutes from "./src/modules/modules/ module.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import rolePermissionRoutes from "./src/modules/Permission_and_Roles/rolePermission.routes.js";

import { db } from "./src/utils/firebase.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5174", // your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ✅ Public Routes
app.post("/api/auth/login", login);
app.post("/api/company", createCompany); // optional: if company creation is public

// ✅ Health check or public info
app.get("/api/message", (req, res) => {
  res.send("✅ Fleet backend API is running");
});

// ✅ Firebase init (optional to protect it with auth)
app.post("/firebase-node", async (req, res) => {
  try {
    const baseRef = db.ref("ets-node");

    await baseRef.set({
      locations: { _placeholder: "init" },
      activeTrips: { _placeholder: "init" },
      driverActiveTrips: { _placeholder: "init" },
      employeeActiveTrips: { _placeholder: "init" },
    });

    res
      .status(200)
      .json({ message: "ets-node initialized with all subnodes." });
  } catch (error) {
    console.error("Firebase init error:", error);
    res.status(500).json({ message: "Initialization failed.", error });
  }
});

// ✅ Protected Routes (apply authentication middleware to /api/*)
// app.use("/api", authenticate);

// ✅ All authenticated API routes
app.use("/api/roles", roleRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);

// ✅ 404 Handler (must be at the end)
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
