import authService, { createSuperAdmin, employeeLoginService } from "./auth.service.js";

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


export const employeeLogin = async (req, res) => {
  try {
    console.log(" this is the employee login ");

    const { email, password } = req.body;
    const result = await employeeLoginService(email, password);
    return res.json(result);
  } catch (err) {
    console.error("Employee Login error:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong" });
  }
}


export const createSuperAdminController = async (req, res) => {
  const { email, password, name  ,phone} = req.body;

  if (!email || !password || !name|| !phone) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    const result = await createSuperAdmin({ email, password, name  ,phone});
    return res.status(201).json(result);
  } catch (err) {
    console.error('Create Super Admin Error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
  }
};