/**
 * Navigation Module - Handles sidebar navigation and mobile menu
 */

/**
 * Initialize navigation functionality
 */
export function initNavigation() {
    setupMobileMenu();
    setupNavigationLinks();
    setupSubmenus();
}

/**
 * Setup mobile menu toggle
 */
function setupMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (!toggle || !sidebar || !overlay) {
        console.error('Mobile menu elements not found');
        return;
    }
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        
        // Update aria-expanded
        const isExpanded = sidebar.classList.contains('open');
        toggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close menu when clicking overlay
    overlay.addEventListener('click', () => {
        toggle.classList.remove('active');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    });
    
    // Close menu on window resize if going to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
            toggle.classList.remove('active');
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Setup navigation link click handlers
 */
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('[data-section]');
    
    navLinks.forEach(link => {
        // Skip submenu toggles (they have has-submenu class)
        if (link.classList.contains('has-submenu')) {
            return;
        }
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const sectionId = link.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
                updateActiveNav(link);
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    const toggle = document.getElementById('mobile-menu-toggle');
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.getElementById('sidebar-overlay');
                    
                    if (toggle && sidebar && overlay) {
                        toggle.classList.remove('active');
                        sidebar.classList.remove('open');
                        overlay.classList.remove('active');
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    });
}

/**
 * Setup submenu toggles
 */
function setupSubmenus() {
    const submenuToggles = document.querySelectorAll('.has-submenu');
    
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
        });
    });
}

/**
 * Show a content section by ID
 * @param {string} sectionId - The section ID to show (without 'section-' prefix)
 */
export function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.warn(`Section not found: section-${sectionId}`);
        // Show welcome section as fallback
        const welcomeSection = document.getElementById('section-welcome');
        if (welcomeSection) {
            welcomeSection.classList.add('active');
        }
    }
    
    // Update page title
    updatePageTitle(sectionId);
}

/**
 * Update the active state of navigation links
 * @param {Element} activeLink - The link to mark as active
 */
function updateActiveNav(activeLink) {
    // Remove active class from all nav links
    const allLinks = document.querySelectorAll('.nav-link, .submenu-link');
    allLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    activeLink.classList.add('active');
    
    // If it's a submenu link, also highlight parent
    if (activeLink.classList.contains('submenu-link')) {
        const parentItem = activeLink.closest('.nav-item');
        if (parentItem) {
            const parentLink = parentItem.querySelector('.has-submenu');
            if (parentLink) {
                parentLink.classList.add('active');
                parentLink.setAttribute('aria-expanded', 'true');
            }
        }
    }
}

/**
 * Update the page title based on section
 * @param {string} sectionId - The current section ID
 */
function updatePageTitle(sectionId) {
    const titleElement = document.getElementById('page-title');
    if (!titleElement) return;
    
    const titles = {
        'welcome': 'Welcome',
        'generate-t2i': 'Text to Image',
        'generate-i2i': 'Image to Image',
        'generate-upscale': 'Upscale',
        'jobs': 'Job Monitor',
        'models': 'Model Management',
        'inspector': 'API Inspector'
    };
    
    titleElement.textContent = titles[sectionId] || 'AmuseAI';
}
