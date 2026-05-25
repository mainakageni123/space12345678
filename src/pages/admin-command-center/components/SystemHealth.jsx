import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_BASE_URL } from '../../../config/api';

const SystemHealth = () => {
  const [systemMetrics, setSystemMetrics] = useState({});

  const [services, setServices] = useState([]);

  const [alerts, setAlerts] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      case 'offline': return 'Circle';
      default: return 'Circle';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return 'XCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/health`);
      if (!res.ok) throw new Error('Failed to load system health');
      const data = await res.json();
      setSystemMetrics(data?.systemMetrics || {});
      setServices(data?.services || []);
      setAlerts(data?.alerts || []);
    } catch (e) {
      console.error('Health load error', e);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Refresh every 5 seconds for real-time data
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = (alertId) => {
    setAlerts(prev => 
      prev?.map(alert => 
        alert?.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const activeAlerts = alerts?.filter(alert => !alert?.resolved);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* System Overview */}
      <div className="xl:col-span-2 bg-white rounded-lg premium-shadow border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon name="Server" size={20} className={`${systemMetrics?.serverStatus === 'online' ? 'text-green-500' : 'text-red-500'} mr-2`} />
                <span className="text-sm font-medium text-gray-600">Server</span>
              </div>
              <p className={`text-lg font-bold ${systemMetrics?.serverStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {systemMetrics?.serverStatus ? systemMetrics.serverStatus.charAt(0).toUpperCase() + systemMetrics.serverStatus.slice(1) : 'Loading...'}
              </p>
              {systemMetrics?.uptime && (
                <p className="text-xs text-gray-500">Uptime: {systemMetrics.uptime}</p>
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon name="Zap" size={20} className="text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">API Response</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {systemMetrics?.apiResponse ? `${systemMetrics.apiResponse}ms` : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500">Current response time</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon name="Database" size={20} className="text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">DB Connections</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {systemMetrics?.databaseConnections !== undefined ? systemMetrics.databaseConnections : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500">Active connections</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon name="Users" size={20} className="text-orange-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Active Users</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {systemMetrics?.activeUsers !== undefined ? systemMetrics.activeUsers : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500">Currently online</p>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Service Status</h4>
          <div className="space-y-3">
            {services?.length > 0 ? (
              services.map((service) => (
                <div key={service?.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service?.status)}`}>
                      <Icon name={getStatusIcon(service?.status)} size={12} className="mr-1" />
                      {service?.status?.charAt(0)?.toUpperCase() + service?.status?.slice(1)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{service?.name}</p>
                      <p className="text-sm text-gray-500">Last check: {service?.lastCheck || 'Just now'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{service?.responseTime || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Uptime: {service?.uptime || 'N/A'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Icon name="Loader" size={24} className="text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500">Loading service status...</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" iconName="RefreshCw" onClick={fetchHealth}>
                Refresh Status
              </Button>
              <Button variant="outline" size="sm" iconName="Download">
                Export Logs
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Auto-refresh: 5s
            </div>
          </div>
        </div>
      </div>
      {/* Alerts & Maintenance */}
      <div className="space-y-6">
        {/* Active Alerts */}
        <div className="bg-white rounded-lg premium-shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              {activeAlerts?.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {activeAlerts?.length}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {activeAlerts?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No active alerts</p>
                <p className="text-sm text-gray-400">All systems running smoothly</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts?.map((alert) => (
                  <div key={alert?.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Icon name={getAlertIcon(alert?.type)} size={16} className={getAlertColor(alert?.type)} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{alert?.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert?.timestamp}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        iconName="Check"
                        onClick={() => resolveAlert(alert?.id)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time System Info */}
        <div className="bg-white rounded-lg premium-shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-600 font-medium">Real-time Data</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {systemMetrics?.lastBackup && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Last Backup</p>
                    <p className="text-sm text-gray-500">{systemMetrics.lastBackup}</p>
                  </div>
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                </div>
              )}

              {systemMetrics?.memoryUsage && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Memory Usage</p>
                    <p className="text-sm text-gray-500">
                      {systemMetrics.memoryUsage.used}MB / {systemMetrics.memoryUsage.total}MB 
                      ({Math.round((systemMetrics.memoryUsage.used / systemMetrics.memoryUsage.total) * 100)}%)
                    </p>
                  </div>
                  <Icon name="HardDrive" size={20} className="text-blue-500" />
                </div>
              )}

              {systemMetrics?.cpuUsage && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">CPU Usage</p>
                    <p className="text-sm text-gray-500">{systemMetrics.cpuUsage}%</p>
                  </div>
                  <Icon name="Cpu" size={20} className="text-green-500" />
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button 
                variant="default" 
                size="sm" 
                iconName="RefreshCw" 
                fullWidth
                onClick={fetchHealth}
              >
                Refresh Real-time Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;