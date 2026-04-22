const authAdmin = (req, res, next) => {
  // สมมติว่า req.user ถูกเซตมาจาก middleware authenticateToken ก่อนหน้านี้
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin only." });
  }
};

module.exports = authAdmin;
