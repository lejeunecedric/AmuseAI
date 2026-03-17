/**
 * API Module - Handles all API communication
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Check if the API is reachable
 * @returns {Promise<{connected: boolean, latency?: number, error?: string}>}
 */
export async function checkApiConnection() {
    try {
        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        const latency = Math.round(performance.now() - startTime);
        
        if (response.ok) {
            return { connected: true, latency };
        } else {
            return { connected: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return { connected: false, error: 'Timeout' };
        }
        return { connected: false, error: error.message };
    }
}

/**
 * Generic fetch wrapper for API calls
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const defaultOptions = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error(`API call failed: ${endpoint}`, error);
        throw error;
    }
}

/**
 * Get API information
 * @returns {Promise<object>}
 */
export async function getApiInfo() {
    return fetchApi('/api/info');
}

/**
 * Get all jobs
 * @returns {Promise<array>}
 */
export async function getJobs() {
    const response = await fetchApi('/api/jobs');
    return response.jobs || [];
}

/**
 * Get all models
 * @returns {Promise<array>}
 */
export async function getModels() {
    const response = await fetchApi('/api/models');
    return response.models || [];
}

/**
 * Get loaded models
 * @returns {Promise<array>}
 */
export async function getLoadedModels() {
    const response = await fetchApi('/api/models/loaded');
    return response.models || [];
}

// Export API_BASE_URL for use in other modules
export { API_BASE_URL };
