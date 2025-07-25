import authService from "./auth.service.js";

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
