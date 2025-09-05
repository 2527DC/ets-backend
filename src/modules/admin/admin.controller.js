import { createProductAdminService } from "./admin.service.js";


export const createProductAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const admin = await createProductAdminService({ name, email, password, role });

    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
