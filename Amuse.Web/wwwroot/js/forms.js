/**
 * Forms Module - Handles all generation form submissions
 */

import { API_BASE_URL, fetchApi } from './api.js';

/**
 * Initialize all generation forms
 */
export function initAllForms() {
    console.log('📝 Initializing generation forms...');
    
    initText2ImgForm();
    initImg2ImgForm();
    initUpscaleForm();
    initJsonToggles();
    
    console.log('✅ Generation forms initialized');
}

/**
 * Initialize Text2Img form
 */
function initText2ImgForm() {
    const form = document.getElementById('text2img-form');
    if (!form) return;
    
    // Setup slider value displays
    setupSlider('t2i-steps', 't2i-steps-value');
    setupSlider('t2i-guidance', 't2i-guidance-value');
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitText2Img();
    });
}

/**
 * Initialize Img2Img form
 */
function initImg2ImgForm() {
    const form = document.getElementById('img2img-form');
    if (!form) return;
    
    // Setup slider value displays
    setupSlider('i2i-steps', 'i2i-steps-value');
    setupSlider('i2i-guidance', 'i2i-guidance-value');
    setupStrengthSlider();
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitImg2Img();
    });
}

/**
 * Initialize Upscale form
 */
function initUpscaleForm() {
    const form = document.getElementById('upscale-form');
    if (!form) return;
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitUpscale();
    });
    
    // Update output dimensions when scale changes
    const scaleInputs = form.querySelectorAll('input[name="scale"]');
    scaleInputs.forEach(input => {
        input.addEventListener('change', updateUpscaleDimensions);
    });
}

/**
 * Setup slider value display
 */
function setupSlider(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const value = document.getElementById(valueId);
    if (!slider || !value) return;
    
    slider.addEventListener('input', () => {
        value.textContent = slider.value;
    });
}

/**
 * Setup strength slider with labels
 */
function setupStrengthSlider() {
    const slider = document.getElementById('i2i-strength');
    const value = document.getElementById('i2i-strength-value');
    const label = document.getElementById('i2i-strength-label');
    if (!slider || !value || !label) return;
    
    const labels = {
        0: 'Preserve',
        0.25: 'Subtle',
        0.5: 'Balanced',
        0.75: 'Strong',
        1: 'Transform'
    };
    
    slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        value.textContent = val.toFixed(2);
        
        // Find closest label
        let closest = 'Balanced';
        let minDiff = Infinity;
        for (const [threshold, text] of Object.entries(labels)) {
            const diff = Math.abs(val - parseFloat(threshold));
            if (diff < minDiff) {
                minDiff = diff;
                closest = text;
            }
        }
        label.textContent = closest;
    });
}

/**
 * Initialize JSON toggle handlers
 */
function initJsonToggles() {
    document.querySelectorAll('.json-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const target = document.getElementById(targetId);
            const icon = toggle.querySelector('.toggle-icon');
            
            if (target) {
                target.classList.toggle('hidden');
                if (icon) {
                    icon.textContent = target.classList.contains('hidden') ? '▶' : '▼';
                }
            }
        });
    });
}

/**
 * Collect Text2Img form data
 * @returns {object}
 */
export function collectText2ImgData() {
    const form = document.getElementById('text2img-form');
    const formData = new FormData(form);
    
    const data = {
        prompt: formData.get('prompt'),
        width: parseInt(formData.get('width'), 10) || 512,
        height: parseInt(formData.get('height'), 10) || 512,
        steps: parseInt(formData.get('steps'), 10) || 20,
        guidanceScale: parseFloat(formData.get('guidanceScale')) || 7.5
    };
    
    const negativePrompt = formData.get('negativePrompt');
    if (negativePrompt) {
        data.negativePrompt = negativePrompt;
    }
    
    const seed = formData.get('seed');
    if (seed) {
        data.seed = parseInt(seed, 10);
    }
    
    return data;
}

/**
 * Submit Text2Img form
 */
export async function submitText2Img() {
    const form = document.getElementById('text2img-form');
    const data = collectText2ImgData();
    
    // Display raw request
    displayRawRequest('t2i', data);
    
    setLoading('t2i', true);
    hideError('t2i');
    hideResult('t2i');
    
    try {
        const response = await fetchApi('/api/generate/text2img', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        displayRawResponse('t2i', response);
        showResult('t2i', response);
        console.log('✅ Text2Img job created:', response.jobId);
    } catch (error) {
        console.error('❌ Text2Img submission failed:', error);
        showError('t2i', error.message);
        displayRawResponse('t2i', { error: error.message });
    } finally {
        setLoading('t2i', false);
    }
}

/**
 * Collect Img2Img form data
 * @returns {object|null}
 */
export function collectImg2ImgData() {
    const form = document.getElementById('img2img-form');
    const formData = new FormData(form);
    
    const imageBase64 = document.getElementById('i2i-image-base64').value;
    if (!imageBase64) {
        showError('i2i', 'Please upload an image first');
        return null;
    }
    
    const data = {
        prompt: formData.get('prompt'),
        image: imageBase64,
        strength: parseFloat(formData.get('strength')) || 0.75,
        width: parseInt(formData.get('width'), 10) || 512,
        height: parseInt(formData.get('height'), 10) || 512,
        steps: parseInt(formData.get('steps'), 10) || 20,
        guidanceScale: parseFloat(formData.get('guidanceScale')) || 7.5
    };
    
    const negativePrompt = formData.get('negativePrompt');
    if (negativePrompt) {
        data.negativePrompt = negativePrompt;
    }
    
    const seed = formData.get('seed');
    if (seed) {
        data.seed = parseInt(seed, 10);
    }
    
    return data;
}

/**
 * Submit Img2Img form
 */
export async function submitImg2Img() {
    const data = collectImg2ImgData();
    if (!data) return;
    
    // Display raw request (truncate image data for display)
    const displayData = { ...data, image: data.image.substring(0, 100) + '... [truncated]' };
    displayRawRequest('i2i', displayData);
    
    setLoading('i2i', true);
    hideError('i2i');
    hideResult('i2i');
    
    try {
        const response = await fetchApi('/api/generate/img2img', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        displayRawResponse('i2i', response);
        showResult('i2i', response);
        console.log('✅ Img2Img job created:', response.jobId);
    } catch (error) {
        console.error('❌ Img2Img submission failed:', error);
        showError('i2i', error.message);
        displayRawResponse('i2i', { error: error.message });
    } finally {
        setLoading('i2i', false);
    }
}

/**
 * Collect Upscale form data
 * @returns {object|null}
 */
export function collectUpscaleData() {
    const form = document.getElementById('upscale-form');
    const formData = new FormData(form);
    
    const imageBase64 = document.getElementById('upscale-image-base64').value;
    if (!imageBase64) {
        showError('upscale', 'Please upload an image first');
        return null;
    }
    
    const data = {
        image: imageBase64,
        scale: parseInt(formData.get('scale'), 10) || 2,
        tileMode: formData.get('tileMode') === 'on'
    };
    
    return data;
}

/**
 * Submit Upscale form
 */
export async function submitUpscale() {
    const data = collectUpscaleData();
    if (!data) return;
    
    // Display raw request (truncate image data for display)
    const displayData = { ...data, image: data.image.substring(0, 100) + '... [truncated]' };
    displayRawRequest('upscale', displayData);
    
    setLoading('upscale', true);
    hideError('upscale');
    hideResult('upscale');
    
    try {
        const response = await fetchApi('/api/upscale', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        displayRawResponse('upscale', response);
        showResult('upscale', response);
        console.log('✅ Upscale job created:', response.jobId);
    } catch (error) {
        console.error('❌ Upscale submission failed:', error);
        showError('upscale', error.message);
        displayRawResponse('upscale', { error: error.message });
    } finally {
        setLoading('upscale', false);
    }
}

/**
 * Display raw request JSON
 */
export function displayRawRequest(formPrefix, data) {
    const container = document.getElementById(`${formPrefix}-request-json`);
    if (!container) return;
    
    const code = container.querySelector('code');
    if (code) {
        code.textContent = JSON.stringify(data, null, 2);
    }
    
    container.classList.remove('hidden');
    
    // Update toggle icon
    const toggle = document.querySelector(`[data-target="${formPrefix}-request-json"]`);
    if (toggle) {
        const icon = toggle.querySelector('.toggle-icon');
        if (icon) icon.textContent = '▼';
    }
}

/**
 * Display raw response JSON
 */
export function displayRawResponse(formPrefix, response) {
    const container = document.getElementById(`${formPrefix}-response-json`);
    if (!container) return;
    
    const code = container.querySelector('code');
    if (code) {
        code.textContent = JSON.stringify(response, null, 2);
    }
    
    container.classList.remove('hidden');
    
    // Update toggle icon
    const toggle = document.querySelector(`[data-target="${formPrefix}-response-json"]`);
    if (toggle) {
        const icon = toggle.querySelector('.toggle-icon');
        if (icon) icon.textContent = '▼';
    }
}

/**
 * Set loading state on form
 */
export function setLoading(formPrefix, isLoading) {
    const button = document.getElementById(`${formPrefix}-submit`);
    if (!button) return;
    
    const text = button.querySelector('.btn-text');
    const loading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('btn-loading-state');
        if (text) text.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading-state');
        if (text) text.classList.remove('hidden');
        if (loading) loading.classList.add('hidden');
    }
}

/**
 * Show error message
 */
export function showError(formPrefix, message) {
    const form = document.getElementById(`${formPrefix}-form`);
    if (!form) return;
    
    // Remove existing error
    hideError(formPrefix);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.id = `${formPrefix}-error`;
    errorDiv.innerHTML = `❌ ${message}`;
    
    const actions = form.querySelector('.form-actions');
    if (actions) {
        actions.insertAdjacentElement('afterend', errorDiv);
    } else {
        form.appendChild(errorDiv);
    }
}

/**
 * Hide error message
 */
export function hideError(formPrefix) {
    const error = document.getElementById(`${formPrefix}-error`);
    if (error) {
        error.remove();
    }
}

/**
 * Show success/result message
 */
export function showResult(formPrefix, response) {
    const resultContainer = document.getElementById(`${formPrefix}-result`);
    if (!resultContainer) return;
    
    const jobInfo = document.getElementById(`${formPrefix}-job-info`);
    if (jobInfo) {
        jobInfo.innerHTML = `
            <div class="job-details">
                <p><strong>Job ID:</strong> <code>${response.jobId}</code></p>
                <p><strong>Status:</strong> <span class="status-${response.status}">${response.status}</span></p>
                <p class="job-hint">The job has been queued. Check the Jobs section for progress.</p>
            </div>
        `;
    }
    
    resultContainer.classList.remove('hidden');
}

/**
 * Hide result container
 */
export function hideResult(formPrefix) {
    const resultContainer = document.getElementById(`${formPrefix}-result`);
    if (resultContainer) {
        resultContainer.classList.add('hidden');
    }
}

/**
 * Display generated image (placeholder for Phase 8)
 */
export function displayGeneratedImage(containerId, base64Data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <img src="data:image/png;base64,${base64Data}" alt="Generated image" class="generated-image">
    `;
}

/**
 * Update upscale output dimensions display
 */
export function updateUpscaleDimensions() {
    const scaleInput = document.querySelector('input[name="scale"]:checked');
    const dimOutput = document.getElementById('upscale-output-dim');
    const preview = document.getElementById('upscale-preview');
    
    if (!scaleInput || !dimOutput) return;
    
    const scale = parseInt(scaleInput.value, 10);
    
    if (preview && preview.naturalWidth) {
        const outWidth = preview.naturalWidth * scale;
        const outHeight = preview.naturalHeight * scale;
        dimOutput.textContent = `Output: ${outWidth} x ${outHeight}`;
    } else {
        dimOutput.textContent = `Output: ${scale}x input size`;
    }
}
