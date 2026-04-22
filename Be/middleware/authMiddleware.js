require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decodedUser) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
      }
      return res.status(403).json({ error: "การเข้าถึงไม่ถูกต้อง" });
    }
    req.user = decodedUser;
    next();
  });
};

module.exports = authenticateToken;
