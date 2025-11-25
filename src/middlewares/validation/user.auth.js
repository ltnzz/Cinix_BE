import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    const token = req.cookies?.token; 

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
