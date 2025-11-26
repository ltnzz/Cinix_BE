import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";

export const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.users.findUnique({
        where: { id_user: decoded.id },
        });

        if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user; // simpan ke req.user
        next();
    } catch (err) {
        console.error("verifyUser error:", err);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
