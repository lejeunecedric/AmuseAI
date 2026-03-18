/**
 * API Module - Handles all API communication
 */

const API_BASE_URL = 'http://localhost:5000';

// API Call listeners for inspector
const apiCallListeners = [];

/**
 * Add a listener for API calls
 * @param {function} listener - Function to call with API call data
 */
export function addApiCallListener(listener) {
    apiCallListeners.push(listener);
}

/**
 * Remove an API call listener
 * @param {function} listener - Listener to remove
 */
export function removeApiCallListener(listener) {
    const index = apiCallListeners.indexOf(listener);
    if (index > -1) {
        apiCallListeners.splice(index, 1);
    }
}

/**
 * Notify all listeners of an API call
 * @param {object} callData - The API call data
 */
function notifyListeners(callData) {
    apiCallListeners.forEach(listener => {
        try {
            listener(callData);
        } catch (e) {
            console.error('API call listener error:', e);
        }
    });
}

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
    const startTime = performance.now();
    const timestamp = Date.now();
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
    
    // Capture request details
    const requestCapture = {
        method: mergedOptions.method || 'GET',
        url: url,
        headers: { ...mergedOptions.headers },
        body: mergedOptions.body || null,
        bodySize: mergedOptions.body ? mergedOptions.body.length : 0
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        const endTime = performance.now();
        
        // Capture response metadata
        const responseCapture = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        };
        
        // Clone and read body for capture without consuming original
        const responseClone = response.clone();
        let bodyText = '';
        try {
            bodyText = await responseClone.text();
        } catch (e) {
            bodyText = '[Unable to read body]';
        }
        responseCapture.body = bodyText;
        responseCapture.bodySize = bodyText.length;
        
        // Notify listeners
        notifyListeners({
            id: `call-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: timestamp,
            request: requestCapture,
            response: responseCapture,
            timing: {
                startTime: startTime,
                endTime: endTime,
                duration: parseFloat((endTime - startTime).toFixed(1))
            },
            error: null
        });
        
        // Return result as before
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
        
    } catch (error) {
        const endTime = performance.now();
        
        // Notify listeners of error
        notifyListeners({
            id: `call-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: timestamp,
            request: requestCapture,
            response: null,
            timing: {
                startTime: startTime,
                endTime: endTime,
                duration: parseFloat((endTime - startTime).toFixed(1))
            },
            error: {
                message: error.message,
                name: error.name
            }
        });
        
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

/**
 * Load a model into memory
 * @param {string} id - Model ID
 * @returns {Promise<object>}
 */
export async function loadModel(id) {
    return fetchApi(`/api/models/${id}/load`, {
        method: 'POST'
    });
}

/**
 * Unload a model from memory
 * @param {string} id - Model ID
 * @returns {Promise<object>}
 */
export async function unloadModel(id) {
    return fetchApi(`/api/models/${id}/unload`, {
        method: 'POST'
    });
}

// Export API_BASE_URL for use in other modules
export { API_BASE_URL };
