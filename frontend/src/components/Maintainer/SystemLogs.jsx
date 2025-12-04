import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        // TODO: Implement API call
        setLogs([
            { id: 1, level: 'info', message: 'User login successful', timestamp: '2025-11-30 10:30:15' },
            { id: 2, level: 'warning', message: 'High transaction volume detected', timestamp: '2025-11-30 11:15:22' },
            { id: 3, level: 'error', message: 'Failed to process loan request', timestamp: '2025-11-30 12:00:45' },
        ]);
    };

    return (
        <div className="dashboard-content">
            <h1>System Logs</h1>

            <Card>
                <div className="logs-container">
                    {logs.map(log => (
                        <div key={log.id} className={`log-entry log-${log.level}`}>
                            <span className="log-timestamp">{log.timestamp}</span>
                            <span className={`log-level ${log.level}`}>{log.level.toUpperCase()}</span>
                            <span className="log-message">{log.message}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default SystemLogs;
