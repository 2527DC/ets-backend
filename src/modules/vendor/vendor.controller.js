// /src/modules/vendor/vendor.controller.js
import * as vendorService from './vendor.service.js';

export const createVendor = async (req, res) => {
    try {
        const vendorData = req.body;
        const vendor = await vendorService.createVendor(vendorData);
        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllVendors = async (req, res) => {
    try {
        const vendors = await vendorService.getAllVendors();
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await vendorService.getVendorById(id);
        res.status(200).json(vendor);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorData = req.body;
        const updatedVendor = await vendorService.updateVendor(id, vendorData);
        res.status(200).json(updatedVendor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await vendorService.deleteVendor(id);
         if(result.success){
            res.status(result.code).json(result);
         }
       else{
        res.status(result.code).json(result);
       }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
