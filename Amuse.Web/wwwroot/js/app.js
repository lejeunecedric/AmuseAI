/**
 * Main Application Entry Point
 * Coordinates API connection checking and navigation
 */

import { checkApiConnection, API_BASE_URL } from './api.js';
import { initNavigation } from './navigation.js';
import { initAllForms } from './forms.js';
import { initImageHandlers } from './images.js';
import { initJobsMonitor, startPolling as startJobsPolling, stopPolling as stopJobsPolling } from './jobs.js';
import { initModelsManager, startPolling as startModelsPolling, stopPolling as stopModelsPolling } from './models.js';
import { initInspector, startCapturing, stopCapturing } from './inspector.js';

// Connection check interval (5 seconds)
const CONNECTION_CHECK_INTERVAL = 5000;

// DOM Elements
let statusDot = null;
let statusText = null;

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 AmuseAI Web Client initializing...');
    
    // Cache DOM elements
    statusDot = document.getElementById('status-dot');
    statusText = document.getElementById('status-text');
    
    // Initialize navigation
    initNavigation();
    
    // Initialize generation forms
    initAllForms();
    
    // Initialize image handlers
    initImageHandlers();
    
    // Initialize jobs monitor
    initJobsMonitor();
    
    // Initialize models manager
    initModelsManager();
    
    // Initialize API Inspector
    initInspector();
    
    // Setup navigation change listeners for polling and capture
    setupJobsPollingOnNavigation();
    setupModelsPollingOnNavigation();
    setupInspectorCaptureOnNavigation();
    
    // Check API connection immediately
    updateConnectionStatus();
    
    // Set up periodic connection checks
    setInterval(updateConnectionStatus, CONNECTION_CHECK_INTERVAL);
    
    console.log(`✅ AmuseAI Web Client ready`);
    console.log(`   API endpoint: ${API_BASE_URL}`);
    console.log(`   Connection check interval: ${CONNECTION_CHECK_INTERVAL}ms`);
}

/**
 * Update the API connection status indicator
 */
async function updateConnectionStatus() {
    const result = await checkApiConnection();
    
    if (result.connected) {
        showConnected(result.latency);
    } else {
        showDisconnected(result.error);
    }
}

/**
 * Show connected state
 * @param {number} latency - Connection latency in ms
 */
function showConnected(latency) {
    if (!statusDot || !statusText) return;
    
    statusDot.className = 'status-dot connected';
    statusDot.title = `Connected (${latency}ms)`;
    statusText.textContent = 'Connected';
    statusText.title = `Latency: ${latency}ms`;
    
    console.log(`✅ API Connected (${latency}ms)`);
}

/**
 * Show disconnected state
 * @param {string} error - Error message
 */
function showDisconnected(error) {
    if (!statusDot || !statusText) return;

    statusDot.className = 'status-dot disconnected';
    statusDot.title = `Disconnected: ${error}`;
    statusText.textContent = 'Disconnected';
    statusText.title = `Error: ${error}`;

    console.log(`❌ API Disconnected: ${error}`);
}

/**
 * Setup navigation change listener to manage jobs polling
 */
function setupJobsPollingOnNavigation() {
    const jobsSection = document.getElementById('section-jobs');
    if (!jobsSection) return;

    // Use MutationObserver to detect when jobs section becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const isActive = jobsSection.classList.contains('active');
                if (isActive) {
                    console.log('📋 Jobs section activated - starting polling');
                    startJobsPolling();
                } else {
                    console.log('📋 Jobs section deactivated - stopping polling');
                    stopJobsPolling();
                }
            }
        });
    });

    observer.observe(jobsSection, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Check initial state
    if (jobsSection.classList.contains('active')) {
        console.log('📋 Jobs section initially active - starting polling');
        startJobsPolling();
    }
}

/**
 * Setup navigation change listener to manage models polling
 */
function setupModelsPollingOnNavigation() {
    const modelsSection = document.getElementById('section-models');
    if (!modelsSection) return;

    // Use MutationObserver to detect when models section becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const isActive = modelsSection.classList.contains('active');
                if (isActive) {
                    console.log('🤖 Models section activated - starting polling');
                    startModelsPolling();
                } else {
                    console.log('🤖 Models section deactivated - stopping polling');
                    stopModelsPolling();
                }
            }
        });
    });

    observer.observe(modelsSection, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Check initial state
    if (modelsSection.classList.contains('active')) {
        console.log('🤖 Models section initially active - starting polling');
        startModelsPolling();
    }
}

/**
 * Setup navigation change listener to manage inspector capture
 */
function setupInspectorCaptureOnNavigation() {
    const inspectorSection = document.getElementById('section-inspector');
    if (!inspectorSection) return;

    // Use MutationObserver to detect when inspector section becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const isActive = inspectorSection.classList.contains('active');
                if (isActive) {
                    console.log('🔍 Inspector section activated - starting capture');
                    startCapturing();
                } else {
                    console.log('🔍 Inspector section deactivated - stopping capture');
                    stopCapturing();
                }
            }
        });
    });

    observer.observe(inspectorSection, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Check initial state
    if (inspectorSection.classList.contains('active')) {
        console.log('🔍 Inspector section initially active - starting capture');
        startCapturing();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}
