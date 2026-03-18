/**
 * API Inspector Module - Captures and displays API calls for debugging
 */

import { addApiCallListener } from './api.js';

// State management
let apiHistory = [];
let isInspectorActive = false;
let isPaused = false;
const MAX_HISTORY = 100;
let expandedCallId = null;

// Configuration
const MAX_BODY_DISPLAY_SIZE = 10240; // 10KB

/**
 * Initialize the API Inspector
 */
export function initInspector() {
    console.log('🔍 Initializing API Inspector...');
    
    // Register as API call listener
    addApiCallListener(handleApiCall);
    
    // Setup event listeners
    setupEventListeners();
    
    // Check initial section state
    const inspectorSection = document.getElementById('section-inspector');
    if (inspectorSection && inspectorSection.classList.contains('active')) {
        startCapturing();
    }
    
    console.log('✅ API Inspector initialized');
}

/**
 * Handle incoming API call from listener
 * @param {object} callData - The captured API call data
 */
function handleApiCall(callData) {
    // Only record if inspector is active (section visible)
    if (!isInspectorActive || isPaused) {
        return;
    }
    
    recordApiCall(callData);
}

/**
 * Record an API call to history
 * @param {object} callData - The API call data to record
 */
export function recordApiCall(callData) {
    // Add to beginning (newest first)
    apiHistory.unshift(callData);
    
    // Enforce max history limit
    if (apiHistory.length > MAX_HISTORY) {
        apiHistory = apiHistory.slice(0, MAX_HISTORY);
    }
    
    // Update UI
    renderInspector();
    updateCallCount();
}

/**
 * Get current history
 * @returns {array} Array of API call records
 */
export function getHistory() {
    return [...apiHistory];
}

/**
 * Clear all history
 */
export function clearHistory() {
    apiHistory = [];
    expandedCallId = null;
    renderInspector();
    updateCallCount();
    console.log('🗑️ Inspector history cleared');
}

/**
 * Start capturing API calls
 */
export function startCapturing() {
    isInspectorActive = true;
    renderInspector();
    updateStatusIndicator();
    console.log('🔍 Inspector capture started');
}

/**
 * Stop capturing API calls
 */
export function stopCapturing() {
    isInspectorActive = false;
    updateStatusIndicator();
    console.log('🔍 Inspector capture stopped');
}

/**
 * Generate curl command from request data
 * @param {object} request - The request object
 * @param {string} format - 'compact' or 'pretty'
 * @returns {string} Curl command
 */
export function generateCurlCommand(request, format = 'compact') {
    const { method = 'GET', url, headers = {}, body } = request;
    
    const parts = ['curl'];
    
    // Method
    if (method !== 'GET') {
        parts.push(`-X ${method}`);
    }
    
    // URL
    parts.push(`'${url}'`);
    
    // Headers
    Object.entries(headers).forEach(([key, value]) => {
        const escapedValue = String(value).replace(/'/g, "'\"'\"'");
        parts.push(`-H '${key}: ${escapedValue}'`);
    });
    
    // Body
    if (body) {
        const escapedBody = String(body).replace(/'/g, "'\"'\"'");
        parts.push(`-d '${escapedBody}'`);
    }
    
    if (format === 'pretty') {
        // Multi-line format with continuation
        return parts.join(' \\\n  ');
    }
    
    // Compact format
    return parts.join(' ');
}

/**
 * Truncate body for display
 * @param {string} body - Body content
 * @param {number} maxSize - Maximum size before truncation
 * @returns {string} Truncated body
 */
function truncateBody(body, maxSize = MAX_BODY_DISPLAY_SIZE) {
    if (!body) return '';
    
    const str = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    
    if (str.length <= maxSize) {
        return str;
    }
    
    // Check if it looks like base64 image data
    if (str.length > 1000 && /^[A-Za-z0-9+/=\s]+$/.test(str.substring(0, 100))) {
        return `[Base64 image data: ${formatBytes(str.length)}]`;
    }
    
    return str.substring(0, 100) + `... [truncated: ${formatBytes(str.length)} total]`;
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format duration for display
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
    return ms.toFixed(1);
}

/**
 * Get status code range for CSS class
 * @param {number} status - HTTP status code
 * @returns {string} Status range class
 */
function getStatusRange(status) {
    if (!status) return 'ERR';
    if (status >= 200 && status < 300) return '2xx';
    if (status >= 300 && status < 400) return '3xx';
    if (status >= 400 && status < 500) return '4xx';
    if (status >= 500) return '5xx';
    return 'ERR';
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Clear button
    const clearBtn = document.getElementById('inspector-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            console.log('🗑️ Clearing inspector history');
            clearHistory();
        });
    }
    
    // Pause/Resume button
    const pauseBtn = document.getElementById('inspector-pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseBtn.innerHTML = isPaused ? '<span>▶️</span> Resume' : '<span>⏸️</span> Pause';
            updateStatusIndicator();
            console.log(isPaused ? '⏸️ Capture paused' : '▶️ Capture resumed');
        });
    }
}

/**
 * Update the status indicator
 */
function updateStatusIndicator() {
    const statusEl = document.getElementById('inspector-status');
    if (statusEl) {
        if (!isInspectorActive) {
            statusEl.textContent = 'Inactive';
            statusEl.classList.add('paused');
        } else if (isPaused) {
            statusEl.textContent = 'Paused';
            statusEl.classList.add('paused');
        } else {
            statusEl.textContent = 'Capturing';
            statusEl.classList.remove('paused');
        }
    }
}

/**
 * Update the call count display
 */
function updateCallCount() {
    const countEl = document.getElementById('inspector-call-count');
    if (countEl) {
        countEl.textContent = apiHistory.length;
    }
}

/**
 * Render the inspector UI
 */
function renderInspector() {
    const historyList = document.getElementById('inspector-history-list');
    const emptyState = document.getElementById('inspector-empty-state');
    const historyContainer = document.getElementById('inspector-history-container');
    
    if (!historyList) return;
    
    // Show/hide empty state
    if (apiHistory.length === 0) {
        historyList.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (historyContainer) historyContainer.classList.add('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    if (historyContainer) historyContainer.classList.remove('hidden');
    
    // Render history
    historyList.innerHTML = apiHistory.map(call => renderCallEntry(call)).join('');
    
    // Attach event listeners
    historyList.querySelectorAll('.inspector-call').forEach(entry => {
        entry.addEventListener('click', (e) => {
            // Don't toggle if clicking buttons or selects
            if (e.target.closest('button') || e.target.closest('select')) return;
            const callId = entry.dataset.callId;
            toggleCallDetails(callId);
        });
    });
    
    // Copy curl button listeners
    historyList.querySelectorAll('.btn-copy-curl').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const callId = btn.dataset.callId;
            copyCurlToClipboard(callId);
        });
    });
    
    // Curl format change listeners
    historyList.querySelectorAll('.curl-format').forEach(select => {
        select.addEventListener('change', (e) => {
            e.stopPropagation();
            const callId = select.dataset.callId;
            const format = select.value;
            updateCurlDisplay(callId, format);
        });
    });
    
    // JSON toggle listeners
    historyList.querySelectorAll('.json-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = toggle.dataset.target;
            const content = document.getElementById(targetId);
            if (content) {
                content.classList.toggle('hidden');
                const icon = toggle.querySelector('.toggle-icon');
                if (icon) {
                    icon.textContent = content.classList.contains('hidden') ? '▶' : '▼';
                }
            }
        });
    });
}

/**
 * Render a single call entry
 * @param {object} call - The API call data
 * @returns {string} HTML string
 */
function renderCallEntry(call) {
    const isExpanded = expandedCallId === call.id;
    const method = call.request.method || 'GET';
    const status = call.response ? call.response.status : 'ERR';
    const statusRange = getStatusRange(status);
    const duration = formatDuration(call.timing.duration);
    
    // Extract endpoint path from full URL
    const url = new URL(call.request.url);
    const endpoint = url.pathname + url.search;
    
    return `
        <div class="inspector-call ${isExpanded ? 'expanded' : 'collapsed'}" data-call-id="${call.id}">
            <div class="call-summary">
                <span class="call-method method-${method}">${method}</span>
                <span class="call-endpoint" title="${call.request.url}">${endpoint}</span>
                <span class="call-status status-${statusRange}">${status}</span>
                <span class="call-duration">${duration} ms</span>
                <span class="call-toggle">${isExpanded ? '▼' : '▶'}</span>
            </div>
            ${isExpanded ? renderCallDetails(call) : ''}
        </div>
    `;
}

/**
 * Render expanded call details
 * @param {object} call - The API call data
 * @returns {string} HTML string
 */
function renderCallDetails(call) {
    const timestamp = new Date(call.timestamp).toLocaleString();
    const duration = formatDuration(call.timing.duration);
    
    // Request section
    const requestBody = truncateBody(call.request.body);
    const requestHeaders = JSON.stringify(call.request.headers, null, 2);
    
    // Response or Error section
    let responseSection = '';
    if (call.error) {
        responseSection = `
            <div class="details-section">
                <h5 class="json-toggle" data-target="res-${call.id}">
                    <span class="toggle-icon">▼</span> Error
                </h5>
                <div class="details-content" id="res-${call.id}">
                    <pre class="error-display"><code>${call.error.message}</code></pre>
                </div>
            </div>
        `;
    } else if (call.response) {
        const responseBody = truncateBody(call.response.body);
        const responseHeaders = JSON.stringify(call.response.headers, null, 2);
        responseSection = `
            <div class="details-section">
                <h5 class="json-toggle" data-target="res-${call.id}">
                    <span class="toggle-icon">▶</span> Response
                </h5>
                <div class="details-content hidden" id="res-${call.id}">
                    <p><strong>${call.response.status}</strong> ${call.response.statusText || ''}</p>
                    <h6>Headers</h6>
                    <pre class="headers-display"><code>${escapeHtml(responseHeaders)}</code></pre>
                    <h6>Body (${formatBytes(call.response.bodySize || 0)})</h6>
                    <pre class="json-display"><code>${escapeHtml(responseBody)}</code></pre>
                </div>
            </div>
        `;
    }
    
    // Curl command
    const curlCompact = generateCurlCommand(call.request, 'compact');
    
    return `
        <div class="call-details">
            <!-- Timing Section -->
            <div class="details-section">
                <h5 class="json-toggle" data-target="time-${call.id}">
                    <span class="toggle-icon">▼</span> Timing
                </h5>
                <div class="details-content" id="time-${call.id}">
                    <div class="details-grid">
                        <span>Started:</span> <code>${timestamp}</code>
                        <span>Duration:</span> <code>${duration} ms</code>
                    </div>
                </div>
            </div>
            
            <!-- Request Section -->
            <div class="details-section">
                <h5 class="json-toggle" data-target="req-${call.id}">
                    <span class="toggle-icon">▼</span> Request
                </h5>
                <div class="details-content" id="req-${call.id}">
                    <p><strong>${call.request.method}</strong> ${call.request.url}</p>
                    <h6>Headers</h6>
                    <pre class="headers-display"><code>${escapeHtml(requestHeaders)}</code></pre>
                    ${call.request.body ? `<h6>Body (${formatBytes(call.request.bodySize || 0)})</h6>
                    <pre class="json-display"><code>${escapeHtml(requestBody)}</code></pre>` : ''}
                </div>
            </div>
            
            ${responseSection}
            
            <!-- Curl Command Section -->
            <div class="details-section">
                <h5 class="json-toggle" data-target="curl-${call.id}">
                    <span class="toggle-icon">▶</span> Curl Command
                </h5>
                <div class="details-content hidden" id="curl-${call.id}">
                    <div class="curl-toolbar">
                        <button class="btn-copy-curl" data-call-id="${call.id}">📋 Copy</button>
                        <select class="curl-format" data-call-id="${call.id}">
                            <option value="compact">Compact</option>
                            <option value="pretty">Pretty</option>
                        </select>
                    </div>
                    <pre class="curl-display" id="curl-display-${call.id}"><code>${escapeHtml(curlCompact)}</code></pre>
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle call details expansion
 * @param {string} callId - The call ID to toggle
 */
function toggleCallDetails(callId) {
    const entry = document.querySelector(`.inspector-call[data-call-id="${callId}"]`);
    if (!entry) return;
    
    if (expandedCallId === callId) {
        // Collapse
        expandedCallId = null;
    } else {
        // Collapse previous and expand new
        expandedCallId = callId;
    }
    
    renderInspector();
}

/**
 * Copy curl command to clipboard
 * @param {string} callId - The call ID
 */
async function copyCurlToClipboard(callId) {
    const call = apiHistory.find(c => c.id === callId);
    if (!call) return;
    
    const select = document.querySelector(`.curl-format[data-call-id="${callId}"]`);
    const format = select ? select.value : 'compact';
    const curlCommand = generateCurlCommand(call.request, format);
    
    try {
        await navigator.clipboard.writeText(curlCommand);
        
        // Visual feedback
        const btn = document.querySelector(`.btn-copy-curl[data-call-id="${callId}"]`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        }
        
        console.log('📋 Curl command copied to clipboard');
    } catch (error) {
        console.error('❌ Failed to copy curl command:', error);
    }
}

/**
 * Update curl display when format changes
 * @param {string} callId - The call ID
 * @param {string} format - 'compact' or 'pretty'
 */
function updateCurlDisplay(callId, format) {
    const call = apiHistory.find(c => c.id === callId);
    if (!call) return;
    
    const curlCommand = generateCurlCommand(call.request, format);
    const display = document.getElementById(`curl-display-${callId}`);
    if (display) {
        display.innerHTML = `<code>${escapeHtml(curlCommand)}</code>`;
    }
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export for use by other modules
export { startCapturing, stopCapturing };
