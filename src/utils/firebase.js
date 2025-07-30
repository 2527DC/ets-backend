import admin from "firebase-admin";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);

const firebasePath = process.env.FIREBASE_CREDENTIAL_PATH;

if (!firebasePath) {
  throw new Error("Missing FIREBASE_CREDENTIAL_PATH env variable");
}

const serviceAccount = require(firebasePath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ets-1-ccb71-default-rtdb.firebaseio.com",
});

export const db = admin.database();
export default admin;
