import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const SystemHealth = () => {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/system/health');
            if (!response.ok) throw new Error('Failed to fetch system health');
            const data = await response.json();
            setHealthData(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthData();
        // Refresh data every minute
        const interval = setInterval(fetchHealthData, 60000);
        return () => clearInterval(interval);
    }, []);

    const renderStatus = (status) => {
        const colors = {
            healthy: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100'}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    if (loading) return <div className="p-4">Loading system health data...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!healthData) return null;

    return (
        <div className="p-4 space-y-6">
            {/* System Overview */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="text-lg font-semibold">{healthData.systemMetrics.serverStatus}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Active Connections</div>
                        <div className="text-lg font-semibold">{healthData.systemMetrics.databaseConnections}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Average Response</div>
                        <div className="text-lg font-semibold">{healthData.systemMetrics.apiResponse}ms</div>
                    </div>
                </div>
            </div>

            {/* Services Status */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Services Status</h2>
                <div className="space-y-4">
                    {/* Only show Booking API and File Storage */}
                    {healthData.services
                        .filter(service => ['Booking API', 'File Storage'].includes(service.name))
                        .map(service => (
                            <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium">{service.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Last check: {formatDistanceToNow(new Date(service.lastCheck))} ago
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        {service.responseTime}
                                    </div>
                                    {renderStatus(service.status)}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">System Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Server Status</div>
                        <div className="font-medium mt-1">
                            {healthData.systemMetrics.serverStatus.toUpperCase()}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Memory Usage</div>
                        <div className="font-medium mt-1">
                            {healthData.systemMetrics.memoryUsage.used}MB / {healthData.systemMetrics.memoryUsage.total}MB
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={fetchHealthData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh Status
                </button>
                <button
                    onClick={() => fetch('/api/system/diagnostics', { method: 'POST' })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Run Diagnostics
                </button>
            </div>
        </div>
    );
};

export default SystemHealth;