import jsonwebtoken from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: "Not Authenticated" });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.jwt_secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}