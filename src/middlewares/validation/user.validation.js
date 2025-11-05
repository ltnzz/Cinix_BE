import Joi from "joi";

const userSchema = Joi.object({
    email: Joi.string().required().messages({
        "string.empty": "Email tidak boleh kosong.",
    }),

    password: Joi.string().required().messages({
        "string.empty": "Password tidak boleh kosong.",
    })
})

export const userValidate = (req, res, next) => {
    const { error } = userSchema.validate(req.body, { abortEarly: false });

    if(error) {
        const details = error.details.map((err) => ({
            field: err.path[0],
            messages: err.message
        }))

        return res
            .status(400)
            .json({
                auth: false,
                message: "Validasi gagal. Periksa kembali input Anda.",
                errors: details 
            })
    }

    next();
}