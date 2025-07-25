// middleware/upload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const storagePath = "uploads/documents";

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storagePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// Accept fields like documents[0], documents[1], ..., documents[n]
const uploadDocuments = upload.fields([
  { name: "documents[0]" },
  { name: "documents[1]" },
  { name: "documents[2]" },
  { name: "documents[3]" },
  { name: "documents[4]" },
  // Add more as needed
]);

export default uploadDocuments;
