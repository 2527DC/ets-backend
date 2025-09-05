import authService, { createSuperAdmin, employeeLoginService, superAdminLoginService } from "./auth.service.js";

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



export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await superAdminLoginService({ email, password });
console.log(" the super admin login invoked ");

    return res.status(200).json({
      success: true,
      message: "Super Admin login successful",
      admin: {
        id: result.id,
        name: result.name,
        email: result.email,
        type: result.type
      },
      token: result.token
    });

  } catch (err) {
    console.error("SuperAdmin login error:", err.message);
    return res.status(401).json({
      success: false,
      message: err.message || "Login failed"
    });
  }
};


export const adminLoginContoller = async (req, res) => {
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