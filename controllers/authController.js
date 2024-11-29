const authService = require('../services/authService');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const {token, user} = await authService.login(email, password);
    console.log(token)
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      secure: true,
    });
    res.send(user);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!");
};



module.exports = { login, logout };