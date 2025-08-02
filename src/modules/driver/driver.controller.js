import * as driverService from "./driver.service.js";

export const createDriver = async (req, res) => {
  try {
const {driver_data}= req.body
const {companyId} = req.user; // Assuming companyId is set in the request object
console.log(" this is the driver data " ,driver_data);


    const uploadedFiles = req.files;
    console.log("Uploaded Files:", uploadedFiles);

    const fileData = Object.keys(uploadedFiles).reduce((acc, key) => {
      console.log(" this is the  first and last key", acc, key);
       acc[key] = uploadedFiles[key][0]?.path || null;
      return acc;
    }, {});
  
     const driver = await  driverService.createDriver(driver_data, fileData ,companyId);

    res.status(200).json({ success:true, message: "Driver created", files: fileData });
  } catch (error) {
    console.error("Error creating driver:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getAllDrivers = async (req, res) => {
  try {
    const driver = await driverService.getAllDrivers();
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
    res.json(driver);
  } catch (err) {
    console.error("Get drivers error:", err);
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await driverService.getDriverById(parseInt(req.params.id));
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (err) {
    console.error("Get driver by ID error:", err);
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const updated = await driverService.updateDriver(
      parseInt(req.params.id),
      req.body
    );
    res.json(updated);
  } catch (err) {
    console.error("Update driver error:", err);
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
};


export const deleteDriver = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await driverService.deleteDriver(id);

    if (!result.success) {
      return res.status(result.code).json({ message: result.message || "Driver not found" });
    }
    return res.json({ message: "Driver deleted successfully" });

  } catch (err) {
    console.error("Delete driver error:", err);
    return res.status(500).json({ message: err.message || "Something went wrong" });
  }
};
