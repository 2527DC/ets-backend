import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure folder exists
const storagePath = "uploads/documents";
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("request body", req.body);

    cb(null, storagePath);
  },
  filename: function (req, file, cb) {
    console.log("request body", req.body);

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14); 

    const ext = path.extname(file.originalname);
    const field = file.fieldname;

    const customName = `${field}_${timestamp}${ext}`;

    cb(null, customName);
  },
});



const upload = multer({ storage });


const uploadDocuments = upload.fields([
  { name: "indication_file" },
  { name: "license_no" },
  { name: "govId" },
  { name: "bgv" },
  { name: "police_verification" },
  { name: "medical_verification" },     // fixed
  { name: "training_verification" },    // fixed
  { name: "eye_test" },
  { name: "letter_of_undertaking" },    // fixed
]);


export default uploadDocuments;
