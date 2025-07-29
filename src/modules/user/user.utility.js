import ExcelJS from "exceljs"

 export const parseExcelFile = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const rows = [];

  worksheet.eachRow((row, index) => {
    if (index === 1) return; // skip header

    const [
      userId, name, email, phone, gender, companyId,
      roleId, address, lat, lng, bloodGroup,
      department, designation, emergencyContact
    ] = row.values.slice(1); // skip first null in row.values[0]

    // Basic validation
    if (!userId || !email || !roleId || !companyId) return;

    rows.push({
      userId,
      name,
      email,
      phone,
      gender,
      companyId: Number(companyId),
      roleId: Number(roleId),
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      additionalInfo: {
        bloodGroup,
        department,
        designation,
        emergencyContact
      }
    });
  });

  return rows;
};
