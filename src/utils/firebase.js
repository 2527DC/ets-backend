import admin from "firebase-admin";
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const require = createRequire(import.meta.url);

// const firebasePath = process.env.FIREBASE_CREDENTIAL_PATH;

const firebasePath = path.resolve(process.cwd(), "firebase-adminsdk.json");

if (!fs.existsSync(firebasePath)) {
  console.error("Firebase credentials not found at:", firebasePath);
  throw new Error("Missing firebase-adminsdk.json in root directory");
} else {
  console.log("Firebase credentials found:", firebasePath);
}


const serviceAccount = require(firebasePath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ets-1-ccb71-default-rtdb.firebaseio.com",
});

export const db = admin.database();
export default admin;
