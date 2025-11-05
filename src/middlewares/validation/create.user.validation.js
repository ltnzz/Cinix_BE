import Joi from "joi";

const userSchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        "string.base": "Nama harus berupa teks.",
        "string.empty": "Nama tidak boleh kosong.",
        "string.min": "Nama harus terdiri dari minimal 3 karakter.",
        "string.max": "Nama maksimal 50 karakter.",
        "any.required": "Nama wajib diisi."        
    }),

    email: Joi.string().email({ tlds: { allow: true }}).pattern(/@gmail\.com$/).required().messages({
        "string.email": "Format email tidak valid.",
        "string.pattern.base": "Gunakan email dengan domain @gmail.com",
        "any.required": "Email wajib diisi."
    }),

    phone: Joi.string().pattern(/^[0-9]{10,13}$/).required().messages({
        "string.pattern.base": "Nomor telepon harus terdiri dari 10-13 digit angka.",
        "any.required": "Nomor telepon wajib diisi."
    }),

    password: Joi.string().min(8).max(24).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]*$/).required().messages({
        "string.pattern.base": "Password harus mengandung setidaknya 1 huruf besar, 1 huruf kecil, dan 1 angka. Hanya huruf, angka, dan simbol @$!%*?& yang diperbolehkan.",
        "string.empty": "Password tidak boleh kosong.",
        "string.min": "Password minimal 8 karakter",
        "string.max": "Password maximal 24 karakter",
        "any.required": "Password wajib diisi."
    }),

    confirm_password: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Password dan konfirmasi password harus sama",
        "any.required": "Konfirmasi password wajib diisi."
    })
})

export const registerValidate = (req, res, next)  => {
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