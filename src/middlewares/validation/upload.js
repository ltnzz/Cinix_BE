import multer from "multer";

const uploadValidator = ({
    fieldName = "file",
    allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
  maxSize = 4 * 1024 * 1024,
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

        if (!req.file) req.file = null;

        console.log("req.file:", req.file);
console.log("req.body:", req.body);

        next();
        });
    };
};

export default uploadValidator;
