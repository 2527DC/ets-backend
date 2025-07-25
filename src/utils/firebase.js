// firebase.js (ESM compatible)
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("./ets-1-ccb71-firebase-adminsdk-fbsvc-ca2f0803e8.json");
console.log(" this is the createrequired ", createRequire);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ets-1-ccb71-default-rtdb.firebaseio.com",
});

export const db = admin.database();
export default admin;
