import multer from "multer";

const storage = multer.diskStorage({});

const imageUploader = multer({ storage: storage });

export default imageUploader;
