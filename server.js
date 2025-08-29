import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createSuperAdminController, login } from "./src/modules/auth/auth.controller.js";
import { createCompany } from "./src/modules/company/company.controller.js";

import companyRoutes from "./src/modules/company/company.routes.js";
import driverRoutes from "./src/modules/driver/ driver.routes.js";
import roleRoutes from "./src/modules/Permission_and_Roles/role.routes.js";
import shiftsRoutes from "./src/modules/shifts/shifts.routes.js";
import moduleRoutes from "./src/modules/modules/ module.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import rolePermissionRoutes from "./src/modules/Permission_and_Roles/rolePermission.routes.js";
import cutOffWindowsRoutes from "./src/modules/cutOffWindow/cutoffWindow.Routes.js";
import vendorRoutes from "./src/modules/vendor/vendor.routes.js";
import vehicleRoutes from "./src/modules/vehicle/vehicle.routes.js";
import { db } from "./src/utils/firebase.js";
import { fileURLToPath } from "url";
import path from "path";
import seedRoutes from "./src/seed/modules.seed.js";
import { truncateTable } from "./src/utils/truncateTable.js";
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


app.post("/api/truncate", truncateTable);



// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Serve the "upload" folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Public Routes
app.post("/api/auth/login", login);
app.use("/api/seed", seedRoutes);
app.post('/api/auth/register', createSuperAdminController);

app.post("/api/company", createCompany); // optional: if company creation is public



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
app.use("/api/shifts", shiftsRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api", cutOffWindowsRoutes);
// ✅ 404 Handler (must be at the end)
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
