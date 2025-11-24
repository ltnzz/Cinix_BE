// middlewares/uploadValidator.js
import multer from "multer";

// Middleware general untuk upload file
const uploadValidator = ({
    fieldName = "file",
    allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
  maxSize = 5 * 1024 * 1024, // 5MB
} = {}) => {
    const storage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error(`File harus bertipe: ${allowedTypes.join(", ")}`));
        }
        cb(null, true);
    };

    const upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: maxSize },
    }).single(fieldName);

    return (req, res, next) => {
        upload(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });

        // Jika tidak ada file, lanjut tanpa error
        if (!req.file) req.file = null;

        next();
        });
    };
};

export default uploadValidator;
