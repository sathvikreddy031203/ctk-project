import jwt from 'jsonwebtoken'; 

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.isAdmin !== true)  {
      return res.status(405).json({ message: "Access denied. Admins only!" });
  }
  next();
};

