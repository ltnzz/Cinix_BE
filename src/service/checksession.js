export const checkSession = (req, res) => {
    if (req.session && req.session.user) {
        return res.status(200).json({
        auth: true,
        user: req.session.user,
        message: "Sesi masih aktif."
        });
    }

    return res.status(401).json({
        auth: false,
        message: "Belum login atau sesi sudah kadaluarsa."
    });
};
