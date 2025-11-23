import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.email_host,
    port: process.env.email_port,
    secure: process.env.email_secure,
    auth: {
        user: process.env.email_user,
        pass: process.env.email_pass
    }
})

export const sendEmail = async ({to, subject, html, text}) => {
    try {
        await transporter.sendMail({
            from: `"Cinix" <${process.env.email_user}>`,
            to,
            subject,
            html,
            text
        })
        return true;
    } catch (err) {
        console.error("Gagal mengirim email.", err);
        return false
    }
}