// /src/modules/companyVendor/companyVendor.routes.js
import { Router } from "express";
import {
  assignVendorsToCompany,
  assignCompaniesToVendor,
  getVendorsByCompany,
  getCompaniesByVendor,
  removeVendorFromCompany,
  removeCompanyFromVendor,
} from "./companyVendor.controller.js";

const router = Router();

// ==============================
// COMPANY-VENDOR ASSIGNMENT ROUTES
// ==============================

// 1️⃣ Assign vendors to a specific company
router.post("/companies/:companyId/vendors", assignVendorsToCompany);

// 2️⃣ Assign companies to a specific vendor
router.post("/vendors/:vendorId/companies", assignCompaniesToVendor);

// 3️⃣ Get all vendors assigned to a specific company
router.get("/companies/:companyId/vendors", getVendorsByCompany);

// 4️⃣ Get all companies assigned to a specific vendor
router.get("/vendors/:vendorId/companies", getCompaniesByVendor);

// 5️⃣ Remove a vendor from a company
router.delete("/companies/:companyId/vendors/:vendorId", removeVendorFromCompany);

// 6️⃣ Remove a company from a vendor
router.delete("/vendors/:vendorId/companies/:companyId", removeCompanyFromVendor);

export default router;
