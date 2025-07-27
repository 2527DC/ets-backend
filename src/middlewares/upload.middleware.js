import fs from "fs"
import multer from "multer";
import path from "path";

// Ensure folder exists
const storagePath ="uploads/driverDocuments";

if(!fs.existsSync(storagePath)){
  fs.mkdirSync(storagePath, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, storagePath);
    } catch (error) {
      console.error("Error setting destination:", error);
      cb(new Error("Failed to set destination"), null);
    }
  },
  filename: function (req, file, cb) {
    try {
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
      const ext = path.extname(file.originalname);
      const field = file.fieldname;
      const customName = `${field}_${timestamp}${ext}`;
      cb(null, customName);
    } catch (error) {
      console.error("Error setting filename:", error);
      cb(new Error("Failed to set filename"), null);
    }
  },
});

const upload = multer({ storage });


const uploadDocuments = upload.fields([

  { name: "indication_file" },
{ name: "license_no" },
{ name: "govId" },
{ name: "bgv" },
{ name: "police_verification" },
{ name: "medical_verification" },     
{ name: "training_verification" },    
{ name: "eye_test" },
{ name: "letter_of_undertaking" },    

]);

export default uploadDocuments;