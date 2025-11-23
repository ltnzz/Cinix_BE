export const linkEmailTemplate = (resetLink, name) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #333; margin-bottom: 10px;">Reset Password Cinix</h2>

    <p>Halo, <strong>${name}</strong></p>

    <p>Gunakan link di bawah untuk mereset password Anda:</p>

    <p style="margin: 20px 0;">
        <a 
            href="${resetLink}" 
            style="display: inline-block; padding: 12px 20px; background: #4CAF50; color: white; text-decoration: none; font-weight: bold; border-radius: 6px;"
        >
            Reset Password
        </a>
    </p>

    <p>Atau salin link berikut jika tombol tidak bekerja:</p>
    <p style="word-break: break-all; color: #4CAF50;">${resetLink}</p>

    <p>Link ini berlaku selama <strong>15 menit</strong>. Jangan bagikan link ini kepada siapapun.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

    <p style="font-size: 12px; color: #777;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
    <p style="font-size: 12px; color: #777;">Cinix &copy; 2025</p>
</div>
`;
