import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const truncateTable = async (req, res) => {
  try {
    const { tableName } = req.body; // table name passed in request body

    if (!tableName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Table name is required.',
      });
    }

    // Validate table name to prevent SQL injection
    const allowedTables = ['Department', 'Employee' ,"User","Company","Module"]; // whitelist
    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid table name.',
      });
    }

    // PostgreSQL TRUNCATE with CASCADE resets PK and deletes related rows
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);

    return res.status(200).json({
      status: 'success',
      message: `Table "${tableName}" truncated and primary key reset.`,
    });
  } catch (err) {
    console.error('Truncate error:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to truncate table',
    });
  }
};
