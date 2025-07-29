import { db } from "../../utils/firebase.js";

export const insertDriverToFirebase = async (driverid) => {
    if (!driverid || typeof driverid !== "string") {
      throw new Error("insertDriverToFirebase expects a string driverId");
    }
  
    const driverRef = db.ref(`ets-node/drivers/${driverid}`);
  
    const firebaseData = {
      location: {
        latitude: 0,
        longitude: 0,
      },
    };
  
    await driverRef.set(firebaseData);

  };
  
