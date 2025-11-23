import cron from "node-cron";
import prisma from "../config/db.js";

export const cleanup = cron.schedule("*/15 * * * *", async () => {
    try {
        await prisma.reset_pass.deleteMany({
            where: {
                OR: [
                    { used: true },
                    { expired_at: { lt: new Date() } },
                    {
                        created_at: {
                            lt: new Date(Date.now() - 15 * 60 * 1000)
                        }
                    }
                ]
            }
        });

        console.log("🧹 Cleanup reset_pass executed");
    } catch (err) {
        console.error("Cron error:", err);
    }
});