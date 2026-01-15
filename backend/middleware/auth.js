const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const shopAccess = (req, res, next) => {
  if (req.user.type !== "shop" && req.user.type !== "staff") {
    return res.status(403).json({ message: "Shop access only" });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.type === "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

module.exports = { auth, shopAccess, adminOnly };
