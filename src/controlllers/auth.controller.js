import prisma from "../../config/db.js";
import bcrypt from "bcrypt";
import { formatDate } from "../../utils/days.js";

export const regist = async (req, res) => {
    try {
        const { name, email, phone, password, confirm_password } = req.body;

        const checkEmail = await prisma.users.findUnique({ where: { email } });

        if(!checkEmail) {
            return res
                .status(400)
                .json({
                    auth: false,
                    message: "Email telah terdaftar."
                })
        }

        const checkPhone = await prisma.users.findUnique({ where: { phone }});

        if(!checkPhone) {
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
                password: bcrypt.hashSync(password, 10),
                phone,
                created_at: formatDate(users.created_at),
                updated_at: formatDate(users.updated_at)
            }
        });

        return res
            .status(201)
            .json({
                auth: true,
                message: `Akun atas nama ${name} berhasil dibuat.`,
                data: { data }
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

        const checkAccount = await prisma.users.findUnique({ where: { email } });

        if(!checkAccount) {
            return res
                .status(400)
                .json({
                    auth: false,
                    message: "Akun tidak terdaftar."
                })
        }

        const comparePassword = await bcrypt.compare(password, checkAccount.password);

        if(!comparePassword) {
            return res
                .status(400)
                .json({
                    auth: false,
                    message: "Kata sandi tidak valid."
                })
        }

        return res
            .status(200)
            .json({
                auth: true,
                message: `Halo ${checkAccount.name}! Selamat datang di Cinix!`,
                data: {
                    name: checkAccount.name,
                    email: checkAccount.email,
                    phone: checkAccount.phone
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

export const logout = async (req, res) => {
    try {
        return res
            .status(200)
            .json({
                auth: true,
                message: ` Logout Berhasil! Anda telah berhasil logout dari akun.`
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