// /src/modules/company/company.controller.js
import companyService from './company.service.js';

export const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const company = await companyService.createCompany({ name, email, phone, address });
    return res.status(201).json(company);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
  }
};
