// utils/prismaErrorParser.ts
export const parsePrismaNotFoundError = (error) => {
    if (error.code !== "P2025") {
      return error;
    }
  
    let cause = error.meta?.cause || "Record not found";
  
    // 1️⃣ Remove everything inside parentheses and the parentheses themselves
    cause = cause.replace(/\([^)]*\)/g, "");
  
    // 2️⃣ Remove any leftover stray closing parentheses
    cause = cause.replace(/\)/g, "");
  
    // 3️⃣ Remove any trailing Prisma details like "for a nested connect..."
    cause = cause.replace(/for a nested connect.*$/i, "");
  
    // 4️⃣ Normalize spaces and trim
    cause = cause.replace(/\s+/g, " ").trim();
  
    // 5️⃣ Ensure it ends properly with "was found."
    if (!cause.toLowerCase().endsWith("was found")) {
      cause += " was found.";
    }
  
    const err = new Error(cause);
    err.status = 400;
    return err;
  };
  