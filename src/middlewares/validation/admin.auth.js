import jsonwebtoken from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
    
    const token = req.cookies.token;
    console.log("Admin Auth Middleware - Token:", token);
    if (!token) {
        return res.status(401).json({ message: "Not Authenticated as Admin" });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.jwt_secret);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Invalid token" });
    }
}