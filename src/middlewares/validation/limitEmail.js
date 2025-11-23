import prisma from "../../config/db.js";

const COOLDOWN_MS = 15 * 60 * 1000;

export const validateForgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const record = await prisma.reset_pass.findUnique({
            where: { email }
        });

        if (!record) return next();

        const now = Date.now();
        const cooldownEnd = record.created_at.getTime() + COOLDOWN_MS;
        const cooldownActive = cooldownEnd > now;

        if (record.attemps >= 3 && cooldownActive) {
            const remainingMinutes = Math.ceil((cooldownEnd - now) / 60000);

            return res.status(429).json({
                message: `Percobaan melebihi batas. Coba lagi setelah ${remainingMinutes} menit`
            });
        }

        return next();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};
