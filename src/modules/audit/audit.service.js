import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const getDepartmentsLogs = async () => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                tableName: 'departments'
            },
            orderBy: {
                changedAt: 'desc'
            }
        });

        // Process and structure the logs
        const structuredLogs = logs.map(log => {
            let actionDescription = '';
            let changes = [];

            switch (log.action) {
                case 'CREATE':
                    actionDescription = `Department created`;
                    if (log.newData) {
                        changes.push(`Created department: ${log.newData.name || 'Unknown'}`);
                    }
                    break;

                case 'UPDATE':
                    actionDescription = `Department updated`;
                    
                    // Only show actual changes
                    if (log.oldData && log.newData) {
                        const changesDetected = detectChanges(log.oldData, log.newData);
                        changes = changesDetected.length > 0 
                            ? changesDetected 
                            : ['No detectable changes (possible metadata update)'];
                    } else if (!log.oldData && log.newData) {
                        changes = ['Initial data populated'];
                    } else {
                        changes = ['Update with incomplete data'];
                    }
                    break;

                case 'DELETE':
                    actionDescription = `Department deleted`;
                    if (log.oldData) {
                        changes.push(`Deleted department: ${log.oldData.name || 'Unknown'}`);
                    }
                    break;

                default:
                    actionDescription = `Unknown action: ${log.action}`;
            }

            return {
                id: log.id,
                recordId: log.recordId,
                action: log.action,
                action_description: actionDescription,
                changes: changes,
                changedBy: log.changedBy || 'unknown',
                changedAt: log.changedAt,
                details: {
                    oldData: log.oldData,
                    newData: log.newData
                }
            };
        });

        return structuredLogs;

    } catch (error) {
        throw error;
    }
};

// Helper function to detect actual changes between old and new data
function detectChanges(oldData, newData) {
    const changes = [];
    
    if (!oldData || !newData) return changes;

    // Check each field for changes
    const fields = ['name', 'description', 'companyId'];
    
    fields.forEach(field => {
        if (oldData[field] !== newData[field]) {
            changes.push(`${field}: "${oldData[field]}" → "${newData[field]}"`);
        }
    });

    return changes;
}