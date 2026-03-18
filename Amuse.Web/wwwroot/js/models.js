/**
 * Models Module - Handles model management, polling, and load/unload operations
 */

import { fetchApi, loadModel, unloadModel } from './api.js';

// State management
let modelsList = [];
let isPolling = false;
let pollInterval = null;
let lastRefresh = null;
let currentFilter = 'all';
let loadingModels = new Set(); // Track models being loaded/unloaded

// Configuration
const POLL_INTERVAL_MS = 5000; // 5 seconds for models

/**
 * Initialize the models manager
 */
export function initModelsManager() {
    console.log('🤖 Initializing models manager...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup Page Visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check if we're on models section and should start polling
    const modelsSection = document.getElementById('section-models');
    if (modelsSection && modelsSection.classList.contains('active')) {
        startPolling();
    }
    
    console.log('✅ Models manager initialized');
}

/**
 * Setup event listeners for model-related UI elements
 */
function setupEventListeners() {
    // Manual refresh button
    const refreshBtn = document.getElementById('models-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Models manual refresh clicked');
            refreshModels();
        });
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.models-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            console.log(`🔍 Models filter clicked: ${filter}`);
            setFilter(filter);
        });
    });
}

/**
 * Fetch all models from the API
 */
export async function fetchModels() {
    try {
        console.log('📡 Fetching models...');
        const response = await fetchApi('/api/models');
        modelsList = response.models || [];
        lastRefresh = new Date();
        
        renderModelsGrid();
        updateLastRefresh();
        
        console.log(`✅ Fetched ${modelsList.length} models`);
        return modelsList;
    } catch (error) {
        console.error('❌ Failed to fetch models:', error);
        showError('Failed to load models. Is the API running?');
        return [];
    }
}

/**
 * Start polling for model updates
 */
export function startPolling() {
    if (isPolling) return;
    
    console.log('▶️ Starting models polling');
    isPolling = true;
    
    // Fetch immediately
    fetchModels();
    
    // Set up interval
    pollInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            fetchModels();
        } else {
            console.log('⏸️ Models polling paused (tab hidden)');
        }
    }, POLL_INTERVAL_MS);
    
    updatePollingIndicator(true);
}

/**
 * Stop polling for model updates
 */
export function stopPolling() {
    if (!isPolling) return;
    
    console.log('⏹️ Stopping models polling');
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
        console.log('👁️ Tab hidden - models polling will pause');
    } else {
        console.log('👁️ Tab visible - models polling will resume');
        // Refresh immediately when tab becomes visible
        const modelsSection = document.getElementById('section-models');
        if (modelsSection && modelsSection.classList.contains('active')) {
            fetchModels();
        }
    }
}

/**
 * Refresh models manually
 */
export async function refreshModels() {
    console.log('🔄 Models manual refresh');
    showLoading(true);
    await fetchModels();
    showLoading(false);
}

/**
 * Handle load model button click
 * @param {string} modelId - The model ID to load
 */
async function handleLoadModel(modelId) {
    console.log(`⬆️ Loading model: ${modelId}`);
    
    // Add to loading set
    loadingModels.add(modelId);
    renderModelsGrid(); // Re-render to show loading state
    
    try {
        await loadModel(modelId);
        console.log(`✅ Model ${modelId} loaded successfully`);
        await fetchModels(); // Refresh to get updated state
    } catch (error) {
        console.error(`❌ Failed to load model ${modelId}:`, error);
        alert(`Failed to load model: ${error.message}`);
    } finally {
        loadingModels.delete(modelId);
        renderModelsGrid();
    }
}

/**
 * Handle unload model button click
 * @param {string} modelId - The model ID to unload
 */
async function handleUnloadModel(modelId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to unload this model? Any active jobs using this model may be affected.')) {
        return;
    }
    
    console.log(`⬇️ Unloading model: ${modelId}`);
    
    // Add to loading set
    loadingModels.add(modelId);
    renderModelsGrid(); // Re-render to show loading state
    
    try {
        await unloadModel(modelId);
        console.log(`✅ Model ${modelId} unloaded successfully`);
        await fetchModels(); // Refresh to get updated state
    } catch (error) {
        console.error(`❌ Failed to unload model ${modelId}:`, error);
        alert(`Failed to unload model: ${error.message}`);
    } finally {
        loadingModels.delete(modelId);
        renderModelsGrid();
    }
}

/**
 * Set the current filter and re-render
 * @param {string} filter - Filter value ('all', 'StableDiffusion', 'Upscaler')
 */
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active button state
    document.querySelectorAll('.models-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderModelsGrid();
}

/**
 * Get filtered models based on current filter
 * @returns {array} Filtered models
 */
function getFilteredModels() {
    if (currentFilter === 'all') {
        return modelsList;
    }
    return modelsList.filter(model => model.type === currentFilter);
}

/**
 * Calculate total memory usage of loaded models
 * @returns {number} Total memory in bytes
 */
function calculateTotalMemory() {
    return modelsList
        .filter(model => model.isLoaded)
        .reduce((total, model) => total + (model.memoryUsage || 0), 0);
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format timestamp to relative time
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
 * Get icon for model type
 * @param {string} type - Model type
 * @returns {string} Icon emoji
 */
function getModelTypeIcon(type) {
    return type === 'Upscaler' ? '🔍' : '🧠';
}

/**
 * Render the models grid
 */
function renderModelsGrid() {
    const grid = document.getElementById('models-grid');
    const emptyState = document.getElementById('models-empty-state');
    
    if (!grid) return;
    
    const filteredModels = getFilteredModels();
    
    // Update memory summary
    updateMemorySummary();
    
    // Show/hide empty state
    if (filteredModels.length === 0) {
        grid.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const message = modelsList.length === 0 
                ? 'No models available.'
                : `No ${currentFilter === 'StableDiffusion' ? 'Stable Diffusion' : 'Upscaler'} models found.`;
            emptyState.querySelector('.placeholder-text').textContent = message;
        }
        return;
    }
    
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    // Render cards
    grid.innerHTML = filteredModels.map(model => renderModelCard(model)).join('');
    
    // Attach event listeners to load/unload buttons
    grid.querySelectorAll('.btn-load').forEach(btn => {
        btn.addEventListener('click', () => {
            const modelId = btn.dataset.modelId;
            handleLoadModel(modelId);
        });
    });
    
    grid.querySelectorAll('.btn-unload').forEach(btn => {
        btn.addEventListener('click', () => {
            const modelId = btn.dataset.modelId;
            handleUnloadModel(modelId);
        });
    });
}

/**
 * Render a single model card
 * @param {object} model - The model object
 * @returns {string} HTML string
 */
function renderModelCard(model) {
    const isLoaded = model.isLoaded;
    const isLoading = loadingModels.has(model.id);
    const icon = getModelTypeIcon(model.type);
    const statusBadge = isLoaded 
        ? `<span class="model-status status-loaded"><span class="status-icon">✅</span> Loaded</span>`
        : `<span class="model-status status-unloaded"><span class="status-icon">⚪</span> Not Loaded</span>`;
    
    const memoryInfo = isLoaded && model.memoryUsage
        ? `<div class="model-memory">
            <span class="memory-icon">💾</span>
            <span class="memory-usage">${formatBytes(model.memoryUsage)}</span>
            <span class="load-time">(${formatTimestamp(model.loadedAt)})</span>
           </div>`
        : '';
    
    const actionButton = isLoading
        ? `<button class="btn-loading" disabled><span class="spinner"></span> Processing...</button>`
        : isLoaded
            ? `<button class="btn-unload" data-model-id="${model.id}">Unload Model</button>`
            : `<button class="btn-load" data-model-id="${model.id}">Load Model</button>`;
    
    return `
        <div class="model-card ${isLoaded ? 'loaded' : ''}">
            <div class="model-header">
                <span class="model-icon">${icon}</span>
                <div class="model-info">
                    <h4 class="model-name">${model.name || model.id}</h4>
                    <span class="format-badge">${model.format}</span>
                </div>
                ${statusBadge}
            </div>
            
            <div class="model-details">
                <div class="model-meta">
                    <span class="model-type">${model.type}</span>
                    <span class="model-size">${formatBytes(model.size)}</span>
                </div>
                ${memoryInfo}
            </div>
            
            <div class="model-actions">
                ${actionButton}
            </div>
        </div>
    `;
}

/**
 * Update the memory summary display
 */
function updateMemorySummary() {
    const container = document.getElementById('models-memory-summary');
    if (!container) return;
    
    const totalMemory = calculateTotalMemory();
    const loadedCount = modelsList.filter(m => m.isLoaded).length;
    const totalCount = modelsList.length;
    
    // Display memory info
    const memoryText = totalMemory > 0 
        ? `${formatBytes(totalMemory)} used by ${loadedCount} model${loadedCount !== 1 ? 's' : ''}`
        : `No models loaded (${totalCount} available)`;
    
    container.innerHTML = `
        <div class="memory-summary-content">
            <span class="memory-icon">💾</span>
            <span class="memory-text">${memoryText}</span>
        </div>
    `;
}

/**
 * Update the last refresh indicator
 */
function updateLastRefresh() {
    const indicator = document.getElementById('last-refreshed');
    if (!indicator || !lastRefresh) return;
    
    const seconds = Math.floor((new Date() - lastRefresh) / 1000);
    indicator.textContent = `Last refreshed: ${seconds}s ago`;
}

/**
 * Update the polling indicator
 * @param {boolean} active - Whether polling is active
 */
function updatePollingIndicator(active) {
    const indicator = document.getElementById('models-polling-indicator');
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
    const grid = document.getElementById('models-grid');
    if (!grid) return;
    
    if (loading) {
        grid.classList.add('loading');
    } else {
        grid.classList.remove('loading');
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const errorContainer = document.getElementById('models-error');
    if (!errorContainer) return;
    
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 5000);
}

// Export functions for use by other modules
export { startPolling, stopPolling };
