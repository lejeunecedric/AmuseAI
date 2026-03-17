/**
 * Jobs Module - Handles job monitoring, polling, and management
 */

import { fetchApi, API_BASE_URL } from './api.js';

// State management
let jobsList = [];
let isPolling = false;
let pollInterval = null;
let lastRefresh = null;
let expandedJobId = null;
let currentFilter = 'all';

// Configuration
const POLL_INTERVAL_MS = 2000; // 2 seconds

/**
 * Initialize the jobs monitor
 */
export function initJobsMonitor() {
    console.log('📋 Initializing jobs monitor...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup Page Visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check if we're on jobs section and should start polling
    const jobsSection = document.getElementById('section-jobs');
    if (jobsSection && jobsSection.classList.contains('active')) {
        startPolling();
    }
    
    console.log('✅ Jobs monitor initialized');
}

/**
 * Setup event listeners for job-related UI elements
 */
function setupEventListeners() {
    // Manual refresh button
    const refreshBtn = document.getElementById('jobs-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Manual refresh clicked');
            refreshJobs();
        });
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.jobs-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            console.log(`🔍 Filter clicked: ${filter}`);
            setFilter(filter);
        });
    });
}

/**
 * Fetch all jobs from the API
 */
export async function fetchJobs() {
    try {
        console.log('📡 Fetching jobs...');
        const response = await fetchApi('/api/jobs');
        jobsList = response.jobs || [];
        lastRefresh = new Date();
        
        renderJobsTable();
        updateLastRefresh();
        
        console.log(`✅ Fetched ${jobsList.length} jobs`);
        return jobsList;
    } catch (error) {
        console.error('❌ Failed to fetch jobs:', error);
        showError('Failed to load jobs. Is the API running?');
        return [];
    }
}

/**
 * Start polling for job updates
 */
export function startPolling() {
    if (isPolling) return;
    
    console.log('▶️ Starting job polling');
    isPolling = true;
    
    // Fetch immediately
    fetchJobs();
    
    // Set up interval
    pollInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            fetchJobs();
        } else {
            console.log('⏸️ Polling paused (tab hidden)');
        }
    }, POLL_INTERVAL_MS);
    
    updatePollingIndicator(true);
}

/**
 * Stop polling for job updates
 */
export function stopPolling() {
    if (!isPolling) return;
    
    console.log('⏹️ Stopping job polling');
    isPolling = false;
    
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    
    updatePollingIndicator(false);
}

/**
 * Handle page visibility changes (Page Visibility API)
 */
function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
        console.log('👁️ Tab hidden - polling will pause');
    } else {
        console.log('👁️ Tab visible - polling will resume');
        // Refresh immediately when tab becomes visible
        const jobsSection = document.getElementById('section-jobs');
        if (jobsSection && jobsSection.classList.contains('active')) {
            fetchJobs();
        }
    }
}

/**
 * Refresh jobs manually
 */
export async function refreshJobs() {
    console.log('🔄 Manual refresh');
    showLoading(true);
    await fetchJobs();
    showLoading(false);
}

/**
 * Cancel a job
 * @param {string} jobId - The job ID to cancel
 */
export async function cancelJob(jobId) {
    // Show confirmation dialog
    if (!confirm(`Are you sure you want to cancel job ${shortenId(jobId)}?`)) {
        return;
    }
    
    console.log(`🚫 Cancelling job: ${jobId}`);
    
    try {
        // Optimistic UI update
        const job = jobsList.find(j => j.id === jobId);
        if (job) {
            const originalStatus = job.status;
            job.status = 'Cancelled';
            renderJobsTable();
            
            try {
                await fetchApi(`/api/jobs/${jobId}`, {
                    method: 'DELETE'
                });
                console.log(`✅ Job ${jobId} cancelled successfully`);
            } catch (apiError) {
                // Revert on failure
                job.status = originalStatus;
                renderJobsTable();
                throw apiError;
            }
        }
    } catch (error) {
        console.error(`❌ Failed to cancel job ${jobId}:`, error);
        alert(`Failed to cancel job: ${error.message}`);
    }
}

/**
 * Fetch detailed information for a specific job
 * @param {string} jobId - The job ID
 */
async function fetchJobDetails(jobId) {
    try {
        const job = await fetchApi(`/api/jobs/${jobId}`);
        return job;
    } catch (error) {
        console.error(`❌ Failed to fetch job details for ${jobId}:`, error);
        return null;
    }
}

/**
 * Toggle job details expansion
 * @param {string} jobId - The job ID to expand/collapse
 */
async function toggleJobDetails(jobId) {
    const row = document.querySelector(`tr[data-job-id="${jobId}"]`);
    if (!row) return;
    
    // If clicking same row, collapse it
    if (expandedJobId === jobId) {
        expandedJobId = null;
        renderJobsTable();
        return;
    }
    
    // Collapse previous and expand new
    expandedJobId = jobId;
    
    // Fetch detailed info if needed
    const job = jobsList.find(j => j.id === jobId);
    if (job) {
        renderJobsTable();
    }
}

/**
 * Set the current filter and re-render
 * @param {string} filter - Filter value ('all', 'Pending', 'Processing', 'Completed', 'Failed', 'Cancelled')
 */
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active button state
    document.querySelectorAll('.jobs-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderJobsTable();
}

/**
 * Render the jobs table
 */
function renderJobsTable() {
    const tableBody = document.getElementById('jobs-table-body');
    const emptyState = document.getElementById('jobs-empty-state');
    
    if (!tableBody) return;
    
    // Filter jobs
    let filteredJobs = jobsList;
    if (currentFilter !== 'all') {
        filteredJobs = jobsList.filter(job => job.status === currentFilter);
    }
    
    // Sort by created time (newest first)
    filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Show/hide empty state
    if (filteredJobs.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const message = jobsList.length === 0 
                ? 'No jobs yet. Create one from the Generate section.'
                : `No ${currentFilter.toLowerCase()} jobs found.`;
            emptyState.querySelector('.placeholder-text').textContent = message;
        }
        return;
    }
    
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    // Render rows
    tableBody.innerHTML = filteredJobs.map(job => renderJobRow(job)).join('');
    
    // Attach event listeners to rows
    tableBody.querySelectorAll('.job-row').forEach(row => {
        row.addEventListener('click', (e) => {
            // Don't toggle if clicking buttons
            if (e.target.closest('button')) return;
            const jobId = row.dataset.jobId;
            toggleJobDetails(jobId);
        });
    });
    
    // Attach cancel button listeners
    tableBody.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const jobId = btn.dataset.jobId;
            cancelJob(jobId);
        });
    });
    
    // Attach copy button listeners
    tableBody.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const jobId = btn.dataset.jobId;
            copyToClipboard(jobId);
        });
    });
}

/**
 * Render a single job row
 * @param {object} job - The job object
 * @returns {string} HTML string
 */
function renderJobRow(job) {
    const isExpanded = expandedJobId === job.id;
    const statusColor = getStatusColor(job.status);
    const statusIcon = getStatusIcon(job.status);
    const showCancel = shouldShowCancel(job.status);
    const createdTime = formatTimestamp(job.createdAt);
    
    return `
        <tr class="job-row ${isExpanded ? 'expanded' : ''}" data-job-id="${job.id}">
            <td class="job-id">
                <code>${shortenId(job.id)}</code>
                <button class="btn-copy" data-job-id="${job.id}" title="Copy full ID">📋</button>
            </td>
            <td class="job-type">${job.type}</td>
            <td class="job-status">
                <span class="status-badge ${statusColor}">
                    <span class="status-icon">${statusIcon}</span>
                    ${job.status}
                </span>
            </td>
            <td class="job-created">${createdTime}</td>
            <td class="job-actions">
                ${showCancel ? `<button class="btn-cancel" data-job-id="${job.id}">Cancel</button>` : ''}
            </td>
        </tr>
        ${isExpanded ? renderExpandedDetails(job) : ''}
    `;
}

/**
 * Render expanded job details
 * @param {object} job - The job object
 * @returns {string} HTML string
 */
function renderExpandedDetails(job) {
    const duration = formatDuration(job.startedAt, job.completedAt);
    const progress = job.progress || 0;
    
    let resultHtml = '';
    if (job.status === 'Completed' && job.result?.image) {
        resultHtml = `
            <div class="job-result-section">
                <h5>Result Image</h5>
                <div class="job-result-image">
                    <img src="data:image/png;base64,${job.result.image}" alt="Generated result">
                </div>
            </div>
        `;
    }
    
    let errorHtml = '';
    if (job.status === 'Failed' && job.error) {
        errorHtml = `
            <div class="job-error-section">
                <h5>Error</h5>
                <pre class="error-message">${escapeHtml(job.error)}</pre>
            </div>
        `;
    }
    
    return `
        <tr class="job-details-row">
            <td colspan="5">
                <div class="job-details">
                    <div class="job-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Job ID</span>
                            <code class="detail-value">${job.id}</code>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type</span>
                            <span class="detail-value">${job.type}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value">${job.status}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Progress</span>
                            <span class="detail-value">${progress}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created</span>
                            <span class="detail-value">${formatDateTime(job.createdAt)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Started</span>
                            <span class="detail-value">${job.startedAt ? formatDateTime(job.startedAt) : 'Not started'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Completed</span>
                            <span class="detail-value">${job.completedAt ? formatDateTime(job.completedAt) : 'Not completed'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Duration</span>
                            <span class="detail-value">${duration}</span>
                        </div>
                    </div>
                    
                    <div class="job-request-section">
                        <h5>Request Parameters</h5>
                        <pre class="json-display"><code>${JSON.stringify(job.request, null, 2)}</code></pre>
                    </div>
                    
                    ${resultHtml}
                    ${errorHtml}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Get CSS color class for a status
 * @param {string} status - Job status
 * @returns {string} CSS class name
 */
function getStatusColor(status) {
    const colors = {
        'Pending': 'status-pending',
        'Processing': 'status-processing',
        'Completed': 'status-completed',
        'Failed': 'status-failed',
        'Cancelled': 'status-cancelled'
    };
    return colors[status] || 'status-pending';
}

/**
 * Get icon for a status
 * @param {string} status - Job status
 * @returns {string} Icon character
 */
function getStatusIcon(status) {
    const icons = {
        'Pending': '⏳',
        'Processing': '🔄',
        'Completed': '✅',
        'Failed': '❌',
        'Cancelled': '🚫'
    };
    return icons[status] || '⏳';
}

/**
 * Check if cancel button should be shown for a status
 * @param {string} status - Job status
 * @returns {boolean}
 */
function shouldShowCancel(status) {
    return status === 'Pending' || status === 'Processing';
}

/**
 * Format a timestamp to relative time
 * @param {string} isoString - ISO timestamp
 * @returns {string} Relative time string
 */
function formatTimestamp(isoString) {
    if (!isoString) return 'Unknown';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

/**
 * Format a timestamp to full datetime
 * @param {string} isoString - ISO timestamp
 * @returns {string} Formatted datetime
 */
function formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
}

/**
 * Format duration between two timestamps
 * @param {string} startIso - Start timestamp
 * @param {string} endIso - End timestamp
 * @returns {string} Duration string
 */
function formatDuration(startIso, endIso) {
    if (!startIso) return 'N/A';
    
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : new Date();
    const diffMs = end - start;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Shorten a UUID for display
 * @param {string} id - Full UUID
 * @returns {string} Shortened ID
 */
function shortenId(id) {
    if (!id) return '';
    return id.substring(0, 8) + '...';
}

/**
 * Update the last refresh indicator
 */
function updateLastRefresh() {
    const indicator = document.getElementById('last-updated');
    if (!indicator || !lastRefresh) return;
    
    const seconds = Math.floor((new Date() - lastRefresh) / 1000);
    indicator.textContent = `Last updated: ${seconds}s ago`;
}

/**
 * Update the polling indicator
 * @param {boolean} active - Whether polling is active
 */
function updatePollingIndicator(active) {
    const indicator = document.getElementById('auto-refresh-indicator');
    if (!indicator) return;
    
    if (active) {
        indicator.classList.add('active');
        indicator.title = 'Auto-refresh active';
    } else {
        indicator.classList.remove('active');
        indicator.title = 'Auto-refresh paused';
    }
}

/**
 * Show loading state
 * @param {boolean} loading - Whether loading
 */
function showLoading(loading) {
    const table = document.getElementById('jobs-table');
    if (!table) return;
    
    if (loading) {
        table.classList.add('loading');
    } else {
        table.classList.remove('loading');
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const errorContainer = document.getElementById('jobs-error');
    if (!errorContainer) return;
    
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 5000);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('📋 Copied to clipboard:', text);
    } catch (error) {
        console.error('❌ Failed to copy:', error);
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

// Export functions for use by other modules
export { startPolling, stopPolling };
