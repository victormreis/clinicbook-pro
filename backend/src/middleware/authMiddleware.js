const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("../utils/tokenBlacklist");

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  if (isBlacklisted(token)) {
    return res.status(401).json({ message: "Token invalidated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};