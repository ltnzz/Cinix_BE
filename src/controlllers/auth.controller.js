import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import { formatDate } from "../utils/days.js";
import { sendEmail } from "../service/send.email.js";
import { linkEmailTemplate } from "../utils/templateEmail.js";
import path from "path";

export const regist = async (req, res) => {
    try {
        const { name, email, phone, password, confirm_password } = req.body;

        if(!"@gmail") {
            return res
                .status(400)
                .json({
                    auth: false,
                    message: "Email harus berakhiran @gmail.com"
                })
        }

        const checkEmail = await prisma.users.findUnique({ where: { email } });

        if(checkEmail) {
            return res
                .status(400)
                .json({
                    auth: false,
                    message: "Email telah terdaftar."
                })
        }

        const checkPhone = await prisma.users.findUnique({ where: { phone }});

        if(checkPhone) {
            return res
                .status(400)
                .json({
                    auth: false,
                    message: "No telepon telah terdaftar."
                })
        }
        
        const data = await prisma.users.create({
            data: {
                name,
                email,
                password: bcrypt.hashSync(password, 8),
                phone,
            }
        });

        const response = {
            ...data,
            created_at: formatDate(data.created_at),
        }

        return res
            .status(201)
            .json({
                auth: true,
                message: `Akun atas nama ${name} berhasil dibuat.`,
                data: { response },
            })
    } catch (err) {
        console.error(err)
        return res
            .status(500)
            .json({
                auth: false,
                message: "Gagal memproses permintaan. Silahkan coba lagi.",
            })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if(!email.endsWith("@gmail.com")) {
            return res
            .status(400)
            .json({
                auth: false,
                message: "Email harus berakhiran @gmail.com"
            })
        }
        
        const user = await prisma.users.findUnique({ where: { email } });

        if(!user) {
            return res
            .status(400)
            .json({
                auth: false,
                message: "Akun tidak terdaftar."
            })
        }
        
        const comparePassword = await bcrypt.compare(password, user.password);

        if(!comparePassword) {
            return res
                .status(400)
                .json({
                    auth: false,
                    message: "Kata sandi tidak valid."
                })
        }

        const token = jsonwebtoken.sign(
            {
                id: user.id_user,
                name: user.name,
                email: user.email,
                role: "user"
            },
            process.env.jwt_secret,
            { expiresIn: "1h"
            }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        })

        return res
            .status(200)
            .json({
                auth: true,
                message: `Halo ${user.name}! Selamat datang di Cinix!`,
                token,
                data: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            })
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({
                auth: false,
                message: "Gagal memproses permintaan. Silahkan coba lagi."
            })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.users.findUnique({ where: { email }});
        if (!user) {
            return res.status(400).json({
                auth: false,
                message: "Email tidak terdaftar."
            });
        }

        const record = await prisma.reset_pass.findUnique({ where: { email }});

        const now = new Date();

        if (record) {
            if (record.attemps >= 3) {
                const remaining = record.created_at.getTime() + 300000 - now.getTime();
                const minutes = Math.ceil(remaining / 60000);

                if (remaining > 0) {
                    return res.status(429).json({
                        message: `Percobaan melebihi batas. Coba lagi setelah ${minutes} menit`
                    });
                }
            }
        }

        const token = crypto.randomBytes(32).toString("hex");

        const reset = await prisma.reset_pass.upsert({
            where: { email },
            update: {
                token,
                expired_at: new Date(Date.now() + 300_000),
                attemps: { increment: 1 },
                created_at: new Date(),
            },
            create: {
                email,
                token,
                expired_at: new Date(Date.now() + 300_000),
                attemps: 1,
            },
        });

        const resetLink = `${process.env.fe_origin}/auth/reset-password/${reset.token}`;

        const html = linkEmailTemplate(resetLink, user.name);

        await sendEmail({
            to: email,
            subject: "Reset Password Cinix",
            html
        });

        return res.status(200).json({
            auth: true,
            message: `Permintaan reset password telah dikirim ke email ${email}`
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            auth: false,
            message: "Gagal memproses permintaan. Silahkan coba lagi."
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmNewPassword } = req.body;

        const record = await prisma.reset_pass.findUnique({ where: { token } });

        if (!record) {
            return res.status(400).json({ message: "Token tidak ditemukan." });
        }

        if (record.used) {
            return res.status(400).json({ message: "Token sudah digunakan." });
        }

        if (record.expired_at.getTime() < Date.now()) {
            return res.status(400).json({ message: "Token kadaluwarsa." });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Konfirmasi password tidak sesuai." });
        }

        const hasehedPassword = await bcrypt.hash(newPassword, 8);

        await prisma.users.update({
            where: { email: record.email },
            data: { password: hasehedPassword },
        });

        await prisma.reset_pass.update({
            where: { token },
            data: { used: true },
        });

        return res.status(200).json({ message: "Password berhasil diperbarui." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

export const logout = (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: none,
        path: "/",
    };

    try {
        res.clearCookie("connect.sid", cookieOptions);
        res.clearCookie("token", cookieOptions);

        return res.status(200).json({
            auth: false,
            message: "Logout berhasil. Sampai jumpa lagi!",
        });

    } catch (err) {
        console.error("Logout Error:", err);
        return res.status(500).json({
            auth: false,
            message: "Gagal memproses logout.",
        });
    }
};