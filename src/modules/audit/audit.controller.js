import * as auditService from './audit.service.js';

export const departmentsLogs = async (req, res) => {
    try {
        const logs = await auditService.getDepartmentsLogs();
        
        if (logs && logs.length > 0) {
            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'No department logs found',
                data: []
            });
        }

    } catch (error) {
        console.error('Error fetching department logs:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};