// /src/modules/companyVendor/companyVendor.controller.js
import companyVendorService from './companyVendor.service.js';


// 1️⃣ Assign vendors to a company
export const assignVendorsToCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    let { vendorIds } = req.body;

    if (!vendorIds) {
      return res.status(400).json({ 
        success: false, 
        message: "vendorIds are required" 
      });
    }

    // ✅ Normalize: convert single value to array
    if (!Array.isArray(vendorIds)) {
      vendorIds = [vendorIds];
    }

    const assignments = await companyVendorService.assignVendorsToCompanyService(
      Number(companyId),
      vendorIds.map(Number)
    );

    return res.status(201).json({ success: true, assignments });
  } catch (err) {
    console.error("❌ assignVendorsToCompany error:", err);
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || "Failed to assign vendors to company" 
    });
  }
};



// 2️⃣ Assign companies to a vendor

export const assignCompaniesToVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    let { companyIds } = req.body;

    if (!companyIds) {
      return res.status(400).json({
        success: false,
        message: "companyIds are required",
      });
    }

    // ✅ Normalize single value to array
    if (!Array.isArray(companyIds)) {
      companyIds = [companyIds];
    }

    const result = await companyVendorService.assignCompaniesToVendorService(
      Number(vendorId),
      companyIds.map(Number)
    );

    return res.status(201).json({
      success: true,
      message: "Companies assigned successfully",
      result,
    });
  } catch (err) {
    console.error("❌ assignCompaniesToVendor error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to assign companies to vendor",
    });
  }
};



// 3️⃣ Get vendors assigned to a company
export const getVendorsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const vendors = await companyVendorService.getVendorsByCompanyService(Number(companyId));

    if (!vendors || vendors.length === 0) {
      return res.status(404).json({ success: false, message: "No vendors found for this company" });
    }

    return res.status(200).json({ success: true, vendors });
  } catch (err) {
    console.error("❌ getVendorsByCompany error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Failed to fetch vendors" });
  }
};



export const getCompaniesByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

  const companies = await companyVendorService.getCompaniesByVendorService(Number(vendorId));

    if (!companies || companies.length === 0) {
      return res.status(404).json({ success: false, message: "No companies assigned to this vendor" });
    }

    return res.status(200).json({ success: true, companies });
  } catch (err) {
    console.error("❌ getCompaniesByVendor error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Failed to fetch companies" });
  }
};


// 5️⃣ Remove a vendor from a company
export const removeVendorFromCompany = async (req, res) => {
  try {
    const { companyId, vendorId } = req.params;
    await companyVendorService.removeVendorFromCompanyService(Number(companyId), Number(vendorId));
    return res.json({ success: true, message: "Vendor removed from company successfully" });
  } catch (err) {
    console.error("❌ removeVendorFromCompany error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Failed to remove vendor from company" });
  }
};

// 6️⃣ Remove a company from a vendor
export const removeCompanyFromVendor = async (req, res) => {
  try {
    const { vendorId, companyId } = req.params;
    await companyVendorService.removeCompanyFromVendorService(Number(vendorId), Number(companyId));
    return res.json({ success: true, message: "Company removed from vendor successfully" });
  } catch (err) {
    console.error("❌ removeCompanyFromVendor error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Failed to remove company from vendor" });
  }
};
