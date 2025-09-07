// /src/modules/vendor/vendor.controller.js
import * as vendorService from './vendor.service.js';


// ---------------- CREATE VENDOR ----------------

export const createVendor = async (req, res) => {
  try {
    const { companyId } = req.user; // Company context
    const { vendor: vendorData, adminUser, permissions = [] } = req.body;

    // Call service
    const newVendor = await vendorService.createVendor(vendorData, adminUser, permissions, companyId);

    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: newVendor,
    });
  } catch (err) {
    console.error('Create vendor error:', err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Failed to create vendor',
    });
  }
};






// ---------------- GET ALL VENDORS ----------------
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await vendorService.getAllVendors(); // no companyId passed

    return res.status(200).json({
      success: true,
      message: vendors.length 
        ? 'Vendors retrieved successfully' 
        : 'No vendors found.',
      data: vendors,
    });
  } catch (err) {
    console.error('Get all vendors error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to get vendors',
    });
  }
};


// ---------------- GET VENDOR BY ID ----------------
export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await vendorService.getVendorById(id);

    return res.status(200).json({
      success: true,
      message: 'Vendor retrieved successfully',
      data: vendor,
    });
  } catch (err) {
    console.error('Get vendor by ID error:', err);
    return res.status(err.status || 404).json({
      success: false,
      message: err.message || 'Vendor not found',
    });
  }
};

// ---------------- UPDATE VENDOR ----------------
export const updateVendor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedVendor = await vendorService.updateVendor(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (err) {
    console.error("Update vendor error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to update vendor",
    });
  }
};


// ---------------- DELETE VENDOR ----------------
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await vendorService.deleteVendor(id);

    return res.status(result.code).json({
      success: result.success,
      message: result.message,
    });
  } catch (err) {
    console.error('Delete vendor error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete vendor',
    });
  }
};

