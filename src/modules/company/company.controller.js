// /src/modules/company/company.controller.js
import companyService from './company.service.js';

// Create new company
export const createCompany = async (req, res) => {
try {
  const {type}=req.user

   if (type!=="MASTER_ADMIN") {
    return res.status(401).json({sucess:false,
      message:" You Cant Company u dont have authority"
    });
   }
    const { company: companydata, adminUser,  permissions } = req.body;
console.log(" this is the Req atta payloud " ,req.user);


    const company = await companyService.createCompany( companydata, adminUser, permissions );

    return res.status(201).json(company);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
  }
};


// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies();
    return res.json(companies);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const company = await companyService.getCompanyById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.json(company);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const { name, email, phone, address, isActive } = req.body;
    const updatedCompany = await companyService.updateCompany(companyId, { name, email, phone, address, isActive });
    return res.json(updatedCompany);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    await companyService.deleteCompany(companyId);
    return res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
  }
};
