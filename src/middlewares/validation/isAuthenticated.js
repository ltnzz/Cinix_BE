export const isAuthenticated = (req, res, next) => {
    if(!req.session.user) {
        return res
            .status(401)
            .json({
                auth: false,
                message: "Silahkan login terlebih dahulu."
            })
    }
    next();
}