import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const getDepartmentsLogs = async () => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                table_name: 'department'
            },
            orderBy: {
                changed_at: 'desc'
            }
        });

        // Process and structure the logs
        const structuredLogs = logs.map(log => {
            let actionDescription = '';
            let changes = [];

            switch (log.action) {
                case 'CREATE':
                    actionDescription = `Department created`;
                    if (log.new_data) {
                        changes.push(`Created department: ${log.new_data.name || 'Unknown'}`);
                    }
                    break;

                case 'UPDATE':
                    actionDescription = `Department updated`;
                    
                    // Only show actual changes
                    if (log.old_data && log.new_data) {
                        const changesDetected = detectChanges(log.old_data, log.new_data);
                        changes = changesDetected.length > 0 
                            ? changesDetected 
                            : ['No detectable changes (possible metadata update)'];
                    } else if (!log.old_data && log.new_data) {
                        changes = ['Initial data populated'];
                    } else {
                        changes = ['Update with incomplete data'];
                    }
                    break;

                case 'DELETE':
                    actionDescription = `Department deleted`;
                    if (log.old_data) {
                        changes.push(`Deleted department: ${log.old_data.name || 'Unknown'}`);
                    }
                    break;

                default:
                    actionDescription = `Unknown action: ${log.action}`;
            }

            return {
                id: log.id,
                record_id: log.record_id,
                action: log.action,
                action_description: actionDescription,
                changes: changes,
                changed_by: log.changed_by || 'unknown',
                changed_at: log.changed_at,
                details: {
                    old_data: log.old_data,
                    new_data: log.new_data
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