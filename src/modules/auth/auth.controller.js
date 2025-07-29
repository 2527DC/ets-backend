import authService, { createSuperAdmin } from "./auth.service.js";

export const login = async (req, res) => {
  try {
    console.log(" this is the login ");

    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.json(result);
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong" });
  }
};


export const createSuperAdminController = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    const result = await createSuperAdmin({ email, password, name });
    return res.status(201).json(result);
  } catch (err) {
    console.error('Create Super Admin Error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
  }
};