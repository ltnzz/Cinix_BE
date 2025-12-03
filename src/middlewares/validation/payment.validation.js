import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";

export const authentication = async (req, res, next) => {
    try {
        const token = req.cookies.token; 
        console.log(token)
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) return res.status(401).json({ message: "Unauthorized" });

        const user = await prisma.users.findUnique({
            where: { id_user: decoded.id },
        });

        if (!user) return res.status(401).json({ message: "Unauthorized" });

        req.user = {
            id_user: decoded.id || decoded.id_user, 
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(401).json({ message: "Unauthorized" });
    }
};
