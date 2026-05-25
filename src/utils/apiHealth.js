// Frontend API health monitoring
import { API_BASE_URL } from '../config/api.js';
export class APIHealthMonitor {
    static isBackendHealthy = false;
    static checkInterval = null;

    static async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/system/health`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Health check failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.isBackendHealthy = data.status === 'ok' && data.database.status === 'connected';
            
            return this.isBackendHealthy;
        } catch (error) {
            console.error('Backend health check failed:', error);
            this.isBackendHealthy = false;
            return false;
        }
    }

    static startMonitoring(interval = 30000) { // Check every 30 seconds
        if (this.checkInterval) return; // Don't start if already running
        
        this.checkInterval = setInterval(async () => {
            const isHealthy = await this.checkHealth();
            if (!isHealthy) {
                console.warn('Backend service is unhealthy!');
                // You can implement UI notifications here
            }
        }, interval);

        // Initial check
        this.checkHealth();
    }

    static stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

// API Error handling utilities
export class APIErrorHandler {
    static async handleResponse(response, customErrorMessage = '') {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(
                errorData.message || 
                customErrorMessage || 
                `API Error: ${response.status} ${response.statusText}`
            );
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        return response;
    }

    static async safeFetch(url, options = {}) {
        try {
            if (!APIHealthMonitor.isBackendHealthy) {
                throw new Error('Backend service is currently unavailable');
            }

            const response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });

            await this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
}