// Global variables
let inventoryData = [];
let currentSeason = {
    name: 'New Season',
    date: new Date().toISOString().split('T')[0],
    items: []
};
let seasonArchive = [];
let currentLabelsSession = {
    name: 'New Labels Session',
    date: new Date().toISOString().split('T')[0],
    items: []
};
let labelsSessionArchive = [];
let pricingLabelsSession = [];
let scannerContext = null; // Holds context for the barcode scanner's result
let zxingCodeReader = null;
let scannerStream = null;
let scannerActive = false;
let searchWorker;
let currentLanguage = 'en'; // Default language

// Authentication variables
// Authentication is handled by the Netlify Function. No passwords belong in frontend code.
let validKeys = [];
let enteredKey = '';
let isAuthenticated = false;
let authAttempts = 0;
const maxAuthAttempts = 3;

// Language translations
const translations = {
    en: {
        // Loading screen
        'loading-title': 'Loading Stockify Soufian',
        'loading-message': 'Preparing your inventory management system...',
        
        // Authentication
        'secure-access': 'Secure Access',
        'enter-key': 'Enter your password to use Stockify Soufian',
        'access-key': 'Password',
        'key-help': 'Contact the administrator if you need the password',
        'key-incorrect': 'Invalid password. Please try again.',
        'key-successful': 'Access granted!',
        'too-many-attempts': 'Too many failed attempts. Please try again later.',
        'remember-me': 'Remember me on this device',
        
        // Sidebar
        'menu': 'Menu',
        'upload-new-data': 'Upload New Data',
        'settings': 'Settings',
        'dark-mode': 'Dark Mode',
        'language': 'Language',
        'about': 'About',
        'contact': 'Contact',
        
        // Dashboard
        'dashboard-title': 'Dashboard',
        'inventory-search': 'Inventory Search',
        'inventory-search-desc': 'Search and filter your inventory',
        'price-check': 'Price Check',
        'price-check-desc': 'Check product prices',
        'supplier-search': 'Supplier Search',
        'supplier-search-desc': 'Find supplier information',
        'digital-stocktaking': 'Digital Stocktaking',
        'digital-stocktaking-desc': 'Manage your stocktaking sessions',
        'pricing-labels': 'Pricing Labels',
        'pricing-labels-desc': 'Generate pricing labels',
        'statistics': 'Statistics',
        'statistics-desc': 'View inventory analytics',
        
        // Search and filters
        'search-placeholder': 'Search products...',
        'search': 'Search',
        'all-categories': 'All Categories',
        'stock-filter': 'Stock Filter',
        'all-stock': 'All Stock',
        'in-stock': 'In Stock',
        'low-stock': 'Low Stock (< 10)',
        'out-of-stock': 'Out of Stock',
        'custom-range': 'Custom Range',
        'price-filter': 'Price Filter',
        'min': 'Min',
        'max': 'Max',
        
        // Results
        'no-products-found': 'No products found matching your criteria.',
        'product-not-found': 'Product not found.',
        'code': 'Code',
        'subcode': 'Subcode',
        'category': 'Category',
        'supplier': 'Supplier',
        'stock': 'Stock',
        'price': 'Price',
        
        // Notifications
        'language-set-english': 'Language set to English.',
        'language-set-french': 'Language set to French.',
        'dark-mode-enabled': 'Dark mode enabled',
        'light-mode-enabled': 'Light mode enabled',
        
        // Stocktaking
        'new-season': 'New Season',
        'new-labels-session': 'New Labels Session',
        'started-today': 'Started today',
        'items': 'items',
        'total-quantity': 'Total Quantity',
        'no-items-scanned': 'No items scanned yet',
        'no-barcodes-scanned': 'No barcodes scanned yet',
        
        // Buttons
        'start-scan': 'Start Scan',
        'manual-entry': 'Manual Entry',
        'rename': 'Rename',
        'start-new': 'Start New',
        'view-archive': 'View Archive',
        'delete': 'Delete',
        'share': 'Share',
        'export-excel': 'Export Excel',
        'cancel': 'Cancel',
        'ok': 'OK',
        'add': 'Add',
        'edit': 'Edit',
        'save': 'Save',
        
        // Modal titles
        'enter-quantity': 'Enter Quantity',
        'rename-season': 'Rename Season',
        'new-season-title': 'New Season',
        'rename-session': 'Rename Session',
        'new-session-title': 'New Session',
        'edit-quantity': 'Edit Quantity',
        'edit-barcode': 'Edit Barcode',
        
        // Placeholders
        'enter-season-name': 'Enter new season name',
        'enter-session-name': 'Enter new session name',
        'enter-quantity': 'Enter new quantity',
        'enter-barcode': 'Enter new barcode',
        'quantity': 'Quantity',
        'barcode': 'Barcode'
    },
    fr: {
        // Loading screen
        'loading-title': 'Chargement de Stockify Soufian',
        'loading-message': 'Préparation de votre système de gestion d\'inventaire...',
        
        // Authentication
        'secure-access': 'Accès Sécurisé',
        'enter-key': 'Entrez votre mot de passe pour utiliser Stockify Soufian',
        'access-key': 'Mot de passe',
        'key-help': 'Contactez l\'administrateur si vous avez besoin du mot de passe',
        'key-incorrect': 'Mot de passe invalide. Veuillez réessayer.',
        'key-successful': 'Accès accordé!',
        'too-many-attempts': 'Trop de tentatives échouées. Veuillez réessayer plus tard.',
        'remember-me': 'Se souvenir de moi sur cet appareil',
        
        // Sidebar
        'menu': 'Menu',
        'upload-new-data': 'Télécharger Nouvelles Données',
        'settings': 'Paramètres',
        'dark-mode': 'Mode Sombre',
        'language': 'Langue',
        'about': 'À Propos',
        'contact': 'Contact',
        
        // Dashboard
        'dashboard-title': 'Tableau de Bord',
        'inventory-search': 'Recherche d\'Inventaire',
        'inventory-search-desc': 'Rechercher et filtrer votre inventaire',
        'price-check': 'Vérification des Prix',
        'price-check-desc': 'Vérifier les prix des produits',
        'supplier-search': 'Recherche Fournisseur',
        'supplier-search-desc': 'Trouver les informations fournisseur',
        'digital-stocktaking': 'Inventaire Numérique',
        'digital-stocktaking-desc': 'Gérer vos sessions d\'inventaire',
        'pricing-labels': 'Étiquettes de Prix',
        'pricing-labels-desc': 'Générer des étiquettes de prix',
        'statistics': 'Statistiques',
        'statistics-desc': 'Voir les analyses d\'inventaire',
        
        // Search and filters
        'search-placeholder': 'Rechercher des produits...',
        'search': 'Rechercher',
        'all-categories': 'Toutes les Catégories',
        'all-stock-levels': 'Tous les Niveaux de Stock',
        'stock-filter': 'Filtre de Stock',
        'all-stock': 'Tout le Stock',
        'in-stock': 'En Stock',
        'low-stock': 'Stock Faible (< 10)',
        'out-of-stock': 'Rupture de Stock',
        'custom-range': 'Plage Personnalisée',
        'price-filter': 'Filtre de Prix',
        'min': 'Min',
        'max': 'Max',
        'to': 'à',
        'from': 'De',
        'mad': 'MAD',
        'mad-to': 'MAD à',
        'scan-barcode': 'Scanner Code-barres',
        
        // Results
        'no-products-found': 'Aucun produit trouvé correspondant à vos critères.',
        'product-not-found': 'Produit non trouvé.',
        'code': 'Code',
        'subcode': 'Subcode',
        'category': 'Catégorie',
        'supplier': 'Fournisseur',
        'stock': 'Stock',
        'price': 'Prix',
        
        // Statistics
        'total-products': 'Total Produits',
        'total-value': 'Valeur Totale',
        'low-stock-items': 'Articles en Stock Faible',
        'top-product': 'Produit Principal',
        'categories': 'Catégories',
        'average-price': 'Prix Moyen',
        'visual-analytics': 'Analyses Visuelles',
        'category-distribution': 'Distribution par Catégorie',
        'products-by-category': 'Produits par catégorie',
        'stock-levels': 'Niveaux de Stock',
        'stock-distribution-overview': 'Aperçu de la distribution du stock',
        'value-distribution': 'Distribution de Valeur',
        'top-categories-by-value': 'Top catégories par valeur',
        'top-suppliers': 'Top Fournisseurs',
        'products-by-supplier': 'Produits par fournisseur',
        
        // Upload
        'upload-desc': 'Effacer les données existantes et télécharger un nouveau fichier Excel',
        'drag-drop-excel': 'Glisser-Déposer Fichier Excel',
        'or': 'ou',
        'browse-files': 'Parcourir les Fichiers',
        
        // About page
        'about-desc': 'La solution définitive pour la gestion d\'inventaire moderne.',
        'about-text-1': 'Bienvenue à Stockify Soufian, la solution définitive pour la gestion d\'inventaire moderne. Dans l\'environnement commercial rapide d\'aujourd\'hui, le contrôle efficace de l\'inventaire n\'est pas seulement un avantage—c\'est une nécessité. Stockify Soufian est méticuleusement conçu pour autonomiser les entreprises et les individus avec une vitesse et simplicité inégalées dans la gestion de leurs actifs produits.',
        'about-text-2': 'Développé par Soufian, cette Application Web Progressive (PWA) est conçue de zéro pour fournir une expérience transparente et intuitive. Notre mission principale est de transformer la tâche souvent complexe de recherche et gestion d\'inventaire en un processus rapide, sans effort et hautement précis. Nous comprenons que le temps est une marchandise précieuse, et chaque seconde économisée dans les opérations d\'inventaire se traduit directement par une productivité et rentabilité améliorées.',
        'about-text-3': 'Stockify Soufian se distingue par son engagement envers la conception centrée sur l\'utilisateur et la fonctionnalité robuste. Que vous soyez un propriétaire de petite entreprise suivant méticuleusement chaque article, ou une grande entreprise cherchant à rationaliser d\'importantes bases de données de produits, notre application s\'adapte à vos besoins. Son architecture d\'application web progressive garantit que vous pouvez accéder à vos données d\'inventaire à tout moment, n\'importe où, et sur n\'importe quel appareil, avec ou sans connexion internet, offrant une expérience vraiment réactive et fiable.',
        'key-features-intro': 'Les fonctionnalités clés sont intégrées pour assurer un contrôle complet et des insights en temps réel:',
        'feature-1': 'Recherche d\'Inventaire Ultra-Rapide',
        'feature-2': 'Gestion de Stock Sans Effort',
        'feature-3': 'Scan de Code-barres Intuitif',
        'feature-4': 'Capacités d\'Inventaire Numérique',
        'feature-5': 'Rapports et Statistiques Dynamiques',
        'feature-6': 'Synchronisation de Données Transparente',
        'about-text-4': 'Stockify Soufian est plus qu\'une simple application; c\'est votre partenaire dédié pour atteindre une efficacité d\'inventaire optimale. Nous nous engageons à l\'amélioration continue, garantissant que Stockify Soufian reste à l\'avant-garde de la technologie de gestion d\'inventaire, évoluant toujours pour répondre aux demandes dynamiques de votre entreprise. Découvrez l\'avenir du contrôle d\'inventaire—simple, rapide et précis.',
        'version': 'Version: 1.0.0',
        'developed-by': 'Développé par: Soufian',
        
        // Contact
        'contact-desc': 'Nous aimerions avoir de vos nouvelles!',
        'email': 'Email',
        
        // Notifications
        'language-set-english': 'Langue définie en Anglais.',
        'language-set-french': 'Langue définie en Français.',
        'dark-mode-enabled': 'Mode sombre activé',
        'light-mode-enabled': 'Mode clair activé',
        
        // Stocktaking
        'new-season': 'Nouvelle Saison',
        'new-labels-session': 'Nouvelle Session d\'Étiquettes',
        'started-today': 'Commencé aujourd\'hui',
        'items': 'articles',
        'total-quantity': 'Quantité Totale',
        'no-items-scanned': 'Aucun article scanné encore',
        'no-barcodes-scanned': 'Aucun code-barres scanné encore',
        'active': 'Actif',
        'ready-to-scan': 'Prêt à Scanner',
        'ready-to-scan-labels': 'Prêt à Scanner les Étiquettes',
        'tap-scan-button': 'Appuyez sur le bouton de scan ou utilisez la saisie manuelle',
        'scan-barcodes-continuously': 'Scannez les codes-barres en continu ou utilisez la saisie manuelle.',
        'items-scanned': 'Articles Scannés:',
        'scanned-items': 'Articles Scannés',
        'scanned-barcodes': 'Codes-barres Scannés',
        'season-archive': 'Archive de Saison',
        'no-archived-seasons': 'Aucune saison archivée encore',
        
        // Scanner
        'barcode-scanner': 'Scanner de Code-barres',
        'position-barcode': 'Positionnez le code-barres dans le cadre',
        
        // Modals
        'manual-barcode-entry': 'Saisie Manuelle de Code-barres',
        'enter-barcode-manually': 'Entrer le code-barres manuellement:',
        'enter-new-name': 'Entrer un nouveau nom:',
        'enter-name': 'Entrer le nom',
        'confirm-action': 'Confirmer l\'Action',
        'are-you-sure': 'Êtes-vous sûr de vouloir continuer?',
        'confirm': 'Confirmer',
        
        // Buttons
        'start-scan': 'Commencer le Scan',
        'manual-entry': 'Saisie Manuelle',
        'rename': 'Renommer',
        'start-new': 'Commencer Nouveau',
        'view-archive': 'Voir l\'Archive',
        'delete': 'Supprimer',
        'share': 'Partager',
        'export-excel': 'Exporter Excel',
        'cancel': 'Annuler',
        'ok': 'OK',
        'add': 'Ajouter',
        'edit': 'Modifier',
        'save': 'Sauvegarder',
        
        // Modal titles
        'enter-quantity': 'Entrer la Quantité',
        'rename-season': 'Renommer la Saison',
        'new-season-title': 'Nouvelle Saison',
        'rename-session': 'Renommer la Session',
        'new-session-title': 'Nouvelle Session',
        'edit-quantity': 'Modifier la Quantité',
        'edit-barcode': 'Modifier le Code-barres',
        
        // Placeholders
        'enter-season-name': 'Entrer le nom de la nouvelle saison',
        'enter-session-name': 'Entrer le nom de la nouvelle session',
        'enter-quantity': 'Entrer la nouvelle quantité',
        'enter-barcode': 'Entrer le nouveau code-barres',
        'quantity': 'Quantité',
        'barcode': 'Code-barres'
    }
};

// Language switching functions
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    }
}

function saveLanguagePreference(language) {
    localStorage.setItem('language', language);
}

function switchLanguage(language) {
    if (!translations[language]) {
        console.error('Language not supported:', language);
        return;
    }
    
    currentLanguage = language;
    saveLanguagePreference(language);
    updateAllTexts();
    updateLanguageButtons();
    
    // Update season and session names if they are default values
    updateDefaultNames();
    
    const message = translations[language]['language-set-' + (language === 'en' ? 'english' : 'french')];
    showNotification(message, 'success');
}

function updateAllTexts() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            if (element.tagName === 'INPUT' && element.type !== 'submit' && element.type !== 'button') {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
    
    // Update specific elements that might not have data-translate attributes
    updateSpecificElements();
}

function updateSpecificElements() {
    // Update page title
    document.title = 'Stockify Soufian';
    
    // Update loading screen
    const loadingTitle = document.querySelector('.loading-content h3');
    if (loadingTitle) {
        loadingTitle.textContent = translations[currentLanguage]['loading-title'];
    }
    
    // Update any dynamically generated content
    updateStocktakingDisplay();
    updatePricingLabelsDisplay();
}

function updateLanguageButtons() {
    const langEnBtn = document.getElementById('lang-en');
    const langFrBtn = document.getElementById('lang-fr');
    
    if (langEnBtn && langFrBtn) {
        langEnBtn.classList.toggle('active', currentLanguage === 'en');
        langFrBtn.classList.toggle('active', currentLanguage === 'fr');
    }
}

function updateDefaultNames() {
    // Update current season name if it's still the default
    if (currentSeason.name === 'New Season' || currentSeason.name === 'Nouvelle Saison') {
        currentSeason.name = translations[currentLanguage]['new-season'];
        saveSeasonData();
    }
    
    // Update current labels session name if it's still the default
    if (currentLabelsSession.name === 'New Labels Session' || currentLabelsSession.name === 'Nouvelle Session d\'Étiquettes') {
        currentLabelsSession.name = translations[currentLanguage]['new-labels-session'];
        saveLabelsSessionData();
    }
}

function translate(key) {
    return translations[currentLanguage][key] || key;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');

    // Show loading screen
    showLoadingScreen();

    // Load language preference first
    loadLanguagePreference();

    // Initialize the search worker
    searchWorker = new Worker('worker.js');
    searchWorker.onmessage = function(e) {
        const { status, results, totalFound, isLimited } = e.data;
        if (status === 'searchComplete') {
            displayInventoryResults(results, totalFound, isLimited);
        }
    };
    
    // Handle worker errors
    searchWorker.onerror = function(error) {
        console.error('Search worker error:', error);
        showNotification('Search functionality temporarily unavailable', 'error');
    };

    // Apply theme first to avoid flash of light mode
    applyInitialTheme();

    // Load data from localStorage
    loadInventoryData();
    loadSeasonData();
    loadLabelsSessionData();

    // Initialize event listeners
    initializeEventListeners();

    // Initialize history management for proper back button handling
    initializeHistoryManagement();

    // Initialize views
    showView('dashboard-view');

    // Apply language after everything is loaded
    updateAllTexts();
    updateLanguageButtons();

    // Hide loading screen after initialization
    setTimeout(() => {
        hideLoadingScreen();
    }, 1500);

    console.log('App initialized successfully');
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
        
        // Update loading messages
        const messages = [
            'Preparing your inventory management system...',
            'Loading your data...',
            'Setting up the interface...',
            'Almost ready...'
        ];
        
        let messageIndex = 0;
        const messageElement = document.getElementById('loading-message');
        
        const messageInterval = setInterval(() => {
            if (messageElement && messageIndex < messages.length) {
                messageElement.textContent = messages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 400);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

function initializeEventListeners() {
    console.log('Setting up event listeners...');

    // Dashboard card clicks
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('click', handleDashboardCardClick);
    });

    // Sidebar Listeners
    initializeSidebarListeners();

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => showView('dashboard-view'));
    }

    // Browser back/forward button handling
    window.addEventListener('popstate', handlePopState);

    // Initialize history state for dashboard
    if (!history.state) {
        history.replaceState({ view: 'dashboard-view' }, 'Dashboard', '#dashboard');
    }

    // Inventory Search Listeners
    initializeInventorySearchListeners();

    // Price Check and Supplier Search Listeners
    initializeOtherSearchListeners();

    // Digital Stocktaking specific listeners
    initializeStocktakingListeners();

    // Pricing Labels specific listeners
    initializePricingLabelsListeners();

    // Barcode scanner listeners
    initializeScannerListeners();

    // Upload functionality
    initializeUploadListeners();

    // Custom modal listeners
    initializeCustomModalListeners();

    console.log('Event listeners set up successfully');
}

function initializeCustomModalListeners() {
    console.log('Setting up custom modal listeners...');
    
    const modal = document.getElementById('custom-name-edit-modal');
    const overlay = document.getElementById('custom-modal-overlay');
    const cancelBtn = document.getElementById('custom-name-cancel-btn');
    const okBtn = document.getElementById('custom-name-ok-btn');
    const input = document.getElementById('custom-name-input');

    if (overlay) {
        overlay.addEventListener('click', closeCustomModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeCustomModal);
    }
    
    if (okBtn) {
        okBtn.addEventListener('click', confirmCustomModal);
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmCustomModal();
            }
        });
    }

    // Initialize confirmation modal listeners
    initializeConfirmationModalListeners();
}

function initializeConfirmationModalListeners() {
    console.log('Setting up confirmation modal listeners...');
    
    const confirmationModal = document.getElementById('custom-confirmation-modal');
    const confirmationOverlay = confirmationModal?.querySelector('.custom-modal-overlay');
    const confirmationCancelBtn = document.getElementById('confirmation-cancel-btn');
    const confirmationOkBtn = document.getElementById('confirmation-ok-btn');

    if (confirmationOverlay) {
        confirmationOverlay.addEventListener('click', closeConfirmationModal);
    }
    
    if (confirmationCancelBtn) {
        confirmationCancelBtn.addEventListener('click', closeConfirmationModal);
    }
    
    if (confirmationOkBtn) {
        confirmationOkBtn.addEventListener('click', confirmConfirmationModal);
    }
}

function showConfirmationModal(title, message, type = 'warning', callback) {
    console.log('Showing confirmation modal:', title);
    
    const modal = document.getElementById('custom-confirmation-modal');
    const titleEl = document.getElementById('confirmation-modal-title');
    const messageEl = document.getElementById('confirmation-modal-message');
    const iconEl = document.getElementById('confirmation-modal-icon');
    
    if (modal && titleEl && messageEl && iconEl) {
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        // Reset icon classes
        iconEl.className = 'custom-modal-icon';
        iconEl.classList.add(type);
        
        // Set appropriate icon based on type
        const iconElement = iconEl.querySelector('i');
        if (iconElement) {
            iconElement.className = type === 'warning' ? 'fas fa-exclamation-triangle' : 
                                   type === 'danger' ? 'fas fa-trash' : 
                                   type === 'info' ? 'fas fa-info-circle' : 
                                   'fas fa-question-circle';
        }
        
        // Store callback for later use
        modal.dataset.callback = callback.name;
        
        modal.classList.add('active');
    }
}

function closeConfirmationModal() {
    console.log('Closing confirmation modal...');
    
    const modal = document.getElementById('custom-confirmation-modal');
    if (modal) {
        modal.classList.remove('active');
        delete modal.dataset.callback;
    }
}

function confirmConfirmationModal() {
    console.log('Confirming confirmation modal...');
    
    const modal = document.getElementById('custom-confirmation-modal');
    
    if (modal) {
        const callbackName = modal.dataset.callback;
        
        if (callbackName) {
            // Call the appropriate callback function
            switch (callbackName) {
                case 'handleDeleteSeason':
                    handleDeleteSeason();
                    break;
                case 'handleStartNewSeason':
                    handleStartNewSeason();
                    break;
                case 'handleDeleteLabelsSession':
                    handleDeleteLabelsSession();
                    break;
                case 'handleStartNewLabelsSession':
                    handleStartNewLabelsSession();
                    break;
            }
            closeConfirmationModal();
        }
    }
}

function showCustomModal(title, placeholder, currentValue, callback) {
    console.log('Showing custom modal:', title);
    
    const modal = document.getElementById('custom-name-edit-modal');
    const titleEl = document.getElementById('custom-modal-title');
    const input = document.getElementById('custom-name-input');
    
    if (modal && titleEl && input) {
        titleEl.textContent = title;
        input.placeholder = placeholder;
        input.value = currentValue || '';
        
        // Store callback for later use
        modal.dataset.callback = callback.name;
        
        modal.classList.add('active');
        setTimeout(() => input.focus(), 100);
    }
}

function closeCustomModal() {
    console.log('Closing custom modal...');
    
    const modal = document.getElementById('custom-name-edit-modal');
    if (modal) {
        modal.classList.remove('active');
        delete modal.dataset.callback;
    }
}

function confirmCustomModal() {
    console.log('Confirming custom modal...');
    
    const modal = document.getElementById('custom-name-edit-modal');
    const input = document.getElementById('custom-name-input');
    
    if (modal && input) {
        const value = input.value.trim();
        const callbackName = modal.dataset.callback;
        
        if (value && callbackName) {
            // Call the appropriate callback function
            switch (callbackName) {
                case 'handleSeasonRename':
                    handleSeasonRename(value);
                    break;
                case 'handleNewSeason':
                    handleNewSeason(value);
                    break;
                case 'handleLabelsSessionRename':
                    handleLabelsSessionRename(value);
                    break;
                case 'handleNewLabelsSession':
                    handleNewLabelsSession(value);
                    break;
                case 'handleQuantityEdit':
                    handleQuantityEdit(value);
                    break;
                case 'handleBarcodeEdit':
                    handleBarcodeEdit(value);
                    break;
            }
            closeCustomModal();
        } else if (!value) {
            showNotification('Please enter a value.', 'error');
        }
    }
}

// Callback functions for custom modal
function handleSeasonRename(newName) {
    currentSeason.name = newName;
    saveSeasonData();
    updateStocktakingDisplay();
    showNotification('Season renamed successfully!', 'success');
}

function handleNewSeason(newName) {
    currentSeason = {
        name: newName,
        date: new Date().toISOString().split('T')[0],
        items: []
    };
    saveSeasonData();
    updateStocktakingDisplay();
    showNotification('New season started!', 'success');
}

function handleLabelsSessionRename(newName) {
    currentLabelsSession.name = newName;
    saveLabelsSessionData();
    updatePricingLabelsDisplay();
    showNotification('Session renamed successfully!', 'success');
}

function handleNewLabelsSession(newName) {
    currentLabelsSession = {
        name: newName,
        date: new Date().toISOString().split('T')[0],
        items: []
    };
    saveLabelsSessionData();
    updatePricingLabelsDisplay();
    showNotification('New session started!', 'success');
}

let currentEditIndex = null;

function handleQuantityEdit(newQuantity) {
    if (currentEditIndex !== null && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
        currentSeason.items[currentEditIndex].quantity = parseInt(newQuantity);
        currentSeason.items[currentEditIndex].timestamp = new Date().toISOString();
        saveSeasonData();
        updateStocktakingDisplay();
        showNotification('Item updated successfully!', 'success');
        currentEditIndex = null;
    } else {
        showNotification('Please enter a valid quantity.', 'error');
    }
}

function handleBarcodeEdit(newBarcode) {
    if (currentEditIndex !== null && newBarcode && isValidBarcode(newBarcode)) {
        currentLabelsSession.items[currentEditIndex] = newBarcode;
        saveLabelsSessionData();
        updatePricingLabelsList();
        showNotification('Barcode updated successfully!', 'success');
        currentEditIndex = null;
    } else if (newBarcode) {
        showNotification('Invalid barcode format.', 'error');
    }
}

function initializeSidebarListeners() {
    console.log('Setting up sidebar listeners...');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const uploadItem = document.getElementById('sidebar-upload-item');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const langEnBtn = document.getElementById('lang-en');
    const langFrBtn = document.getElementById('lang-fr');
    const aboutItem = document.getElementById('sidebar-about-item');
    const contactItem = document.getElementById('sidebar-contact-item');

    const openSidebar = () => { if (sidebar) { sidebar.classList.add('active'); } if (overlay) { overlay.classList.add('active'); } };

    const closeSidebar = () => { if (sidebar) { sidebar.classList.remove('active'); } if (overlay) { overlay.classList.remove('active'); } };

    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    if (uploadItem) {
        uploadItem.addEventListener('click', () => {
            showView('upload-view');
            closeSidebar();
        });
    }

    if (aboutItem) {
        aboutItem.addEventListener('click', () => {
            showView('about-view');
            closeSidebar();
        });
    }

    if (contactItem) {
        contactItem.addEventListener('click', () => {
            showView('contact-view');
            closeSidebar();
        });
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                showNotification('Dark mode enabled', 'success');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                showNotification('Light mode enabled', 'success');
            }
        });
    }

    if (langEnBtn && langFrBtn) {
        console.log("Found language buttons, attempting to attach listeners.");
        langEnBtn.addEventListener("click", () => {
            switchLanguage("en");
            console.log("EN button clicked");
        });
        langFrBtn.addEventListener("click", () => {
            switchLanguage("fr");
            console.log("FR button clicked");
        });
        console.log("Language button event listeners attached.");
    }
}

function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = true;
        }
    }
}



// Update Statistics in Statistics View
function updateStatistics() {
    console.log('Updating statistics...');
    
    if (inventoryData.length === 0) {
        // Set default values when no data
        updateStatElement('total-products', '0');
        updateStatElement('total-value', '0 MAD');
        updateStatElement('low-stock-items', '0');
        updateStatElement('top-product', 'N/A');
        updateStatElement('total-categories', '0');
        updateStatElement('average-price', '0 MAD');
        
        // Clear charts
        clearAllCharts();
        hideSkeletons();
        return;
    }

    // Calculate basic statistics
    const totalProducts = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const categories = [...new Set(inventoryData.map(item => item.category))].length;
    const lowStockItems = inventoryData.filter(item => item.stock < 10).length;
    const averagePrice = inventoryData.reduce((sum, item) => sum + item.price, 0) / inventoryData.length;
    
    // Find top product by value
    const topProduct = inventoryData.reduce((max, item) => {
        const itemValue = item.price * item.stock;
        const maxValue = max.price * max.stock;
        return itemValue > maxValue ? item : max;
    }, inventoryData[0]);

    // Update UI
    updateStatElement('total-products', totalProducts.toLocaleString());
    updateStatElement('total-value', `${totalValue.toLocaleString()} MAD`);
    updateStatElement('low-stock-items', lowStockItems.toString());
    updateStatElement('top-product', topProduct ? topProduct.name : 'N/A');
    updateStatElement('total-categories', categories.toString());
    updateStatElement('average-price', `${averagePrice.toFixed(2)} MAD`);
    
    // Render charts
    renderCategoryChart();
    renderStockChart();
    renderValueChart();
    renderSupplierChart();
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Chart variables to store chart instances
let categoryChart = null;
let stockChart = null;
let valueChart = null;
let supplierChart = null;

// Chart color schemes
const chartColors = {
    primary: ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'],
    secondary: ['#E0E7FF', '#EDE9FE', '#FCE7F3', '#FEE2E2', '#FEF3C7', '#D1FAE5', '#CFFAFE', '#E9D5FF']
};

// Clear all charts
function clearAllCharts() {
    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }
    if (stockChart) {
        stockChart.destroy();
        stockChart = null;
    }
    if (valueChart) {
        valueChart.destroy();
        valueChart = null;
    }
    if (supplierChart) {
        supplierChart.destroy();
        supplierChart = null;
    }
}

// Render Category Distribution Chart
function renderCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx || inventoryData.length === 0) return;

    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }

    // Calculate category distribution
    const categoryData = {};
    inventoryData.forEach(item => {
        categoryData[item.category] = (categoryData[item.category] || 0) + 1;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors.primary.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render Stock Level Chart
function renderStockChart() {
    const ctx = document.getElementById('stock-chart');
    if (!ctx || inventoryData.length === 0) return;

    // Destroy existing chart
    if (stockChart) {
        stockChart.destroy();
    }

    // Calculate stock level distribution
    const stockLevels = {
        'Out of Stock': inventoryData.filter(item => item.stock === 0).length,
        'Low Stock (1-9)': inventoryData.filter(item => item.stock > 0 && item.stock < 10).length,
        'Medium Stock (10-49)': inventoryData.filter(item => item.stock >= 10 && item.stock < 50).length,
        'High Stock (50+)': inventoryData.filter(item => item.stock >= 50).length
    };

    const labels = Object.keys(stockLevels);
    const data = Object.values(stockLevels);

    stockChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Products',
                data: data,
                backgroundColor: chartColors.primary.slice(0, 4),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                            return `${context.parsed.y} products (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render Value Distribution Chart
function renderValueChart() {
    const ctx = document.getElementById('value-chart');
    if (!ctx || inventoryData.length === 0) return;

    // Destroy existing chart
    if (valueChart) {
        valueChart.destroy();
    }

    // Calculate value by category
    const categoryValues = {};
    inventoryData.forEach(item => {
        const value = item.price * item.stock;
        categoryValues[item.category] = (categoryValues[item.category] || 0) + value;
    });

    // Sort by value and take top 8
    const sortedCategories = Object.entries(categoryValues)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);

    const labels = sortedCategories.map(([category]) => category);
    const data = sortedCategories.map(([, value]) => value);

    valueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Value (MAD)',
                data: data,
                borderColor: chartColors.primary[0],
                backgroundColor: chartColors.secondary[0],
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.primary[0],
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toLocaleString()} MAD`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' MAD';
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

// Render Supplier Distribution Chart
function renderSupplierChart() {
    const ctx = document.getElementById('supplier-chart');
    if (!ctx || inventoryData.length === 0) return;

    // Destroy existing chart
    if (supplierChart) {
        supplierChart.destroy();
    }

    // Calculate supplier distribution
    const supplierData = {};
    inventoryData.forEach(item => {
        supplierData[item.supplier] = (supplierData[item.supplier] || 0) + 1;
    });

    // Sort by count and take top 6
    const sortedSuppliers = Object.entries(supplierData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6);

    const labels = sortedSuppliers.map(([supplier]) => 
        supplier.length > 15 ? supplier.substring(0, 15) + '...' : supplier
    );
    const data = sortedSuppliers.map(([, count]) => count);

    supplierChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors.primary.slice(0, labels.length).map(color => color + '80'),
                borderColor: chartColors.primary.slice(0, labels.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} products (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Enhanced debounce function with dynamic delay based on dataset size
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

// Dynamic debounce delay based on dataset size
function getDynamicDebounceDelay() {
    if (inventoryData.length > 10000) return 500;  // Large datasets need more delay
    if (inventoryData.length > 5000) return 400;   // Medium datasets
    return 300;  // Small datasets
}

const debouncedSearch = debounce(() => performInventorySearch(), getDynamicDebounceDelay());

function initializeInventorySearchListeners() {
    console.log('Setting up inventory search listeners...');
    const inventorySearchInput = document.getElementById('inventory-search');
    const inventorySearchBtn = document.getElementById('inventory-search-btn');
    const inventoryBarcodeBtn = document.getElementById('inventory-barcode-btn');
    const categoryFilter = document.getElementById('category-filter');
    const stockFilter = document.getElementById('stock-filter');
    const stockRangeInputs = document.getElementById('stock-range-inputs');
    const stockMin = document.getElementById('stock-min');
    const stockMax = document.getElementById('stock-max');
    const priceFilterToggle = document.getElementById('price-filter-toggle');
    const priceRangeInputs = document.getElementById('price-range-inputs');
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');

    if (inventorySearchInput) {
        inventorySearchInput.addEventListener('input', () => {
            // Update debounce delay dynamically based on current dataset size
            const dynamicDebouncedSearch = debounce(() => performInventorySearch(), getDynamicDebounceDelay());
            dynamicDebouncedSearch();
        });
    }
    if (inventorySearchBtn) {
        inventorySearchBtn.addEventListener('click', performInventorySearch);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', performInventorySearch);
    }
    if (stockFilter) {
        stockFilter.addEventListener('change', (e) => {
            if (e.target.value === 'custom-range') {
                stockRangeInputs.style.display = 'flex';
            } else {
                stockRangeInputs.style.display = 'none';
            }
            performInventorySearch();
        });
    }
    if (stockMin) {
        stockMin.addEventListener('input', () => {
            const dynamicDebouncedSearch = debounce(() => performInventorySearch(), getDynamicDebounceDelay());
            dynamicDebouncedSearch();
        });
    }
    if (stockMax) {
        stockMax.addEventListener('input', () => {
            const dynamicDebouncedSearch = debounce(() => performInventorySearch(), getDynamicDebounceDelay());
            dynamicDebouncedSearch();
        });
    }
    if (priceFilterToggle) {
        priceFilterToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                priceRangeInputs.style.display = 'flex';
            } else {
                priceRangeInputs.style.display = 'none';
            }
            performInventorySearch();
        });
    }
    if (priceMin) {
        priceMin.addEventListener('input', () => {
            const dynamicDebouncedSearch = debounce(() => performInventorySearch(), getDynamicDebounceDelay());
            dynamicDebouncedSearch();
        });
    }
    if (priceMax) {
        priceMax.addEventListener('input', () => {
            const dynamicDebouncedSearch = debounce(() => performInventorySearch(), getDynamicDebounceDelay());
            dynamicDebouncedSearch();
        });
    }
    if(inventoryBarcodeBtn) {
        inventoryBarcodeBtn.addEventListener('click', () => openBarcodeScanner({ type: 'input', id: 'inventory-search' }));
    }
}

function initializeOtherSearchListeners() {
    const priceSearchBtn = document.getElementById('price-search-btn');
    const supplierSearchBtn = document.getElementById('supplier-search-btn');
    const priceSearchInput = document.getElementById('price-search');
    const supplierSearchInput = document.getElementById('supplier-search');
    const priceBarcodeBtn = document.getElementById('price-barcode-btn');
    const supplierBarcodeBtn = document.getElementById('supplier-barcode-btn');

    if (priceSearchBtn) {
        priceSearchBtn.addEventListener('click', () => {
            const query = priceSearchInput.value.trim().toLowerCase();
            if (!query) return;
            // Price Check: only search in "Code_Caisse" (item.id)
            const result = inventoryData.find(item => String(item.id).toLowerCase() === query);
            displayPriceResult(result);
        });
    }

    if (supplierSearchBtn) {
        supplierSearchBtn.addEventListener('click', () => {
            const query = supplierSearchInput.value.trim().toLowerCase();
            if (!query) return;
            // Supplier: search in "Code_Caisse" (item.id) and "Description_Article" (item.name)
            const result = inventoryData.find(item =>
                String(item.id).toLowerCase() === query ||
                item.name.toLowerCase().includes(query)
            );
            displaySupplierResult(result);
        });
    }

    if (priceBarcodeBtn) {
        priceBarcodeBtn.addEventListener('click', () => openBarcodeScanner({ type: 'input', id: 'price-search' }));
    }

    if (supplierBarcodeBtn) {
        supplierBarcodeBtn.addEventListener('click', () => openBarcodeScanner({ type: 'input', id: 'supplier-search' }));
    }
}

function initializeStocktakingListeners() {
    console.log('Setting up stocktaking listeners...');

    // Stocktaking modal close
    const closeStocktaking = document.getElementById('close-stocktaking');
    if (closeStocktaking) {
        closeStocktaking.addEventListener('click', closeStocktakingModal);
    }

    // Menu button
    const menuBtn = document.getElementById('stocktaking-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleStocktakingMenu);
    }

    // Menu items
    const renameBtn = document.getElementById('rename-season-btn');
    const newSeasonBtn = document.getElementById('start-new-season-btn');
    const archiveBtn = document.getElementById('view-archive-btn');
    const deleteBtn = document.getElementById('delete-season-btn');

    if (renameBtn) {
        renameBtn.addEventListener('click', renameSeason);
    }
    if (newSeasonBtn) {
        newSeasonBtn.addEventListener('click', startNewSeason);
    }
    if (archiveBtn) {
        archiveBtn.addEventListener('click', openArchiveModal);
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteSeason);
    }

    // Scan buttons
    const startScanBtn = document.getElementById('start-scan-btn');
    const manualEntryBtn = document.getElementById('manual-entry-btn');

    if (startScanBtn) {
        startScanBtn.addEventListener('click', () => openBarcodeScanner({ type: 'stocktaking' }));
    }
    if (manualEntryBtn) {
        manualEntryBtn.addEventListener('click', openManualEntry);
    }

    // Export buttons
    const exportBtn = document.getElementById('export-season-btn');
    const exportExcelBtn = document.getElementById('export-season-excel-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => shareSeasonData(currentSeason));
    }
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => exportSeasonToExcel(currentSeason));
    }
}

function initializePricingLabelsListeners() {
    console.log('Setting up pricing labels listeners...');

    // Pricing Labels modal close
    const closePricingLabels = document.getElementById('close-pricing-labels');
    if (closePricingLabels) {
        closePricingLabels.addEventListener('click', closePricingLabelsModal);
    }

    // Menu button - THIS WAS THE MISSING PART
    const menuBtn = document.getElementById('pricing-labels-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', togglePricingLabelsMenu);
    }

    // Scan buttons
    const startScanBtn = document.getElementById('start-labels-scan-btn');
    const manualEntryBtn = document.getElementById('manual-label-entry-btn');

    if (startScanBtn) {
        startScanBtn.addEventListener('click', () => openBarcodeScanner({ type: 'pricing-labels' }));
    }
    if (manualEntryBtn) {
        manualEntryBtn.addEventListener('click', openPricingLabelManualEntry);
    }

    // Export buttons
    const shareBtn = document.getElementById('share-labels-btn');
    const exportExcelBtn = document.getElementById('export-labels-excel-btn');

    if (shareBtn) {
        shareBtn.addEventListener('click', () => sharePricingLabels(currentLabelsSession));
    }
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => exportLabelsToExcel(currentLabelsSession));
    }
}

function initializeScannerListeners() {
    console.log('Setting up scanner listeners...');

    const closeScanner = document.getElementById('close-scanner');
    const galleryBtn = document.getElementById('gallery-btn');
    const flashlightBtn = document.getElementById('flashlight-btn');
    const galleryInput = document.getElementById('gallery-input');

    if (closeScanner) {
        closeScanner.addEventListener('click', closeBarcodeScanner);
    }

    if (galleryBtn && galleryInput) {
        galleryBtn.addEventListener('click', () => galleryInput.click());
        galleryInput.addEventListener('change', handleGalleryImage);
    }

    if (flashlightBtn) {
        flashlightBtn.addEventListener('click', toggleFlashlight);
    }
}

function initializeUploadListeners() {
    console.log('Setting up upload listeners...');

    const dropArea = document.getElementById('drop-area');
    const browseBtn = document.getElementById('browse-btn');
    const fileInput = document.getElementById('excel-upload');

    if (dropArea) {
        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('drop', handleDrop);
        dropArea.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('dragover'));
    }

    if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
    }
}

function handleDashboardCardClick(event) {
    const cardId = event.currentTarget.id;
    console.log('Dashboard card clicked:', cardId);

    switch (cardId) {
        case 'inventory-card':
            showView('inventory-view');
            break;
        case 'price-check-card':
            showView('price-check-view');
            break;
        case 'supplier-card':
            showView('supplier-view');
            break;
        case 'stocktaking-card':
            openStocktakingModal();
            break;
        case 'pricing-labels-card':
            openPricingLabelsModal();
            break;
        case 'statistic-card':
            showView('statistic-view');
            break;
        default:
            console.log('Unknown card clicked:', cardId);
    }
}

function showView(viewId) {
    console.log('Showing view:', viewId);

    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    // Show target view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update statistics when showing relevant views
    if (viewId === 'statistic-view') {
        updateStatistics();
    }

    // Show/hide back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        if (viewId === 'dashboard-view') {
            backBtn.style.display = 'none';
        } else {
            backBtn.style.display = 'flex';
        }
    }

    // Add to browser history for proper back button handling
    if (viewId !== 'dashboard-view') {
        // Push state for non-dashboard views
        const state = { view: viewId };
        const title = getViewTitle(viewId);
        const url = `#${viewId}`;
        
        // Only push state if it's different from current state
        if (!history.state || history.state.view !== viewId) {
            history.pushState(state, title, url);
        }
    } else {
        // For dashboard, replace state to ensure clean navigation
        const state = { view: 'dashboard-view' };
        history.replaceState(state, 'Dashboard', '#dashboard');
    }
}

function getViewTitle(viewId) {
    const titles = {
        'dashboard-view': 'Dashboard',
        'inventory-view': 'Inventory Search',
        'price-check-view': 'Price Check',
        'supplier-view': 'Supplier Search',
        'statistic-view': 'Statistics',
        'upload-view': 'Upload Data',
        'about-view': 'About',
        'contact-view': 'Contact'
    };
    return titles[viewId] || 'Stockify Soufian';
}

function populateCategoryFilter() {
    console.log('Populating category filter...');

    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    // Get unique categories
    const categories = [...new Set(inventoryData.map(item => item.category))].sort();

    // Clear existing options (except "All Categories")
    categoryFilter.innerHTML = '<option value="">All Categories</option>';

    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function performInventorySearch() {
    console.log('Performing inventory search...');

    if (!searchWorker) {
        console.error('Search worker not available');
        return;
    }

    const query = document.getElementById('inventory-search')?.value.trim().toLowerCase() || '';
    const category = document.getElementById('category-filter')?.value || '';
    const stockFilter = document.getElementById('stock-filter')?.value || '';
    const stockMin = document.getElementById('stock-min')?.value || '';
    const stockMax = document.getElementById('stock-max')?.value || '';
    const priceFilterEnabled = document.getElementById('price-filter-toggle')?.checked || false;
    const priceMin = document.getElementById('price-min')?.value || '';
    const priceMax = document.getElementById('price-max')?.value || '';

    if (!query && !category && !stockFilter && !priceFilterEnabled) {
        // Clear results if no search criteria
        const resultsContainer = document.getElementById('inventory-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        return;
    }

    // Send search request to worker
    if (inventoryData.length > 0) {
        searchWorker.postMessage({
            action: 'search',
            query: query,
            category: category,
            stockFilter: stockFilter,
            stockMin: stockMin ? parseInt(stockMin) : null,
            stockMax: stockMax ? parseInt(stockMax) : null,
            priceFilterEnabled: priceFilterEnabled,
            priceMin: priceMin ? parseFloat(priceMin) : null,
            priceMax: priceMax ? parseFloat(priceMax) : null
        });
    }
}

function displayInventoryResults(results, totalFound, isLimited) {
    console.log('Displaying inventory results:', results.length, 'Total found:', totalFound, 'Limited:', isLimited);

    const resultsContainer = document.getElementById('inventory-results');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="result-item">
                <p>${translate('no-products-found')}</p>
            </div>
        `;
        return;
    }

    // Create status message for large result sets
    let statusMessage = '';
    if (isLimited) {
        statusMessage = `
            <div class="search-status" style="background: var(--warning-bg, #fff3cd); color: var(--warning-text, #856404); padding: 0.75rem; margin-bottom: 1rem; border-radius: 4px; border: 1px solid var(--warning-border, #ffeaa7);">
                <i class="fas fa-info-circle"></i>
                Showing first ${results.length} results. Refine your search for more specific results.
            </div>
        `;
    } else if (totalFound > 0) {
        statusMessage = `
            <div class="search-status" style="background: var(--success-bg, #d4edda); color: var(--success-text, #155724); padding: 0.75rem; margin-bottom: 1rem; border-radius: 4px; border: 1px solid var(--success-border, #c3e6cb);">
                <i class="fas fa-check-circle"></i>
                Found ${totalFound} product${totalFound === 1 ? '' : 's'}
            </div>
        `;
    }

    // Use DocumentFragment for better performance with large result sets
    const fragment = document.createDocumentFragment();
    
    if (statusMessage) {
        const statusDiv = document.createElement('div');
        statusDiv.innerHTML = statusMessage;
        fragment.appendChild(statusDiv.firstElementChild);
    }

    // Batch DOM updates for better performance
    const resultElements = results.map(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <h4>${escapeHtml(item.name)}</h4>
            <p><strong>${translate("subcode")}:</strong> ${escapeHtml(String(item.code_article || "N/A"))}</p>
            <p><strong>${translate("code")}:</strong> ${escapeHtml(String(item.id))}</p>
            <p><strong>${translate('category')}:</strong> ${escapeHtml(item.category)}</p>
            <p><strong>${translate('supplier')}:</strong> ${escapeHtml(item.supplier)}</p>
            <p><strong>${translate('stock')}:</strong> ${item.stock}</p>
            <div class="price">${item.price.toFixed(2)} MAD</div>

            <div class="ext-links" style="margin-top:8px;display:flex;justify-content:flex-end;">
                <a class="btn-bringo-icon" href="https://www.google.com/search?q=${encodeURIComponent(String(item.code_article)+' bringo')}" target="_blank" rel="noopener" title="Search on Bringo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                        <defs>
                            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stop-color="#007BFF"/>
                                <stop offset="1" stop-color="#0056b3"/>
                            </linearGradient>
                        </defs>
                        <circle cx="24" cy="24" r="22" fill="url(#bg)"/>
                        <text x="24" y="29" text-anchor="middle" font-size="18" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#ffffff" font-weight="800">B</text>
                    </svg>
                </a>
            </div>

        `;
        return div;
    });

    resultElements.forEach(element => fragment.appendChild(element));
    
    // Single DOM update
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(fragment);
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function displayPriceResult(item) {
    const resultContainer = document.getElementById('price-result');
    resultContainer.innerHTML = ''; // Clear previous results
    if (!item) {
        resultContainer.innerHTML = `<div class="result-item"><p>${translate('product-not-found')}</p></div>`;
    } else {
        resultContainer.innerHTML = `
            <div class="result-item">
                <h4>${item.name}</h4>
                <p><strong>${translate('code')}:</strong> ${item.id}</p>
                <div class="price">${item.price.toFixed(2)} MAD</div>

            <div class="ext-links" style="margin-top:8px;display:flex;justify-content:flex-end;">
                <a class="btn-bringo-icon" href="https://www.google.com/search?q=${encodeURIComponent(String(item.code_article)+' bringo')}" target="_blank" rel="noopener" title="Search on Bringo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                        <defs>
                            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stop-color="#007BFF"/>
                                <stop offset="1" stop-color="#0056b3"/>
                            </linearGradient>
                        </defs>
                        <circle cx="24" cy="24" r="22" fill="url(#bg)"/>
                        <text x="24" y="29" text-anchor="middle" font-size="18" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#ffffff" font-weight="800">B</text>
                    </svg>
                </a>
            </div>

            </div>
        `;
    }
}

function displaySupplierResult(item) {
    const resultContainer = document.getElementById("supplier-result");
    const suggestionsContainer = document.getElementById("supplier-suggestions");
    resultContainer.innerHTML = ""; // Clear previous results
    suggestionsContainer.innerHTML = ""; // Clear previous suggestions

    if (!item) {
        resultContainer.innerHTML = `<div class="result-item"><p>${translate('product-not-found')}</p></div>`;
        return;
    }

    // Display the found product/supplier info
    resultContainer.innerHTML = `
        <div class="result-item">
            <h4>${item.name}</h4>
            <p><strong>${translate('code')}:</strong> ${item.id}</p>
            <p><strong>${translate('supplier')}:</strong> ${item.supplier || "N/A"}</p>
        </div>
    `;

    // Find other products from the same supplier
    const supplierName = item.supplier;
    if (supplierName && supplierName !== "N/A" && supplierName !== "Unknown Supplier") {
        const suggestedProducts = inventoryData.filter(product =>
            product.supplier === supplierName && product.id !== item.id
        );

        if (suggestedProducts.length > 0) {
            suggestionsContainer.innerHTML = `
                <div class="section-header">
                    <h3>Other Products from ${supplierName}</h3>
                </div>
                <div class="suggestions-list">
                    ${suggestedProducts.slice(0, 10).map(product => `
                        <div class="suggestion-item">
                            <p><strong>${product.name}</strong></p>
                            <p>${translate('code')}: ${product.id}</p>
                        </div>
                    `).join("")}
                </div>
            `;
        } else {
            suggestionsContainer.innerHTML = `
                <div class="section-header">
                    <h3>Other Products from ${supplierName}</h3>
                </div>
                <div class="suggestions-list">
                    <p>No other products found from this supplier.</p>
                </div>
            `;
        }
    }
}

// Stocktaking Functions
function openStocktakingModal() {
    console.log('Opening stocktaking modal...');
    const modal = document.getElementById('stocktaking-modal');
    if (modal) {
        modal.classList.add('active');
        updateStocktakingDisplay();
        
        // Add history state for modal
        const state = { view: 'dashboard-view', modal: 'stocktaking-modal' };
        history.pushState(state, 'Digital Stocktaking', '#stocktaking');
    }
}

function closeStocktakingModal() {
    console.log('Closing stocktaking modal...');
    const modal = document.getElementById('stocktaking-modal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Close any open menus
    const menu = document.getElementById('stocktaking-menu');
    if (menu) {
        menu.classList.remove('active');
    }
}

function toggleStocktakingMenu() {
    console.log('Toggling stocktaking menu...');
    const menu = document.getElementById('stocktaking-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function setupPricingLabelsMenuListeners() {
    console.log('Setting up pricing labels menu listeners...');
    const renameBtn = document.getElementById('rename-labels-session-btn');
    const newSessionBtn = document.getElementById('start-new-labels-session-btn');
    const archiveBtn = document.getElementById('view-labels-archive-btn');
    const deleteBtn = document.getElementById('delete-labels-session-btn');

    if (renameBtn) {
        renameBtn.addEventListener('click', renameLabelsSession);
    }
    if (newSessionBtn) {
        newSessionBtn.addEventListener('click', startNewLabelsSession);
    }
    if (archiveBtn) {
        archiveBtn.addEventListener('click', openLabelsArchiveModal);
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteLabelsSession);
    }
}

function togglePricingLabelsMenu() {
    console.log('Toggling pricing labels menu...');
    const menu = document.getElementById('pricing-labels-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function renameSeason() {
    console.log('Renaming season...');
    showCustomModal('Rename Season', 'Enter new season name', currentSeason.name, handleSeasonRename);
}

function startNewSeason() {
    console.log('Starting new season...');
    
    if (currentSeason.items.length > 0) {
        showConfirmationModal(
            'Start New Season',
            'Starting a new season will archive the current one. Continue?',
            'warning',
            handleStartNewSeason
        );
    } else {
        showCustomModal('New Season', 'Enter new season name', 'New Season', handleNewSeason);
    }
}

function handleStartNewSeason() {
    console.log('Handling start new season...');
    
    archiveCurrentSeason();
    showCustomModal('New Season', 'Enter new season name', 'New Season', handleNewSeason);
}

function deleteSeason() {
    console.log('Deleting season...');
    
    showConfirmationModal(
        'Delete Season',
        'Are you sure you want to delete the current season? This action cannot be undone.',
        'danger',
        handleDeleteSeason
    );
}

function handleDeleteSeason() {
    console.log('Handling delete season...');
    
    currentSeason = {
        name: 'New Season',
        date: new Date().toISOString().split('T')[0],
        items: []
    };
    saveSeasonData();
    updateStocktakingDisplay();
    showNotification('Season deleted!', 'info');
}

function renameLabelsSession() {
    console.log('Renaming labels session...');
    showCustomModal('Rename Session', 'Enter new session name', currentLabelsSession.name, handleLabelsSessionRename);
}

function startNewLabelsSession() {
    console.log('Starting new labels session...');
    
    if (currentLabelsSession.items.length > 0) {
        showConfirmationModal(
            'Start New Session',
            'Starting a new session will archive the current one. Continue?',
            'warning',
            handleStartNewLabelsSession
        );
    } else {
        showCustomModal('New Session', 'Enter new session name', 'New Labels Session', handleNewLabelsSession);
    }
}

function handleStartNewLabelsSession() {
    console.log('Handling start new labels session...');
    
    archiveCurrentLabelsSession();
    showCustomModal('New Session', 'Enter new session name', 'New Labels Session', handleNewLabelsSession);
}

function deleteLabelsSession() {
    console.log('Deleting labels session...');
    
    showConfirmationModal(
        'Delete Session',
        'Are you sure you want to delete the current session? This action cannot be undone.',
        'danger',
        handleDeleteLabelsSession
    );
}

function handleDeleteLabelsSession() {
    console.log('Handling delete labels session...');
    
    currentLabelsSession = {
        name: 'New Labels Session',
        date: new Date().toISOString().split('T')[0],
        items: []
    };
    saveLabelsSessionData();
    updatePricingLabelsDisplay();
    showNotification('Session deleted!', 'info');
}

function archiveCurrentSeason() {
    console.log('Archiving current season...');
    
    if (currentSeason.items.length > 0) {
        const archivedSeason = {
            ...currentSeason,
            archivedDate: new Date().toISOString()
        };

        seasonArchive.push(archivedSeason);
        saveArchiveData();

        console.log('Season archived:', archivedSeason);
    }
}

function archiveCurrentLabelsSession() {
    console.log('Archiving current labels session...');
    
    if (currentLabelsSession.items.length > 0) {
        const archivedSession = {
            ...currentLabelsSession,
            archivedDate: new Date().toISOString()
        };

        labelsSessionArchive.push(archivedSession);
        saveLabelsArchiveData();

        console.log('Labels session archived:', archivedSession);
    }
}

function openArchiveModal() {
    console.log('Opening archive modal...');

    // Create modal if it doesn't exist
    let modal = document.getElementById('archive-modal');
    if (!modal) {
        modal = createArchiveModal();
    }

    updateArchiveDisplay();
    modal.classList.add('active');
}

function createArchiveModal() {
    console.log('Creating archive modal...');

    const modal = document.createElement('div');
    modal.id = 'archive-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>Season Archive</h3>
                <button id="close-archive-modal" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="archive-list" class="archive-list">
                    </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Set up event listeners
    const closeBtn = modal.querySelector('#close-archive-modal');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    return modal;
}

function updateArchiveDisplay() {
    console.log('Updating archive display...');

    const archiveList = document.getElementById('archive-list');
    if (!archiveList) return;

    if (seasonArchive.length === 0) {
        archiveList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-archive" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No archived seasons yet</p>
            </div>
        `;
    } else {
        archiveList.innerHTML = seasonArchive.map((season, index) => `
            <div class="archive-item" style="background: var(--surface); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${season.name}</h4>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                            ${new Date(season.date).toLocaleDateString()} • ${season.items.length} items
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="viewArchivedSeason(${index})" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="editArchivedSeason(${index})" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="shareSeasonData(seasonArchive[${index}])" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                        <button onclick="deleteArchivedSeason(${index})" class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function openLabelsArchiveModal() {
    console.log('Opening labels archive modal...');

    // Create modal if it doesn't exist
    let modal = document.getElementById('labels-archive-modal');
    if (!modal) {
        modal = createLabelsArchiveModal();
    }

    updateLabelsArchiveDisplay();
    modal.classList.add('active');
}

function createLabelsArchiveModal() {
    console.log('Creating labels archive modal...');

    const modal = document.createElement('div');
    modal.id = 'labels-archive-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>Labels Session Archive</h3>
                <button id="close-labels-archive-modal" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="labels-archive-list" class="archive-list">
                    </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Set up event listeners
    const closeBtn = modal.querySelector('#close-labels-archive-modal');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    return modal;
}

function updateLabelsArchiveDisplay() {
    console.log('Updating labels archive display...');

    const archiveList = document.getElementById('labels-archive-list');
    if (!archiveList) return;

    if (labelsSessionArchive.length === 0) {
        archiveList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-archive" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No archived sessions yet</p>
            </div>
        `;
    } else {
        archiveList.innerHTML = labelsSessionArchive.map((session, index) => `
            <div class="archive-item" style="background: var(--surface); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${session.name}</h4>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                            ${new Date(session.date).toLocaleDateString()} • ${session.items.length} items
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="viewArchivedLabelsSession(${index})" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="editArchivedLabelsSession(${index})" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="sharePricingLabels(labelsSessionArchive[${index}])" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                        <button onclick="deleteArchivedLabelsSession(${index})" class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateStocktakingDisplay() {
    console.log('Updating stocktaking display...');

    // Update season name displays
    const seasonDisplayName = document.getElementById('season-display-name');
    const seasonNameDisplay = document.getElementById('season-name-display');

    if (seasonDisplayName) seasonDisplayName.textContent = currentSeason.name;
    if (seasonNameDisplay) seasonNameDisplay.textContent = currentSeason.name;

    // Update season date
    const seasonDate = document.getElementById('season-date');
    if (seasonDate) {
        const date = new Date(currentSeason.date);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        seasonDate.textContent = isToday ? 'Started today' : `Started ${date.toLocaleDateString()}`;
    }

    // Update stats
    const itemsCount = document.getElementById('items-count');
    const totalQuantity = document.getElementById('total-quantity');

    if (itemsCount) itemsCount.textContent = currentSeason.items.length;
    if (totalQuantity) {
        const total = currentSeason.items.reduce((sum, item) => sum + item.quantity, 0);
        totalQuantity.textContent = total;
    }

    // Update session list
    updateSessionList();
}

function updateSessionList() {
    const listEl = document.getElementById('session-list');
    if (!listEl) return;

    if (currentSeason.items.length === 0) {
        listEl.innerHTML = `
            <div class="empty-session">
                <i class="fas fa-clipboard-list"></i>
                <p>${translate('no-items-scanned')}</p>
            </div>
        `;
    } else {
        listEl.innerHTML = currentSeason.items.map((item, index) => `
            <div class="session-item">
                <div class="session-item-info">
                    <div class="session-item-barcode">${item.barcode}</div>
                    <div class="session-item-details">Added ${new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <div class="session-item-quantity">${item.quantity}</div>
                <div class="session-item-actions">
                    <button class="session-item-btn edit" onclick="editSessionItem(${index})" title="${translate('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="session-item-btn delete" onclick="deleteSessionItem(${index})" title="${translate('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function editSessionItem(index) {
    console.log('Editing session item:', index);

    const item = currentSeason.items[index];
    if (!item) return;

    currentEditIndex = index;
    showCustomModal('Edit Quantity', 'Enter new quantity', item.quantity.toString(), handleQuantityEdit);
}

function deleteSessionItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        currentSeason.items.splice(index, 1);
        saveSeasonData();
        updateStocktakingDisplay();
        showNotification('Item removed from session.', 'info');
    }
}

// Pricing Labels Functions
function openPricingLabelsModal() {
    console.log("Opening Pricing Labels modal...");
    const modal = document.getElementById("pricing-labels-modal");
    if (modal) {
        modal.classList.add("active");
        updatePricingLabelsDisplay();
        setupPricingLabelsMenuListeners(); // Re-attach listeners to ensure they are active
        
        // Add history state for modal
        const state = { view: 'dashboard-view', modal: 'pricing-labels-modal' };
        history.pushState(state, 'Pricing Labels', '#pricing-labels');
    }
}

function closePricingLabelsModal() {
    console.log('Closing Pricing Labels modal...');
    const modal = document.getElementById('pricing-labels-modal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Close any open menus
    const menu = document.getElementById('pricing-labels-menu');
    if (menu) {
        menu.classList.remove('active');
    }
}

function updatePricingLabelsDisplay() {
    console.log('Updating pricing labels display...');
    updatePricingLabelsList();
}

function updatePricingLabelsList() {
    const listEl = document.getElementById('pricing-labels-list');
    const countEl = document.getElementById('labels-count');

    if (!listEl || !countEl) return;

    countEl.textContent = currentLabelsSession.items.length;

    if (currentLabelsSession.items.length === 0) {
        listEl.innerHTML = `
            <div class="empty-session">
                <i class="fas fa-print"></i>
                <p>${translate('no-barcodes-scanned')}</p>
            </div>
        `;
    } else {
        listEl.innerHTML = currentLabelsSession.items.map((code, index) => `
            <div class="session-item">
                <div class="session-item-info">
                    <div class="session-item-barcode" onclick="editPricingLabelItem(${index})" style="cursor: pointer;">${code}</div>
                </div>
                <div class="session-item-quantity"></div>
                <div class="session-item-actions">
                    <button class="session-item-btn edit" onclick="editPricingLabelItem(${index})" title="${translate('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="session-item-btn delete" onclick="deletePricingLabelItem(${index})" title="${translate('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function editPricingLabelItem(index) {
    console.log('Editing pricing label item:', index);

    const item = currentLabelsSession.items[index];
    if (!item) return;

    currentEditIndex = index;
    showCustomModal('Edit Barcode', 'Enter new barcode', item, handleBarcodeEdit);
}

function deletePricingLabelItem(index) {
    if (confirm('Are you sure you want to delete this barcode?')) {
        currentLabelsSession.items.splice(index, 1);
        saveLabelsSessionData();
        updatePricingLabelsList();
        showNotification('Barcode removed.', 'info');
    }
}

function openPricingLabelManualEntry() {
    const modal = document.getElementById("custom-manual-entry-modal");
    const input = document.getElementById("manual-barcode-input");
    const okBtn = document.getElementById("manual-entry-ok-btn");
    const cancelBtn = document.getElementById("manual-entry-cancel-btn");

    if (modal && input && okBtn && cancelBtn) {
        input.value = ''; // Clear previous input
        modal.classList.add("active");
        setTimeout(() => input.focus(), 100);

        // Remove old listeners to prevent duplicates
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        input.onkeypress = null;

        okBtn.onclick = () => {
            const barcode = input.value.trim();
            if (barcode && isValidBarcode(barcode)) {
                currentLabelsSession.items.push(barcode);
                saveLabelsSessionData();
                updatePricingLabelsList();
                showNotification('Barcode added manually.', 'success');
                modal.classList.remove("active");
            } else if (barcode) {
                showNotification('Invalid barcode format.', 'error');
            } else {
                showNotification('Please enter a barcode.', 'error');
            }
        };

        cancelBtn.onclick = () => {
            modal.classList.remove("active");
        };

        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                okBtn.click(); // Simulate click on OK button
            }
        };
    }
}

// Barcode Scanner Functions
function openBarcodeScanner(context) {
    console.log('Opening barcode scanner with context:', context);
    
    scannerContext = context;
    const modal = document.getElementById('scanner-modal');
    if (modal) {
        modal.classList.add('active');
        startCamera();
        
        // Add history state for scanner modal
        const currentState = history.state || {};
        const state = { 
            ...currentState, 
            scanner: true,
            scannerContext: context
        };
        history.pushState(state, 'Barcode Scanner', '#scanner');
    }
}

function closeBarcodeScanner() {
    console.log('Closing barcode scanner...');
    
    const modal = document.getElementById('scanner-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Explicitly turn off flashlight / torch if active
    if (scannerStream) {
        try {
            const track = scannerStream.getVideoTracks()[0];
            if (track) {
                track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
            }
        } catch (e) {}
    }

    stopCamera();
    scannerContext = null;
}

function startCamera() {
    console.log('Starting camera...');
    
    if (scannerActive) return;
    
    const video = document.getElementById('scanner-video');
    const statusElement = document.getElementById('scanner-status');
    
    if (!video) return;
    
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
    })
    .then(stream => {
        scannerStream = stream;
        video.srcObject = stream;
        video.play();
        scannerActive = true;
        
        if (statusElement) {
            statusElement.textContent = 'Position the barcode within the frame';
        }
        
        // Initialize barcode reader with robust multi-format and hints
        if (typeof ZXing !== 'undefined') {
            try {
                // Configure hints for better recognition of EAN, UPC, Code128, QR etc.
                const hints = new Map();
                const formats = [
                    ZXing.BarcodeFormat.EAN_13,
                    ZXing.BarcodeFormat.EAN_8,
                    ZXing.BarcodeFormat.CODE_128,
                    ZXing.BarcodeFormat.CODE_39,
                    ZXing.BarcodeFormat.UPC_A,
                    ZXing.BarcodeFormat.UPC_E,
                    ZXing.BarcodeFormat.QR_CODE
                ];
                hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
                hints.set(ZXing.DecodeHintType.TRY_HARDER, true);

                zxingCodeReader = new ZXing.BrowserMultiFormatReader(hints);
                
                // Add debounce/throttle to prevent rapid multi-firing on the same barcode
                let lastScannedCode = null;
                let lastScanTime = 0;

                zxingCodeReader.decodeFromVideoDevice(null, video, (result, err) => {
                    if (result) {
                        const code = result.text ? result.text.trim() : '';
                        const now = Date.now();
                        if (code && (code !== lastScannedCode || (now - lastScanTime > 2000))) {
                            lastScannedCode = code;
                            lastScanTime = now;
                            console.log('Barcode detected:', code);
                            handleBarcodeResult(code);
                        }
                    }
                    if (err && !(err instanceof ZXing.NotFoundException)) {
                        // Suppress verbose frame decode errors
                    }
                });
            } catch (e) {
                console.error('Failed to initialize ZXing reader:', e);
                // Fallback to basic reader without hints
                zxingCodeReader = new ZXing.BrowserMultiFormatReader();
                zxingCodeReader.decodeFromVideoDevice(null, video, (result, err) => {
                    if (result) {
                        handleBarcodeResult(result.text);
                    }
                });
            }
        }
    })
    .catch(err => {
        console.error('Camera access error:', err);
        if (statusElement) {
            statusElement.textContent = 'Camera access denied or not available';
        }
        showNotification('Camera access denied or not available', 'error');
    });
}

function stopCamera() {
    console.log('Stopping camera...');
    
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerStream = null;
    }
    
    if (zxingCodeReader) {
        zxingCodeReader.reset();
        zxingCodeReader = null;
    }
    
    scannerActive = false;
}

function handleBarcodeResult(barcode) {
    console.log('Handling barcode result:', barcode, 'Context:', scannerContext);
    
    if (!scannerContext) return;
    
    // Play beep sound
    playBeepSound();
    
    // Ensure camera and flashlight are always closed upon receiving a result for input or stocktaking
    if (scannerContext.type === 'input') {
        // Fill input field
        const input = document.getElementById(scannerContext.id);
        if (input) {
            input.value = barcode;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            // Also trigger change/click search if search button exists
            if (scannerContext.id === 'price-search') {
                const btn = document.getElementById('price-search-btn');
                if (btn) btn.click();
            } else if (scannerContext.id === 'supplier-search') {
                const btn = document.getElementById('supplier-search-btn');
                if (btn) btn.click();
            } else if (scannerContext.id === 'inventory-search') {
                const btn = document.getElementById('inventory-search-btn');
                if (btn) btn.click();
            }
        }
        closeBarcodeScanner();
        showNotification('Barcode scanned successfully!', 'success');
        
    } else if (scannerContext.type === 'stocktaking') {
        
        // Add to stocktaking session with duplicate check
        const exists = currentSeason.items && currentSeason.items.some(item => item.barcode === barcode);
        closeBarcodeScanner();
        if (exists) {
            openDuplicateScanModal(barcode);
        } else {
            openQuantityModal(barcode);
        }
    
        
    } else if (scannerContext.type === 'pricing-labels') {
        // Add to pricing labels session
        if (isValidBarcode(barcode)) {
            currentLabelsSession.items.push(barcode);
            saveLabelsSessionData();
            updatePricingLabelsList();
            showNotification('Barcode added to labels session!', 'success');
        } else {
            showNotification('Invalid barcode format', 'error');
        }
        // Don't close scanner for continuous scanning
    }
}

function playBeepSound() {
    try {
        const audio = new Audio('./assets/barcode-scan-beep.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Could not play beep sound:', e));
    } catch (e) {
        console.log('Could not play beep sound:', e);
    }
}

function isValidBarcode(barcode) {
    // Basic barcode validation - adjust as needed
    return barcode && barcode.trim().length >= 4 && /^[0-9A-Za-z\-_]+$/.test(barcode.trim());
}

function openQuantityModal(barcode) {
    console.log('Opening quantity modal for barcode:', barcode);
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('quantity-modal');
    if (!modal) {
        modal = createQuantityModal();
    }
    
    // Update modal content
    const barcodeDisplay = document.getElementById('quantity-barcode-display');
    const quantityInput = document.getElementById('quantity-input');
    
    if (barcodeDisplay) barcodeDisplay.textContent = barcode;
    if (quantityInput) {
        quantityInput.value = '1';
        quantityInput.focus();
    }
    
    modal.classList.add('active');
}

function createQuantityModal() {
    console.log('Creating quantity modal...');
    
    const modal = document.createElement('div');
    modal.id = 'quantity-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Enter Quantity</h3>
                <button id="close-quantity-modal" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Barcode:</label>
                    <p id="quantity-barcode-display" style="font-weight: bold; color: var(--primary);"></p>
                </div>
                <div class="form-group">
                    <label for="quantity-input">Quantity:</label>
                    <input type="number" id="quantity-input" min="1" value="1">
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-quantity-btn" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
                <button id="confirm-quantity-btn" class="btn btn-primary">
                    <i class="fas fa-check"></i>
                    Add
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set up event listeners
    const closeBtn = modal.querySelector('#close-quantity-modal');
    const cancelBtn = modal.querySelector('#cancel-quantity-btn');
    const confirmBtn = modal.querySelector('#confirm-quantity-btn');
    const input = modal.querySelector('#quantity-input');
    
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
    if (cancelBtn) cancelBtn.onclick = () => modal.classList.remove('active');
    if (confirmBtn) confirmBtn.onclick = confirmQuantity;
    if (input) {
        input.onkeypress = (e) => {
            if (e.key === 'Enter') confirmQuantity();
        };
    }
    
    return modal;
}

function confirmQuantity() {
    console.log('Confirming quantity...');
    
    const barcodeDisplay = document.getElementById('quantity-barcode-display');
    const quantityInput = document.getElementById('quantity-input');
    const modal = document.getElementById('quantity-modal');
    
    if (barcodeDisplay && quantityInput) {
        const barcode = barcodeDisplay.textContent;
        const quantity = parseInt(quantityInput.value) || 1;
        
        if (quantity > 0) {
            addItemToSession(barcode, quantity);
            
            if (modal) {
                modal.classList.remove('active');
            }
            
            showNotification('Item added to session!', 'success');
        } else {
            showNotification('Please enter a valid quantity', 'error');
        }
    }
}

function addItemToSession(barcode, quantity) {
    console.log('Adding item to session:', barcode, quantity);
    
    // Check if item already exists
    const existingIndex = currentSeason.items.findIndex(item => item.barcode === barcode);
    
    if (existingIndex >= 0) {
        // Item exists, add to existing quantity
        currentSeason.items[existingIndex].quantity += quantity;
        currentSeason.items[existingIndex].timestamp = new Date().toISOString();
    } else {
        // New item, add it
        currentSeason.items.push({
            barcode: barcode,
            quantity: quantity,
            timestamp: new Date().toISOString()
        });
    }
    
    saveSeasonData();
    updateStocktakingDisplay();
}

function openManualEntry() {
    const modal = document.getElementById("custom-manual-entry-modal");
    const input = document.getElementById("manual-barcode-input");
    const okBtn = document.getElementById("manual-entry-ok-btn");
    const cancelBtn = document.getElementById("manual-entry-cancel-btn");

    if (modal && input && okBtn && cancelBtn) {
        input.value = ''; // Clear previous input
        modal.classList.add("active");
        setTimeout(() => input.focus(), 100);

        // Remove old listeners to prevent duplicates
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        input.onkeypress = null;

        okBtn.onclick = () => {
            const barcode = input.value.trim();
            if (barcode && isValidBarcode(barcode)) {
                modal.classList.remove("active");
                openQuantityModal(barcode);
            } else if (barcode) {
                showNotification('Invalid barcode format.', 'error');
            } else {
                showNotification('Please enter a barcode.', 'error');
            }
        };

        cancelBtn.onclick = () => {
            modal.classList.remove("active");
        };

        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                okBtn.click(); // Simulate click on OK button
            }
        };
    }
}

function handleGalleryImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('Processing gallery image...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Create canvas to process image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Try to decode barcode from image
            if (typeof ZXing !== 'undefined') {
                const codeReader = new ZXing.BrowserMultiFormatReader();
                codeReader.decodeFromCanvas(canvas)
                    .then(result => {
                        console.log('Barcode found in image:', result.text);
                        handleBarcodeResult(result.text);
                    })
                    .catch(err => {
                        console.error('No barcode found in image:', err);
                        showNotification('No barcode found in the selected image', 'error');
                    });
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function toggleFlashlight() {
    console.log('Toggling flashlight...');
    
    const flashlightBtn = document.getElementById('flashlight-btn');
    
    if (scannerStream) {
        const track = scannerStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if (capabilities.torch) {
            const settings = track.getSettings();
            const newTorchState = !settings.torch;
            
            track.applyConstraints({
                advanced: [{ torch: newTorchState }]
            }).then(() => {
                if (flashlightBtn) {
                    flashlightBtn.classList.toggle('active', newTorchState);
                }
                showNotification(`Flashlight ${newTorchState ? 'on' : 'off'}`, 'info');
            }).catch(err => {
                console.error('Flashlight error:', err);
                showNotification('Flashlight not available', 'error');
            });
        } else {
            showNotification('Flashlight not supported on this device', 'error');
        }
    }
}

// Export Functions
async function shareSeasonData(season) {
    console.log('Sharing season data:', season.name);

    if (season.items.length === 0) {
        showNotification('No items to export/share', 'warning');
        return;
    }

    try {
        // Prepare data for Excel
        const ws_data = [['Barcode', 'Quantity']]; // Header row
        season.items.forEach(item => {
            ws_data.push([item.barcode, item.quantity]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stocktaking");

        // Generate file name with current date
        const today = new Date();
        const dateString = today.getFullYear() + '-' +
                           String(today.getMonth() + 1).padStart(2, '0') + '-' +
                           String(today.getDate()).padStart(2, '0');
        const fileName = `stocktaking_${season.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateString}.xlsx`;

        // Convert workbook to a Blob for sharing
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const excelFile = new File([excelBlob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Check Web Share API availability and capabilities
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [excelFile] })) {
            try {
                await navigator.share({
                    files: [excelFile],
                    title: 'Stocktaking Export',
                    text: `Exported stocktaking data from ${season.name}`
                });
                showNotification('Excel file shared successfully!', 'success');
            } catch (shareError) {
                console.log('File sharing failed:', shareError);
                showNotification('Share cancelled or failed. Downloading file instead.', 'info');
                XLSX.writeFile(wb, fileName); // Fallback to download
            }
        } else {
            console.log('Web Share API for files not available, or cannot share this file type. Downloading instead.');
            showNotification('Share not supported or failed. Downloading file instead.', 'info');
            XLSX.writeFile(wb, fileName); // Fallback to download
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error creating export file', 'error');
    }
}

async function sharePricingLabels(session) {
    console.log('Sharing pricing labels:', session.name);

    if (session.items.length === 0) {
        showNotification('No barcodes to export/share', 'warning');
        return;
    }

    try {
        // Prepare data for Excel
        const ws_data = [['Barcode']]; // Header row
        session.items.forEach(barcode => {
            ws_data.push([barcode]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pricing Labels");

        // Generate file name with current date
        const today = new Date();
        const dateString = today.getFullYear() + '-' +
                           String(today.getMonth() + 1).padStart(2, '0') + '-' +
                           String(today.getDate()).padStart(2, '0');
        const fileName = `pricing_labels_${session.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateString}.xlsx`;

        // Convert workbook to a Blob for sharing
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const excelFile = new File([excelBlob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Check Web Share API availability and capabilities
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [excelFile] })) {
            try {
                await navigator.share({
                    files: [excelFile],
                    title: 'Pricing Labels Export',
                    text: `Exported pricing labels from ${session.name}`
                });
                showNotification('Excel file shared successfully!', 'success');
            } catch (shareError) {
                console.log('File sharing failed:', shareError);
                showNotification('Share cancelled or failed. Downloading file instead.', 'info');
                XLSX.writeFile(wb, fileName); // Fallback to download
            }
        } else {
            console.log('Web Share API for files not available, or cannot share this file type. Downloading instead.');
            showNotification('Share not supported or failed. Downloading file instead.', 'info');
            XLSX.writeFile(wb, fileName); // Fallback to download
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error creating export file', 'error');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type);

    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Set icon based on type
    let iconClass = 'fas fa-info-circle';
    switch (type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            break;
    }

    notification.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;

    container.appendChild(notification);

    // Add a class to trigger the entrance animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show'); // Trigger exit animation
        notification.classList.add('hide'); // Add hide class for exit animation
        notification.addEventListener('transitionend', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, { once: true }); // Ensure the event listener is removed after it fires once
    }, 3000);
}

// Data Management Functions
function loadInventoryData() {
    console.log('Loading inventory data...');

    try {
        const data = localStorage.getItem('inventoryData');
        if (data) {
            inventoryData = JSON.parse(data);
            populateCategoryFilter();
            
            // Load data into worker with performance optimization
            if (searchWorker) {
                console.log('Loading', inventoryData.length, 'items into search worker...');
                searchWorker.postMessage({ action: 'loadData', data: inventoryData });
                
                // Show loading notification for large datasets
                if (inventoryData.length > 5000) {
                    showNotification(`Loading ${inventoryData.length} products... Search optimization in progress.`, 'info', 0); // Display indefinitely
                }
            }
            
            // Post a message to the worker to indicate data loading is complete
            if (searchWorker) {
                searchWorker.postMessage({ action: 'dataLoadComplete' });
            }

            // Listen for dataLoadComplete from worker to hide notification
            searchWorker.onmessage = function(e) {
                if (e.data.status === 'dataLoadComplete') {
                    hideNotification(); // Hide the loading notification
                    console.log('Search worker data loading complete and ready.');
                }
                // Existing search results handling
                if (e.data.status === 'searchComplete') {
                    if (e.data.results && e.data.results.length > 0) {
                        displayInventoryResults(e.data.results);
                    } else {
                        displayNoProductsFound();
                    }
                    hideNotification();
                }
            };
            
            console.log('Inventory data loaded:', inventoryData.length, 'items');
        }
    } catch (error) {
        console.error('Error loading inventory data:', error);
        inventoryData = [];
        showNotification('Error loading inventory data', 'error');
    }
}

function saveInventoryData() {
    console.log('Saving inventory data...');

    try {
        localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
        console.log('Inventory data saved');
    } catch (error) {
        console.error('Error saving inventory data:', error);
    }
}

function loadSeasonData() {
    console.log('Loading season data...');

    try {
        const data = localStorage.getItem('currentSeason');
        if (data) {
            currentSeason = JSON.parse(data);
            console.log('Season data loaded:', currentSeason.name);
        }
    } catch (error) {
        console.error('Error loading season data:', error);
        currentSeason = {
            name: 'New Season',
            date: new Date().toISOString().split('T')[0],
            items: []
        };
    }

    // Load archive
    try {
        const archiveData = localStorage.getItem('seasonArchive');
        if (archiveData) {
            seasonArchive = JSON.parse(archiveData);
            console.log('Archive data loaded:', seasonArchive.length, 'sessions');
        }
    } catch (error) {
        console.error('Error loading archive data:', error);
        seasonArchive = [];
    }
}

function saveSeasonData() {
    console.log('Saving season data...');

    try {
        localStorage.setItem('currentSeason', JSON.stringify(currentSeason));
        console.log('Season data saved');
    }  catch (error) {
        console.error('Error saving season data:', error);
    }
}

function saveArchiveData() {
    console.log('Saving archive data...');

    try {
        localStorage.setItem('seasonArchive', JSON.stringify(seasonArchive));
        console.log('Archive data saved');
    } catch (error) {
        console.error('Error saving archive data:', error);
    }
}

function loadLabelsSessionData() {
    console.log('Loading labels session data...');

    try {
        const data = localStorage.getItem('currentLabelsSession');
        if (data) {
            currentLabelsSession = JSON.parse(data);
            console.log('Labels session data loaded:', currentLabelsSession.name);
        }
    } catch (error) {
        console.error('Error loading labels session data:', error);
        currentLabelsSession = {
            name: 'New Labels Session',
            date: new Date().toISOString().split('T')[0],
            items: []
        };
    }

    // Load archive
    try {
        const archiveData = localStorage.getItem('labelsSessionArchive');
        if (archiveData) {
            labelsSessionArchive = JSON.parse(archiveData);
            console.log('Labels archive data loaded:', labelsSessionArchive.length, 'sessions');
        }
    } catch (error) {
        console.error('Error loading labels archive data:', error);
        labelsSessionArchive = [];
    }
}

function saveLabelsSessionData() {
    console.log('Saving labels session data...');

    try {
        localStorage.setItem('currentLabelsSession', JSON.stringify(currentLabelsSession));
        console.log('Labels session data saved');
    } catch (error) {
        console.error('Error saving labels session data:', error);
    }
}

function saveLabelsArchiveData() {
    console.log('Saving labels archive data...');

    try {
        localStorage.setItem('labelsSessionArchive', JSON.stringify(labelsSessionArchive));
        console.log('Labels archive data saved');
    } catch (error) {
        console.error('Error saving labels archive data:', error);
    }
}

// Upload Functions
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function normalizeInventoryData(rawData) {
    return rawData.map(row => {
        return {
            id: String(row["Code_Caisse"] || row["code_caisse"] || ""),
            code_article: String(row["Code_Article"] || row["code_article"] || row["CODE_ARTICLE"] || row["Code Article"] || row["code article"] || ""),
            // Debugging: Log the raw row and extracted code_article
            // console.log("Raw row:", row, "Extracted Code_Article:", String(row["Code_Article"] || row["code_article"] || row["CODE_ARTICLE"] || row["Code Article"] || row["code article"] || ""));
            name: String(row["Description_Article"] || row["description_article"] || "Unknown Product"),
            category: String(row['Ray'] || row['ray'] || 'Uncategorized'),
            supplier: String(row['Supplier'] || row['supplier'] || row['LIB_FOURNISSEUR'] || row['Lib Fournisseur'] || row['lib_fournisseur'] || 'Unknown Supplier'),
            stock: Number(row['Stock_en_Qte'] || row['stock_en_qte'] || 0),
            price: Number(row['Prix_vente'] || row['prix_vente'] || 0)
        };
    });
}

function handleFile(file) {
    console.log('Handling file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showNotification('Please select an Excel file (.xlsx or .xls)', 'error');
        return;
    }

    // Check file size and warn for very large files
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 50) {
        showNotification('File is very large. Processing may take some time.', 'warning');
    }

    // Show loading screen for file processing
    showLoadingScreen();
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.textContent = `Processing ${fileSizeMB.toFixed(1)}MB Excel file...`;
    }

    const status = document.getElementById('upload-status');
    if (status) {
        status.className = 'upload-status loading';
        status.style.display = 'block';
        status.textContent = 'Processing file...';
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            
            // Update loading message
            if (loadingMessage) {
                loadingMessage.textContent = 'Parsing Excel data...';
            }
            
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON with progress indication
            if (loadingMessage) {
                loadingMessage.textContent = 'Converting data to searchable format...';
            }
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error('No data found in the Excel file');
            }

            // Process and save data with progress indication
            if (loadingMessage) {
                loadingMessage.textContent = 'Optimizing data for search performance...';
            }
            
            inventoryData = normalizeInventoryData(jsonData);
            saveInventoryData();
            populateCategoryFilter();
            
            // Load data into worker with performance notification
            if (searchWorker) {
                console.log('Loading', inventoryData.length, 'items into search worker...');
                searchWorker.postMessage({ action: 'loadData', data: inventoryData });
                
                if (loadingMessage) {
                    loadingMessage.textContent = 'Building search index for optimal performance...';
                }
            }

            if (status) {
                status.className = 'upload-status success';
                status.textContent = `Successfully loaded ${inventoryData.length} products`;
            }

            const performanceMessage = inventoryData.length > 5000 ? 
                ` Search performance optimized for ${inventoryData.length} products!` : 
                '';
            
            showNotification(`${inventoryData.length} products loaded successfully!${performanceMessage}`, 'success');

            // Hide loading screen
            setTimeout(() => {
                hideLoadingScreen();
            }, 1500); // Slightly longer for large files

        } catch (error) {
            console.error('File processing error:', error);

            if (status) {
                status.className = 'upload-status error';
                status.textContent = 'Error processing file: ' + error.message;
            }

            showNotification('Error processing file: ' + error.message, 'error');
            
            // Hide loading screen
            setTimeout(() => {
                hideLoadingScreen();
            }, 1000);
        }
    };

    reader.readAsArrayBuffer(file);
}

// Global functions for archive management (called from dynamically generated HTML)
window.viewArchivedSeason = function(index) {
    console.log('Viewing archived season:', index);
    
    const season = seasonArchive[index];
    if (!season) return;

    // Create view modal if it doesn't exist
    let modal = document.getElementById('view-season-modal');
    if (!modal) {
        modal = createViewSeasonModal();
    }

    // Populate modal with season data
    const modalTitle = modal.querySelector('.modal-title');
    const modalContent = modal.querySelector('.view-season-content');
    
    if (modalTitle) modalTitle.textContent = `View Season: ${season.name}`;
    
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="season-info-view">
                <div class="info-row">
                    <span class="info-label">Season Name:</span>
                    <span class="info-value">${season.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date Created:</span>
                    <span class="info-value">${new Date(season.date).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Items:</span>
                    <span class="info-value">${season.items.length}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Quantity:</span>
                    <span class="info-value">${season.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
            </div>
            <div class="items-list-view">
                <h4>Scanned Items:</h4>
                ${season.items.length === 0 ? 
                    '<p class="no-items">No items in this season</p>' :
                    season.items.map(item => `
                        <div class="view-item">
                            <div class="view-item-barcode">${item.barcode}</div>
                            <div class="view-item-details">
                                <span>Quantity: ${item.quantity}</span>
                                <span>Added: ${new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }

    modal.classList.add('active');
};

window.editArchivedSeason = function(index) {
    console.log('Editing archived season:', index);
    
    const season = seasonArchive[index];
    if (!season) return;

    // Create edit modal if it doesn't exist
    let modal = document.getElementById('edit-season-modal');
    if (!modal) {
        modal = createEditSeasonModal();
    }

    // Store current editing index
    modal.dataset.editIndex = index;

    // Populate modal with season data
    const modalTitle = modal.querySelector('.modal-title');
    const seasonNameInput = modal.querySelector('#edit-season-name');
    const itemsList = modal.querySelector('.edit-items-list');
    
    if (modalTitle) modalTitle.textContent = `Edit Season: ${season.name}`;
    if (seasonNameInput) seasonNameInput.value = season.name;
    
    if (itemsList) {
        itemsList.innerHTML = season.items.length === 0 ? 
            '<p class="no-items">No items in this season</p>' :
            season.items.map((item, itemIndex) => `
                <div class="edit-item" data-item-index="${itemIndex}">
                    <div class="edit-item-barcode">${item.barcode}</div>
                    <div class="edit-item-quantity">
                        <label>Quantity:</label>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                    </div>
                    <div class="edit-item-actions">
                        <button class="btn btn-danger btn-sm" onclick="removeItemFromEdit(${itemIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
    }

    modal.classList.add('active');
};

window.deleteArchivedSeason = function(index) {
    console.log('Deleting archived season:', index);
    
    const season = seasonArchive[index];
    if (!season) return;

    if (confirm(`Are you sure you want to delete "${season.name}"? This action cannot be undone.`)) {
        seasonArchive.splice(index, 1);
        saveArchiveData();
        updateArchiveDisplay();
        showNotification('Archived season deleted!', 'success');
    }
};

window.viewArchivedLabelsSession = function(index) {
    console.log('Viewing archived labels session:', index);
    
    const session = labelsSessionArchive[index];
    if (!session) return;

    // Create view modal if it doesn't exist
    let modal = document.getElementById('view-labels-session-modal');
    if (!modal) {
        modal = createViewLabelsSessionModal();
    }

    // Populate modal with session data
    const modalTitle = modal.querySelector('.modal-title');
    const modalContent = modal.querySelector('.view-labels-session-content');
    
    if (modalTitle) modalTitle.textContent = `View Labels Session: ${session.name}`;
    
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="session-info-view">
                <div class="info-row">
                    <span class="info-label">Session Name:</span>
                    <span class="info-value">${session.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date Created:</span>
                    <span class="info-value">${new Date(session.date).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Items:</span>
                    <span class="info-value">${session.items.length}</span>
                </div>
            </div>
            <div class="items-list-view">
                <h4>Scanned Barcodes:</h4>
                ${session.items.length === 0 ? 
                    '<p class="no-items">No barcodes in this session</p>' :
                    session.items.map(item => `
                        <div class="view-item">
                            <div class="view-item-barcode">${item.barcode}</div>
                            <div class="view-item-details">
                                <span>Added: ${new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }

    modal.classList.add('active');
};

window.editArchivedLabelsSession = function(index) {
    console.log('Editing archived labels session:', index);
    
    const session = labelsSessionArchive[index];
    if (!session) return;

    // Create edit modal if it doesn't exist
    let modal = document.getElementById('edit-labels-session-modal');
    if (!modal) {
        modal = createEditLabelsSessionModal();
    }

    // Store current editing index
    modal.dataset.editIndex = index;

    // Populate modal with session data
    const modalTitle = modal.querySelector('.modal-title');
    const sessionNameInput = modal.querySelector('#edit-labels-session-name');
    const itemsList = modal.querySelector('.edit-labels-items-list');
    
    if (modalTitle) modalTitle.textContent = `Edit Labels Session: ${session.name}`;
    if (sessionNameInput) sessionNameInput.value = session.name;
    
    if (itemsList) {
        itemsList.innerHTML = session.items.length === 0 ? 
            '<p class="no-items">No barcodes in this session</p>' :
            session.items.map((item, itemIndex) => `
                <div class="edit-item" data-item-index="${itemIndex}">
                    <div class="edit-item-barcode">${item.barcode}</div>
                    <div class="edit-item-details">
                        <span>Added: ${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="edit-item-actions">
                        <button class="btn btn-danger btn-sm" onclick="removeLabelsItemFromEdit(${itemIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
    }

    modal.classList.add('active');
};

window.deleteArchivedLabelsSession = function(index) {
    console.log('Deleting archived labels session:', index);
    
    const session = labelsSessionArchive[index];
    if (!session) return;

    if (confirm(`Are you sure you want to delete "${session.name}"? This action cannot be undone.`)) {
        labelsSessionArchive.splice(index, 1);
        saveLabelsArchiveData();
        updateLabelsArchiveDisplay();
        showNotification('Archived session deleted!', 'success');
    }
};

console.log('Script loaded successfully');



async function exportSeasonToExcel(season) {
    console.log("Exporting season to Excel:", season.name);

    if (season.items.length === 0) {
        showNotification("No items to export", "warning");
        return;
    }

    try {
        const ws_data = [["Barcode", "Quantity"]];
        season.items.forEach(item => {
            ws_data.push([item.barcode, item.quantity]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stocktaking");

        const today = new Date();
        const dateString = today.getFullYear() + "-" +
                           String(today.getMonth() + 1).padStart(2, "0") + "-" +
                           String(today.getDate()).padStart(2, "0");
        const fileName = `${season.name.replace(/[^a-zA-Z0-9]/g, "_")}_${dateString}.xlsx`;

        XLSX.writeFile(wb, fileName);
        showNotification("Excel file exported successfully!", "success");

    } catch (error) {
        console.error("Export error:", error);
        showNotification("Error creating export file", "error");
    }
}




async function exportLabelsToExcel(session) {
    console.log("Exporting pricing labels to Excel:", session.name);

    if (session.items.length === 0) {
        showNotification("No barcodes to export", "warning");
        return;
    }

    try {
        const ws_data = [["Barcode"]];
        session.items.forEach(barcode => {
            ws_data.push([barcode]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pricing Labels");

        const today = new Date();
        const dateString = today.getFullYear() + "-" +
                           String(today.getMonth() + 1).padStart(2, "0") + "-" +
                           String(today.getDate()).padStart(2, "0");
        const fileName = `${session.name.replace(/[^a-zA-Z0-9]/g, "_")}_${dateString}.xlsx`;

        XLSX.writeFile(wb, fileName);
        showNotification("Excel file exported successfully!", "success");

    } catch (error) {
        console.error("Export error:", error);
        showNotification("Error creating export file", "error");
    }
}




// Modal creation functions for view and edit functionality

function createViewSeasonModal() {
    const modal = document.createElement('div');
    modal.id = 'view-season-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">View Season</h3>
                <button class="close-btn" onclick="document.getElementById('view-season-modal').classList.remove('active')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="view-season-content"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function createEditSeasonModal() {
    const modal = document.createElement('div');
    modal.id = 'edit-season-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3 class="modal-title">Edit Season</h3>
                <button class="close-btn" onclick="document.getElementById('edit-season-modal').classList.remove('active')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="edit-season-name">Season Name:</label>
                    <input type="text" id="edit-season-name" class="form-control">
                </div>
                <div class="edit-items-section">
                    <h4>Items in Season:</h4>
                    <div class="edit-items-list"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="document.getElementById('edit-season-modal').classList.remove('active')">Cancel</button>
                <button class="btn btn-primary" onclick="saveSeasonChanges()">Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function createViewLabelsSessionModal() {
    const modal = document.createElement('div');
    modal.id = 'view-labels-session-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">View Labels Session</h3>
                <button class="close-btn" onclick="document.getElementById('view-labels-session-modal').classList.remove('active')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="view-labels-session-content"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function createEditLabelsSessionModal() {
    const modal = document.createElement('div');
    modal.id = 'edit-labels-session-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3 class="modal-title">Edit Labels Session</h3>
                <button class="close-btn" onclick="document.getElementById('edit-labels-session-modal').classList.remove('active')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="edit-labels-session-name">Session Name:</label>
                    <input type="text" id="edit-labels-session-name" class="form-control">
                </div>
                <div class="edit-items-section">
                    <h4>Barcodes in Session:</h4>
                    <div class="edit-labels-items-list"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="document.getElementById('edit-labels-session-modal').classList.remove('active')">Cancel</button>
                <button class="btn btn-primary" onclick="saveLabelsSessionChanges()">Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Helper functions for editing

function removeItemFromEdit(itemIndex) {
    const modal = document.getElementById('edit-season-modal');
    const editIndex = parseInt(modal.dataset.editIndex);
    const season = seasonArchive[editIndex];
    
    if (season && season.items[itemIndex]) {
        season.items.splice(itemIndex, 1);
        // Refresh the items list
        window.editArchivedSeason(editIndex);
    }
}

function removeLabelsItemFromEdit(itemIndex) {
    const modal = document.getElementById('edit-labels-session-modal');
    const editIndex = parseInt(modal.dataset.editIndex);
    const session = labelsSessionArchive[editIndex];
    
    if (session && session.items[itemIndex]) {
        session.items.splice(itemIndex, 1);
        // Refresh the items list
        window.editArchivedLabelsSession(editIndex);
    }
}

function saveSeasonChanges() {
    const modal = document.getElementById('edit-season-modal');
    const editIndex = parseInt(modal.dataset.editIndex);
    const season = seasonArchive[editIndex];
    
    if (!season) return;
    
    // Update season name
    const nameInput = modal.querySelector('#edit-season-name');
    if (nameInput) {
        season.name = nameInput.value.trim() || season.name;
    }
    
    // Update quantities
    const quantityInputs = modal.querySelectorAll('.quantity-input');
    quantityInputs.forEach((input, index) => {
        if (season.items[index]) {
            const newQuantity = parseInt(input.value) || 1;
            season.items[index].quantity = Math.max(1, newQuantity);
        }
    });
    
    // Save to storage and update display
    saveArchiveData();
    updateArchiveDisplay();
    modal.classList.remove('active');
    showNotification('Season updated successfully!', 'success');
}

function saveLabelsSessionChanges() {
    const modal = document.getElementById('edit-labels-session-modal');
    const editIndex = parseInt(modal.dataset.editIndex);
    const session = labelsSessionArchive[editIndex];
    
    if (!session) return;
    
    // Update session name
    const nameInput = modal.querySelector('#edit-labels-session-name');
    if (nameInput) {
        session.name = nameInput.value.trim() || session.name;
    }
    
    // Save to storage and update display
    saveLabelsArchiveData();
    updateLabelsArchiveDisplay();
    modal.classList.remove('active');
    showNotification('Labels session updated successfully!', 'success');
}

// Make helper functions globally accessible
window.removeItemFromEdit = removeItemFromEdit;
window.removeLabelsItemFromEdit = removeLabelsItemFromEdit;
window.saveSeasonChanges = saveSeasonChanges;
window.saveLabelsSessionChanges = saveLabelsSessionChanges;


// Handle browser back/forward button events
function handlePopState(event) {
    console.log('Handling popstate event:', event.state);
    
    if (event.state) {
        // Check if we're dealing with a scanner state
        if (event.state.scanner) {
            // Close the scanner modal
            const scannerModal = document.getElementById('scanner-modal');
            if (scannerModal && scannerModal.classList.contains('active')) {
                closeBarcodeScanner();
            }
            
            // Don't change the underlying view/modal, just close the scanner
            return;
        }
        
        // Check if we're dealing with a modal state
        if (event.state.modal) {
            // Close the specific modal
            const modalId = event.state.modal;
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                
                // Close scanner if it was open
                if (scannerActive) {
                    closeBarcodeScanner();
                }
            }
            
            // Show the underlying view
            const viewId = event.state.view || 'dashboard-view';
            showViewWithoutHistory(viewId);
            
        } else if (event.state.view) {
            // Navigate to the view stored in history state
            const viewId = event.state.view;
            showViewWithoutHistory(viewId);
            
            // Close any open modals
            closeAllModals();
        }
        
        console.log('Navigated via popstate:', event.state);
    } else {
        // Fallback to dashboard if no state
        showViewWithoutHistory('dashboard-view');
        closeAllModals();
    }
}

// Helper function to show view without adding to history (used by popstate)
function showViewWithoutHistory(viewId) {
    console.log('Showing view without history:', viewId);

    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    // Show target view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update statistics when showing relevant views
    if (viewId === 'statistic-view') {
        updateStatistics();
    }

    // Show/hide back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        if (viewId === 'dashboard-view') {
            backBtn.style.display = 'none';
        } else {
            backBtn.style.display = 'flex';
        }
    }
}

// Helper function to close all open modals
function closeAllModals() {
    // Close scanner modal
    const scannerModal = document.getElementById('scanner-modal');
    if (scannerModal && scannerModal.classList.contains('active')) {
        closeBarcodeScanner();
    }
    
    // Close stocktaking modal
    const stocktakingModal = document.getElementById('stocktaking-modal');
    if (stocktakingModal && stocktakingModal.classList.contains('active')) {
        stocktakingModal.classList.remove('active');
    }
    
    // Close pricing labels modal
    const pricingLabelsModal = document.getElementById('pricing-labels-modal');
    if (pricingLabelsModal && pricingLabelsModal.classList.contains('active')) {
        pricingLabelsModal.classList.remove('active');
    }
    
    // Close any other modals
    const allModals = document.querySelectorAll('.modal, .modal-view, .custom-modal');
    allModals.forEach(modal => {
        modal.classList.remove('active');
    });
    
    // Close sidebar
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Prevent app from closing when back button is pressed on dashboard
function preventAppClose() {
    // Add an extra history entry when on dashboard to prevent app closure
    if (history.state && history.state.view === 'dashboard-view') {
        // Check if we're at the beginning of history
        if (history.length <= 1) {
            // Add a dummy history entry to prevent app closure
            history.pushState({ view: 'dashboard-view', preventClose: true }, 'Dashboard', '#dashboard');
        }
    }
}

// Call this when the app loads to set up initial history
function initializeHistoryManagement() {
    // Ensure we have at least one history entry
    if (history.length <= 1) {
        history.replaceState({ view: 'dashboard-view' }, 'Dashboard', '#dashboard');
        // Add an extra entry to prevent immediate app closure
        history.pushState({ view: 'dashboard-view', preventClose: true }, 'Dashboard', '#dashboard');
        // Go back to the main entry
        history.back();
    }
}


// Authentication Functions
function initializeAuthentication() {
    // Check if user is already authenticated and remembered
    if (checkRememberedAuth()) {
        isAuthenticated = true;
        hideAuthModal();
        return;
    }
    
    setupAuthenticationEventListeners();
    showAuthModal();
}

function checkRememberedAuth() {
    const rememberedAuth = localStorage.getItem('stockify_remembered_auth');
    const authExpiry = localStorage.getItem('stockify_auth_expiry');
    
    if (rememberedAuth && authExpiry) {
        const currentTime = new Date().getTime();
        const expiryTime = parseInt(authExpiry);
        
        // Check if authentication hasn't expired (30 days)
        if (currentTime < expiryTime) {
            return true;
        } else {
            // Clear expired authentication
            clearRememberedAuth();
        }
    }
    
    return false;
}

function saveRememberedAuth() {
    const rememberCheckbox = document.getElementById('remember-me-checkbox');
    
    if (rememberCheckbox && rememberCheckbox.checked) {
        const currentTime = new Date().getTime();
        const expiryTime = currentTime + (30 * 24 * 60 * 60 * 1000); // 30 days
        
        localStorage.setItem('stockify_remembered_auth', 'true');
        localStorage.setItem('stockify_auth_expiry', expiryTime.toString());
    }
}

function clearRememberedAuth() {
    localStorage.removeItem('stockify_remembered_auth');
    localStorage.removeItem('stockify_auth_expiry');
}

function setupAuthenticationEventListeners() {
    // Key input field
    const keyInput = document.getElementById('key-input');
    const submitBtn = document.getElementById('key-submit-btn');
    const rememberCheckbox = document.getElementById('remember-me-checkbox');
    
    if (keyInput) {
        keyInput.addEventListener('input', () => {
            enteredKey = keyInput.value.trim();
            triggerHapticFeedback('light');
        });
        
        keyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyKey();
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', verifyKey);
    }
    
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', () => {
            triggerHapticFeedback('light');
        });
    }
}

function verifyKey() {
    if (!enteredKey) {
        showAuthError(translate('key-incorrect'));
        setTimeout(clearAuthError, 3000);
        return;
    }
    
    if (validKeys.includes(enteredKey.toLowerCase())) {
        // Successful authentication
        isAuthenticated = true;
        authAttempts = 0;
        
        // Save remembered authentication if checkbox is checked
        saveRememberedAuth();
        
        // Haptic feedback for success
        triggerHapticFeedback('success');
        
        showNotification(translate('key-successful'), 'success');
        hideAuthModal();
    } else {
        // Failed authentication
        authAttempts++;
        enteredKey = '';
        
        // Clear input field
        const keyInput = document.getElementById('key-input');
        if (keyInput) {
            keyInput.value = '';
        }
        
        // Haptic feedback for error
        triggerHapticFeedback('error');
        
        if (authAttempts >= maxAuthAttempts) {
            showAuthError(translate('too-many-attempts'));
            // Lock for 30 seconds
            setTimeout(() => {
                authAttempts = 0;
                clearAuthError();
            }, 30000);
        } else {
            showAuthError(translate('key-incorrect'));
            setTimeout(clearAuthError, 3000);
        }
    }
}

function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('hidden');
    }
}

function hideAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('hidden');
    }
}

function showAuthError(message) {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('shake');
        
        setTimeout(() => {
            errorElement.classList.remove('shake');
        }, 500);
    }
}

function clearAuthError() {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('shake');
    }
}

// Haptic Feedback Functions
function triggerHapticFeedback(type = 'light') {
    if ('vibrate' in navigator) {
        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate(50);
                break;
            case 'success':
                navigator.vibrate([10, 50, 10]);
                break;
            case 'error':
                navigator.vibrate([50, 50, 50]);
                break;
            case 'scan':
                navigator.vibrate([20, 10, 20]);
                break;
            default:
                navigator.vibrate(10);
        }
    }
}

// Enhanced initialization to include authentication
function initializeAppWithAuth() {
    // Load language preference first
    loadLanguagePreference();
    
    // Initialize authentication
    initializeAuthentication();
    
    // Only proceed with normal app initialization if authenticated
    if (isAuthenticated) {
        initializeApp();
    }
    
    // Set up authentication check for protected actions
    setupProtectedActions();
}

function setupProtectedActions() {
    // Add authentication check to sensitive operations
    const protectedElements = [
        '#sidebar-upload-item',
        '#statistic-card',
        '#stocktaking-card',
        '#pricing-labels-card'
    ];
    
    protectedElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener('click', (e) => {
                if (!isAuthenticated) {
                    e.preventDefault();
                    e.stopPropagation();
                    showAuthModal();
                }
            });
        }
    });
}

// Override the original DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app with authentication
    initializeAppWithAuth();
    
    // Hide loading screen after a delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 2000);
});


// Enhanced Color Coding Functions
function getStockLevel(stock) {
    const stockNum = parseInt(stock) || 0;
    
    if (stockNum === 0) return 'out';
    if (stockNum <= 5) return 'critical';
    if (stockNum <= 15) return 'low';
    if (stockNum <= 50) return 'medium';
    if (stockNum <= 100) return 'good';
    return 'excellent';
}

function getStockLevelText(level) {
    const texts = {
        'excellent': translate('stock-excellent') || 'Excellent',
        'good': translate('stock-good') || 'Good',
        'medium': translate('stock-medium') || 'Medium',
        'low': translate('stock-low') || 'Low',
        'critical': translate('stock-critical') || 'Critical',
        'out': translate('stock-out') || 'Out of Stock'
    };
    return texts[level] || level;
}

function getStockIcon(level) {
    const icons = {
        'excellent': 'fas fa-check-circle',
        'good': 'fas fa-thumbs-up',
        'medium': 'fas fa-exclamation-circle',
        'low': 'fas fa-exclamation-triangle',
        'critical': 'fas fa-times-circle',
        'out': 'fas fa-ban'
    };
    return icons[level] || 'fas fa-question-circle';
}

function createStockIndicator(stock, showText = true) {
    const level = getStockLevel(stock);
    const text = getStockLevelText(level);
    const icon = getStockIcon(level);
    
    const indicator = document.createElement('span');
    indicator.className = `stock-indicator ${level}`;
    
    const iconElement = document.createElement('i');
    iconElement.className = icon;
    indicator.appendChild(iconElement);
    
    if (showText) {
        const textElement = document.createElement('span');
        textElement.textContent = text;
        indicator.appendChild(textElement);
    }
    
    return indicator;
}

function createStockIcon(stock) {
    const level = getStockLevel(stock);
    const icon = document.createElement('span');
    icon.className = `stock-icon ${level}`;
    icon.title = getStockLevelText(level);
    return icon;
}

function createStockProgressBar(stock, maxStock = 100) {
    const level = getStockLevel(stock);
    const percentage = Math.min((parseInt(stock) || 0) / maxStock * 100, 100);
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'stock-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = `stock-progress-bar ${level}`;
    progressBar.style.width = `${percentage}%`;
    
    progressContainer.appendChild(progressBar);
    return progressContainer;
}

function applyStockColorCoding(element, stock) {
    const level = getStockLevel(stock);
    
    // Remove existing stock level classes
    element.classList.remove('stock-excellent', 'stock-good', 'stock-medium', 'stock-low', 'stock-critical', 'stock-out');
    
    // Add new stock level class
    element.classList.add(`stock-${level}`);
    
    return level;
}

function enhanceInventoryResults() {
    const inventoryItems = document.querySelectorAll('.inventory-item, .product-card, .search-result-item');
    
    inventoryItems.forEach(item => {
        const stockElement = item.querySelector('.stock-value, .item-stock, [data-stock]');
        if (stockElement) {
            const stock = stockElement.textContent || stockElement.getAttribute('data-stock') || '0';
            const level = applyStockColorCoding(item, stock);
            
            // Add stock indicator if not already present
            if (!item.querySelector('.stock-indicator')) {
                const indicator = createStockIndicator(stock, false);
                const stockContainer = stockElement.parentElement;
                if (stockContainer) {
                    stockContainer.appendChild(indicator);
                }
            }
            
            // Add haptic feedback for critical stock items
            if (level === 'critical' || level === 'out') {
                item.addEventListener('click', () => {
                    triggerHapticFeedback('medium');
                });
            }
        }
    });
}

function enhanceStatisticsWithColorCoding() {
    const lowStockCard = document.querySelector('#low-stock-items');
    if (lowStockCard) {
        const parentCard = lowStockCard.closest('.stat-card');
        if (parentCard) {
            parentCard.classList.add('low-stock');
        }
    }
}

function updateInventoryDisplayWithColors(results) {
    const container = document.getElementById('inventory-results');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>${translate('no-products-found')}</p>
            </div>
        `;
        return;
    }
    
    results.forEach(product => {
        const level = getStockLevel(product.stock);
        const stockIndicator = createStockIndicator(product.stock);
        const stockIcon = createStockIcon(product.stock);
        
        const productElement = document.createElement('div');
        productElement.className = `inventory-item stock-${level}`;
        
        productElement.innerHTML = `
            <div class="item-header">
                <div class="item-title">
                    ${stockIcon.outerHTML}
                    <h3>${product.name || 'N/A'}</h3>
                </div>
                <div class="item-actions">
                    ${stockIndicator.outerHTML}
                </div>
            </div>
            <div class="item-details">
                <div class="item-detail">
                    <span class="detail-label">${translate('code')}:</span>
                    <span class="detail-value">${product.code || 'N/A'}</span>
                </div>
                <div class="item-detail">
                    <span class="detail-label">${translate('category')}:</span>
                    <span class="detail-value">${product.category || 'N/A'}</span>
                </div>
                <div class="item-detail">
                    <span class="detail-label">${translate('supplier')}:</span>
                    <span class="detail-value">${product.supplier || 'N/A'}</span>
                </div>
                <div class="item-detail">
                    <span class="detail-label">${translate('stock')}:</span>
                    <span class="detail-value item-stock" data-stock="${product.stock}">${product.stock || 0}</span>
                </div>
                <div class="item-detail">
                    <span class="detail-label">${translate('price')}:</span>
                    <span class="detail-value">${product.price || 0} MAD</span>
                </div>
            </div>
        `;
        
        // Add click event with haptic feedback
        productElement.addEventListener('click', () => {
            if (level === 'critical' || level === 'out') {
                triggerHapticFeedback('medium');
            } else {
                triggerHapticFeedback('light');
            }
        });
        
        container.appendChild(productElement);
    });
}

function updatePriceCheckWithColors(product) {
    const resultContainer = document.getElementById('price-result');
    if (!resultContainer || !product) return;
    
    const level = getStockLevel(product.stock);
    const stockIndicator = createStockIndicator(product.stock);
    const stockIcon = createStockIcon(product.stock);
    
    resultContainer.className = `result-popup active stock-${level}`;
    
    resultContainer.innerHTML = `
        <div class="result-header">
            <div class="result-title">
                ${stockIcon.outerHTML}
                <h3>${product.name || 'N/A'}</h3>
            </div>
            <div class="result-actions">
                ${stockIndicator.outerHTML}
            </div>
        </div>
        <div class="result-details">
            <div class="result-detail">
                <span class="detail-label">${translate('code')}:</span>
                <span class="detail-value">${product.code || 'N/A'}</span>
            </div>
            <div class="result-detail">
                <span class="detail-label">${translate('price')}:</span>
                <span class="detail-value price-highlight">${product.price || 0} MAD</span>
            </div>
            <div class="result-detail">
                <span class="detail-label">${translate('stock')}:</span>
                <span class="detail-value" data-stock="${product.stock}">${product.stock || 0}</span>
            </div>
            <div class="result-detail">
                <span class="detail-label">${translate('category')}:</span>
                <span class="detail-value">${product.category || 'N/A'}</span>
            </div>
        </div>
    `;
    
    // Trigger haptic feedback based on stock level
    if (level === 'critical' || level === 'out') {
        triggerHapticFeedback('error');
    } else if (level === 'low') {
        triggerHapticFeedback('medium');
    } else {
        triggerHapticFeedback('success');
    }
}

function updateSupplierSearchWithColors(product) {
    const resultContainer = document.getElementById('supplier-result');
    if (!resultContainer || !product) return;
    
    const level = getStockLevel(product.stock);
    const stockIndicator = createStockIndicator(product.stock);
    const stockIcon = createStockIcon(product.stock);
    
    resultContainer.className = `result-popup active stock-${level}`;
    
    resultContainer.innerHTML = `
        <div class="result-header">
            <div class="result-title">
                ${stockIcon.outerHTML}
                <h3>${product.name || 'N/A'}</h3>
            </div>
            <div class="result-actions">
                ${stockIndicator.outerHTML}
            </div>
        </div>
        <div class="result-details">
            <div class="result-detail">
                <span class="detail-label">${translate('code')}:</span>
                <span class="detail-value">${product.code || 'N/A'}</span>
            </div>
            <div class="result-detail">
                <span class="detail-label">${translate('supplier')}:</span>
                <span class="detail-value supplier-highlight">${product.supplier || 'N/A'}</span>
            </div>
            <div class="result-detail">
                <span class="detail-label">${translate('stock')}:</span>
                <span class="detail-value" data-stock="${product.stock}">${product.stock || 0}</span>
            </div>
            <div class="result-detail">
                <span class="detail-label">${translate('price')}:</span>
                <span class="detail-value">${product.price || 0} MAD</span>
            </div>
        </div>
    `;
    
    // Trigger haptic feedback based on stock level
    if (level === 'critical' || level === 'out') {
        triggerHapticFeedback('error');
    } else if (level === 'low') {
        triggerHapticFeedback('medium');
    } else {
        triggerHapticFeedback('success');
    }
}

// Add color coding translations
function addColorCodingTranslations() {
    // English translations
    translations.en['stock-excellent'] = 'Excellent';
    translations.en['stock-good'] = 'Good';
    translations.en['stock-medium'] = 'Medium';
    translations.en['stock-low'] = 'Low';
    translations.en['stock-critical'] = 'Critical';
    translations.en['stock-out'] = 'Out of Stock';
    
    // French translations
    translations.fr['stock-excellent'] = 'Excellent';
    translations.fr['stock-good'] = 'Bon';
    translations.fr['stock-medium'] = 'Moyen';
    translations.fr['stock-low'] = 'Faible';
    translations.fr['stock-critical'] = 'Critique';
    translations.fr['stock-out'] = 'Rupture de Stock';
}

// Initialize color coding
function initializeColorCoding() {
    addColorCodingTranslations();
    enhanceInventoryResults();
    enhanceStatisticsWithColorCoding();
    
    // Set up observers for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const inventoryItems = node.querySelectorAll('.inventory-item, .product-card, .search-result-item');
                        inventoryItems.forEach(item => {
                            const stockElement = item.querySelector('.stock-value, .item-stock, [data-stock]');
                            if (stockElement) {
                                const stock = stockElement.textContent || stockElement.getAttribute('data-stock') || '0';
                                applyStockColorCoding(item, stock);
                            }
                        });
                    }
                });
            }
        });
    });
    
    // Observe changes in inventory results
    const inventoryContainer = document.getElementById('inventory-results');
    if (inventoryContainer) {
        observer.observe(inventoryContainer, { childList: true, subtree: true });
    }
}


// Enhanced Haptic Feedback Functions
function enhanceHapticFeedback() {
    // Add haptic feedback to all buttons
    const buttons = document.querySelectorAll('button, .btn, .dashboard-card, .sidebar-item');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('light');
        });
    });
    
    // Add haptic feedback to form inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            triggerHapticFeedback('light');
        });
        
        input.addEventListener('input', () => {
            triggerHapticFeedback('light');
        });
    });
    
    // Add haptic feedback to search actions
    const searchButtons = document.querySelectorAll('#price-search-btn, #supplier-search-btn, #inventory-search-btn');
    searchButtons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('medium');
        });
    });
    
    // Add haptic feedback to barcode scan buttons
    const barcodeButtons = document.querySelectorAll('[id$="-barcode-btn"]');
    barcodeButtons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('scan');
        });
    });
    
    // Add haptic feedback to navigation
    const navItems = document.querySelectorAll('.dashboard-card');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            triggerHapticFeedback('medium');
        });
    });
    
    // Add haptic feedback to sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            triggerHapticFeedback('light');
        });
    });
    
    // Add haptic feedback to modal actions
    const modalButtons = document.querySelectorAll('.modal .btn, .modal button');
    modalButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('btn-primary') || button.classList.contains('btn-success')) {
                triggerHapticFeedback('success');
            } else if (button.classList.contains('btn-danger') || button.classList.contains('btn-warning')) {
                triggerHapticFeedback('error');
            } else {
                triggerHapticFeedback('light');
            }
        });
    });
    
    // Add haptic feedback to toggle switches
    const toggles = document.querySelectorAll('input[type="checkbox"]');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            triggerHapticFeedback('medium');
        });
    });
}

function addHapticToScanner() {
    // Enhanced haptic feedback for barcode scanning
    const originalStartScanner = window.startScanner;
    if (originalStartScanner) {
        window.startScanner = function(context) {
            triggerHapticFeedback('scan');
            return originalStartScanner.call(this, context);
        };
    }
    
    // Add haptic feedback when barcode is detected
    const originalOnBarcodeDetected = window.onBarcodeDetected;
    if (originalOnBarcodeDetected) {
        window.onBarcodeDetected = function(barcode) {
            triggerHapticFeedback('success');
            return originalOnBarcodeDetected.call(this, barcode);
        };
    }
}

function addHapticToNotifications() {
    // Enhanced haptic feedback for notifications
    const originalShowNotification = window.showNotification;
    if (originalShowNotification) {
        window.showNotification = function(message, type = 'info') {
            switch (type) {
                case 'success':
                    triggerHapticFeedback('success');
                    break;
                case 'error':
                case 'danger':
                    triggerHapticFeedback('error');
                    break;
                case 'warning':
                    triggerHapticFeedback('medium');
                    break;
                default:
                    triggerHapticFeedback('light');
            }
            return originalShowNotification.call(this, message, type);
        };
    }
}

function addHapticToDataOperations() {
    // Add haptic feedback to data upload
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            triggerHapticFeedback('medium');
        });
    }
    
    // Add haptic feedback to export operations
    const exportButtons = document.querySelectorAll('[data-action="export"], .export-btn');
    exportButtons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('success');
        });
    });
    
    // Add haptic feedback to delete operations
    const deleteButtons = document.querySelectorAll('[data-action="delete"], .delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('error');
        });
    });
}

function addHapticToStocktaking() {
    // Add haptic feedback to stocktaking operations
    const stocktakingButtons = document.querySelectorAll('#start-scan-btn, #manual-entry-btn');
    stocktakingButtons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('medium');
        });
    });
    
    // Add haptic feedback to quantity adjustments
    const quantityButtons = document.querySelectorAll('.quantity-btn, .edit-quantity-btn');
    quantityButtons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('light');
        });
    });
}

function addHapticToPricingLabels() {
    // Add haptic feedback to pricing label operations
    const labelButtons = document.querySelectorAll('.label-btn, .print-label-btn');
    labelButtons.forEach(button => {
        button.addEventListener('click', () => {
            triggerHapticFeedback('medium');
        });
    });
}

// Advanced haptic patterns for specific actions
function triggerAdvancedHapticFeedback(pattern) {
    if ('vibrate' in navigator) {
        switch (pattern) {
            case 'scan-success':
                navigator.vibrate([50, 30, 50, 30, 100]);
                break;
            case 'scan-error':
                navigator.vibrate([100, 50, 100, 50, 100]);
                break;
            case 'data-saved':
                navigator.vibrate([20, 20, 20, 20, 50]);
                break;
            case 'data-deleted':
                navigator.vibrate([100, 100, 100]);
                break;
            case 'navigation':
                navigator.vibrate([30, 10, 30]);
                break;
            case 'selection':
                navigator.vibrate([10, 10, 10]);
                break;
            case 'critical-alert':
                navigator.vibrate([200, 100, 200, 100, 200]);
                break;
            case 'low-stock-alert':
                navigator.vibrate([50, 50, 50, 50, 100]);
                break;
            default:
                navigator.vibrate(20);
        }
    }
}

// Initialize enhanced haptic feedback
function initializeEnhancedHapticFeedback() {
    enhanceHapticFeedback();
    addHapticToScanner();
    addHapticToNotifications();
    addHapticToDataOperations();
    addHapticToStocktaking();
    addHapticToPricingLabels();
    
    // Add haptic feedback to dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Add haptic feedback to new buttons
                        const newButtons = node.querySelectorAll('button, .btn');
                        newButtons.forEach(button => {
                            button.addEventListener('click', () => {
                                triggerHapticFeedback('light');
                            });
                        });
                        
                        // Add haptic feedback to new inputs
                        const newInputs = node.querySelectorAll('input, select, textarea');
                        newInputs.forEach(input => {
                            input.addEventListener('focus', () => {
                                triggerHapticFeedback('light');
                            });
                        });
                    }
                });
            }
        });
    });
    
    // Observe the entire document for dynamic content
    observer.observe(document.body, { childList: true, subtree: true });
}

// Haptic feedback preferences
function loadHapticPreferences() {
    const hapticEnabled = localStorage.getItem('hapticEnabled');
    if (hapticEnabled === 'false') {
        window.hapticEnabled = false;
    } else {
        window.hapticEnabled = true;
    }
}

function saveHapticPreferences(enabled) {
    localStorage.setItem('hapticEnabled', enabled.toString());
    window.hapticEnabled = enabled;
}

// Override triggerHapticFeedback to respect preferences
const originalTriggerHapticFeedback = triggerHapticFeedback;
triggerHapticFeedback = function(type = 'light') {
    if (window.hapticEnabled !== false) {
        return originalTriggerHapticFeedback(type);
    }
};

// Add haptic settings to sidebar (optional)
function addHapticSettings() {
    const settingsSection = document.querySelector('.sidebar-separator');
    if (settingsSection) {
        const hapticSetting = document.createElement('li');
        hapticSetting.className = 'sidebar-item';
        hapticSetting.innerHTML = `
            <i class="fas fa-mobile-alt"></i>
            <span data-translate="haptic-feedback">Haptic Feedback</span>
            <label class="switch">
                <input type="checkbox" id="haptic-toggle" ${window.hapticEnabled !== false ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        `;
        
        settingsSection.parentNode.insertBefore(hapticSetting, settingsSection.nextSibling);
        
        // Add event listener for haptic toggle
        const hapticToggle = document.getElementById('haptic-toggle');
        if (hapticToggle) {
            hapticToggle.addEventListener('change', (e) => {
                saveHapticPreferences(e.target.checked);
                if (e.target.checked) {
                    triggerHapticFeedback('success');
                    showNotification(translate('haptic-enabled') || 'Haptic feedback enabled', 'success');
                } else {
                    showNotification(translate('haptic-disabled') || 'Haptic feedback disabled', 'info');
                }
            });
        }
    }
}

// Add haptic translations
function addHapticTranslations() {
    // English translations
    translations.en['haptic-feedback'] = 'Haptic Feedback';
    translations.en['haptic-enabled'] = 'Haptic feedback enabled';
    translations.en['haptic-disabled'] = 'Haptic feedback disabled';
    
    // French translations
    translations.fr['haptic-feedback'] = 'Retour Haptique';
    translations.fr['haptic-enabled'] = 'Retour haptique activé';
    translations.fr['haptic-disabled'] = 'Retour haptique désactivé';
}


// CSV/Excel Export Functions
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showNotification(translate('no-data-to-export') || 'No data to export', 'warning');
        return;
    }
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header] || '';
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Haptic feedback and notification
    triggerHapticFeedback('success');
    showNotification(translate('export-successful') || 'Export successful!', 'success');
}

function exportToExcel(data, filename, sheetName = 'Sheet1') {
    if (!data || data.length === 0) {
        showNotification(translate('no-data-to-export') || 'No data to export', 'warning');
        return;
    }
    
    try {
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        // Write file
        XLSX.writeFile(wb, filename);
        
        // Haptic feedback and notification
        triggerHapticFeedback('success');
        showNotification(translate('export-successful') || 'Export successful!', 'success');
    } catch (error) {
        console.error('Excel export error:', error);
        triggerHapticFeedback('error');
        showNotification(translate('export-failed') || 'Export failed. Please try again.', 'error');
    }
}

function exportStocktakingSeason(season, format = 'excel') {
    if (!season || !season.items || season.items.length === 0) {
        showNotification(translate('no-items-to-export') || 'No items to export', 'warning');
        return;
    }
    
    // Prepare data for export
    const exportData = season.items.map((item, index) => ({
        'Item #': index + 1,
        'Barcode': item.barcode || 'N/A',
        'Product Name': item.name || 'Unknown Product',
        'Category': item.category || 'N/A',
        'Supplier': item.supplier || 'N/A',
        'Scanned Quantity': item.quantity || 0,
        'Unit Price': item.price || 0,
        'Total Value': (item.quantity || 0) * (item.price || 0),
        'Scan Date': item.scanDate || new Date().toISOString().split('T')[0],
        'Scan Time': item.scanTime || new Date().toLocaleTimeString()
    }));
    
    // Add summary row
    const totalQuantity = season.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = season.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    
    exportData.push({
        'Item #': '',
        'Barcode': '',
        'Product Name': 'TOTAL',
        'Category': '',
        'Supplier': '',
        'Scanned Quantity': totalQuantity,
        'Unit Price': '',
        'Total Value': totalValue,
        'Scan Date': '',
        'Scan Time': ''
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const seasonName = season.name.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (format === 'csv') {
        const filename = `Stocktaking_${seasonName}_${timestamp}.csv`;
        exportToCSV(exportData, filename);
    } else {
        const filename = `Stocktaking_${seasonName}_${timestamp}.xlsx`;
        exportToExcel(exportData, filename, `Stocktaking - ${season.name}`);
    }
}

function exportPricingLabelsSession(session, format = 'excel') {
    if (!session || !session.items || session.items.length === 0) {
        showNotification(translate('no-labels-to-export') || 'No labels to export', 'warning');
        return;
    }
    
    // Prepare data for export
    const exportData = session.items.map((item, index) => ({
        'Label #': index + 1,
        'Barcode': item.barcode || 'N/A',
        'Product Name': item.name || 'Unknown Product',
        'Category': item.category || 'N/A',
        'Supplier': item.supplier || 'N/A',
        'Current Price': item.price || 0,
        'Stock Level': item.stock || 0,
        'Label Type': item.labelType || 'Standard',
        'Print Quantity': item.printQuantity || 1,
        'Scan Date': item.scanDate || new Date().toISOString().split('T')[0],
        'Scan Time': item.scanTime || new Date().toLocaleTimeString()
    }));
    
    // Add summary row
    const totalLabels = session.items.reduce((sum, item) => sum + (item.printQuantity || 1), 0);
    
    exportData.push({
        'Label #': '',
        'Barcode': '',
        'Product Name': 'TOTAL LABELS',
        'Category': '',
        'Supplier': '',
        'Current Price': '',
        'Stock Level': '',
        'Label Type': '',
        'Print Quantity': totalLabels,
        'Scan Date': '',
        'Scan Time': ''
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const sessionName = session.name.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (format === 'csv') {
        const filename = `Pricing_Labels_${sessionName}_${timestamp}.csv`;
        exportToCSV(exportData, filename);
    } else {
        const filename = `Pricing_Labels_${sessionName}_${timestamp}.xlsx`;
        exportToExcel(exportData, filename, `Pricing Labels - ${session.name}`);
    }
}

function exportInventoryData(format = 'excel') {
    if (!inventoryData || inventoryData.length === 0) {
        showNotification(translate('no-inventory-to-export') || 'No inventory data to export', 'warning');
        return;
    }
    
    // Prepare data for export
    const exportData = inventoryData.map((item, index) => ({
        'Item #': index + 1,
        'Product Code': item.code || 'N/A',
        'Product Name': item.name || 'Unknown Product',
        'Category': item.category || 'N/A',
        'Supplier': item.supplier || 'N/A',
        'Current Stock': item.stock || 0,
        'Unit Price': item.price || 0,
        'Total Value': (item.stock || 0) * (item.price || 0),
        'Stock Status': getStockLevelText(getStockLevel(item.stock)),
        'Last Updated': new Date().toISOString().split('T')[0]
    }));
    
    // Add summary row
    const totalItems = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);
    const lowStockItems = inventoryData.filter(item => getStockLevel(item.stock) === 'low' || getStockLevel(item.stock) === 'critical').length;
    
    exportData.push({
        'Item #': '',
        'Product Code': '',
        'Product Name': 'SUMMARY',
        'Category': `Total Items: ${totalItems}`,
        'Supplier': `Low Stock Items: ${lowStockItems}`,
        'Current Stock': '',
        'Unit Price': '',
        'Total Value': totalValue,
        'Stock Status': '',
        'Last Updated': ''
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
        const filename = `Inventory_Export_${timestamp}.csv`;
        exportToCSV(exportData, filename);
    } else {
        const filename = `Inventory_Export_${timestamp}.xlsx`;
        exportToExcel(exportData, filename, 'Inventory Data');
    }
}

function createExportModal(title, onExport) {
    const modal = document.createElement('div');
    modal.className = 'modal export-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>${translate('choose-export-format') || 'Choose export format:'}</p>
                <div class="export-options">
                    <button class="btn btn-primary export-excel-btn">
                        <i class="fas fa-file-excel"></i>
                        <span>${translate('export-excel') || 'Export Excel'}</span>
                    </button>
                    <button class="btn btn-secondary export-csv-btn">
                        <i class="fas fa-file-csv"></i>
                        <span>${translate('export-csv') || 'Export CSV'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const excelBtn = modal.querySelector('.export-excel-btn');
    const csvBtn = modal.querySelector('.export-csv-btn');
    
    excelBtn.addEventListener('click', () => {
        onExport('excel');
        modal.remove();
        triggerHapticFeedback('success');
    });
    
    csvBtn.addEventListener('click', () => {
        onExport('csv');
        modal.remove();
        triggerHapticFeedback('success');
    });
    
    // Add haptic feedback to buttons
    excelBtn.addEventListener('click', () => triggerHapticFeedback('medium'));
    csvBtn.addEventListener('click', () => triggerHapticFeedback('medium'));
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    return modal;
}

function addExportButtonsToStocktaking() {
    // Add export button to current season
    const stocktakingActions = document.querySelector('.stocktaking-actions');
    if (stocktakingActions && !stocktakingActions.querySelector('.export-season-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary export-season-btn';
        exportBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span data-translate="export-season">Export Season</span>
        `;
        
        exportBtn.addEventListener('click', () => {
            createExportModal(
                translate('export-stocktaking-season') || 'Export Stocktaking Season',
                (format) => exportStocktakingSeason(currentSeason, format)
            );
        });
        
        stocktakingActions.appendChild(exportBtn);
    }
    
    // Add export buttons to archived seasons
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach((item, index) => {
        if (!item.querySelector('.export-archive-btn')) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-sm btn-secondary export-archive-btn';
            exportBtn.innerHTML = '<i class="fas fa-download"></i>';
            exportBtn.title = translate('export-season') || 'Export Season';
            
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const season = seasonArchive[index];
                if (season) {
                    createExportModal(
                        translate('export-archived-season') || 'Export Archived Season',
                        (format) => exportStocktakingSeason(season, format)
                    );
                }
            });
            
            const actionsContainer = item.querySelector('.archive-actions');
            if (actionsContainer) {
                actionsContainer.appendChild(exportBtn);
            }
        }
    });
}

function addExportButtonsToPricingLabels() {
    // Add export button to current labels session
    const labelsActions = document.querySelector('.labels-actions');
    if (labelsActions && !labelsActions.querySelector('.export-labels-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary export-labels-btn';
        exportBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span data-translate="export-labels">Export Labels</span>
        `;
        
        exportBtn.addEventListener('click', () => {
            createExportModal(
                translate('export-pricing-labels') || 'Export Pricing Labels',
                (format) => exportPricingLabelsSession(currentLabelsSession, format)
            );
        });
        
        labelsActions.appendChild(exportBtn);
    }
    
    // Add export buttons to archived label sessions
    const archiveItems = document.querySelectorAll('.labels-archive-item');
    archiveItems.forEach((item, index) => {
        if (!item.querySelector('.export-labels-archive-btn')) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-sm btn-secondary export-labels-archive-btn';
            exportBtn.innerHTML = '<i class="fas fa-download"></i>';
            exportBtn.title = translate('export-labels') || 'Export Labels';
            
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const session = labelsSessionArchive[index];
                if (session) {
                    createExportModal(
                        translate('export-archived-labels') || 'Export Archived Labels',
                        (format) => exportPricingLabelsSession(session, format)
                    );
                }
            });
            
            const actionsContainer = item.querySelector('.labels-archive-actions');
            if (actionsContainer) {
                actionsContainer.appendChild(exportBtn);
            }
        }
    });
}

function addExportButtonToInventory() {
    // Add export button to inventory view
    const inventoryHeader = document.querySelector('#inventory-view .section-header');
    if (inventoryHeader && !inventoryHeader.querySelector('.export-inventory-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary export-inventory-btn';
        exportBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span data-translate="export-inventory">Export Inventory</span>
        `;
        
        exportBtn.addEventListener('click', () => {
            createExportModal(
                translate('export-inventory-data') || 'Export Inventory Data',
                (format) => exportInventoryData(format)
            );
        });
        
        inventoryHeader.appendChild(exportBtn);
    }
}

// Add export translations
function addExportTranslations() {
    // English translations
    translations.en['export-season'] = 'Export Season';
    translations.en['export-labels'] = 'Export Labels';
    translations.en['export-inventory'] = 'Export Inventory';
    translations.en['export-excel'] = 'Export Excel';
    translations.en['export-csv'] = 'Export CSV';
    translations.en['export-successful'] = 'Export successful!';
    translations.en['export-failed'] = 'Export failed. Please try again.';
    translations.en['no-data-to-export'] = 'No data to export';
    translations.en['no-items-to-export'] = 'No items to export';
    translations.en['no-labels-to-export'] = 'No labels to export';
    translations.en['no-inventory-to-export'] = 'No inventory data to export';
    translations.en['choose-export-format'] = 'Choose export format:';
    translations.en['export-stocktaking-season'] = 'Export Stocktaking Season';
    translations.en['export-pricing-labels'] = 'Export Pricing Labels';
    translations.en['export-inventory-data'] = 'Export Inventory Data';
    translations.en['export-archived-season'] = 'Export Archived Season';
    translations.en['export-archived-labels'] = 'Export Archived Labels';
    
    // French translations
    translations.fr['export-season'] = 'Exporter Saison';
    translations.fr['export-labels'] = 'Exporter Étiquettes';
    translations.fr['export-inventory'] = 'Exporter Inventaire';
    translations.fr['export-excel'] = 'Exporter Excel';
    translations.fr['export-csv'] = 'Exporter CSV';
    translations.fr['export-successful'] = 'Export réussi!';
    translations.fr['export-failed'] = 'Échec de l\'export. Veuillez réessayer.';
    translations.fr['no-data-to-export'] = 'Aucune donnée à exporter';
    translations.fr['no-items-to-export'] = 'Aucun article à exporter';
    translations.fr['no-labels-to-export'] = 'Aucune étiquette à exporter';
    translations.fr['no-inventory-to-export'] = 'Aucune donnée d\'inventaire à exporter';
    translations.fr['choose-export-format'] = 'Choisissez le format d\'export:';
    translations.fr['export-stocktaking-season'] = 'Exporter Saison d\'Inventaire';
    translations.fr['export-pricing-labels'] = 'Exporter Étiquettes de Prix';
    translations.fr['export-inventory-data'] = 'Exporter Données d\'Inventaire';
    translations.fr['export-archived-season'] = 'Exporter Saison Archivée';
    translations.fr['export-archived-labels'] = 'Exporter Étiquettes Archivées';
}

// Initialize export functionality
function initializeExportFunctionality() {
    addExportTranslations();
    
    // Add export buttons when views are loaded
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if stocktaking view is loaded
                        if (node.querySelector('.stocktaking-actions') || node.classList.contains('stocktaking-actions')) {
                            setTimeout(addExportButtonsToStocktaking, 100);
                        }
                        
                        // Check if pricing labels view is loaded
                        if (node.querySelector('.labels-actions') || node.classList.contains('labels-actions')) {
                            setTimeout(addExportButtonsToPricingLabels, 100);
                        }
                        
                        // Check if inventory view is loaded
                        if (node.querySelector('#inventory-view') || node.id === 'inventory-view') {
                            setTimeout(addExportButtonToInventory, 100);
                        }
                    }
                });
            }
        });
    });
    
    // Observe the entire document for dynamic content
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Add export buttons to existing elements
    setTimeout(() => {
        addExportButtonsToStocktaking();
        addExportButtonsToPricingLabels();
        addExportButtonToInventory();
    }, 1000);
}


// Logout function to clear remembered authentication
function logout() {
    isAuthenticated = false;
    clearRememberedAuth();
    
    // Clear any sensitive data
    enteredKey = '';
    authAttempts = 0;
    
    // Show authentication modal again
    showAuthModal();
    
    // Clear input field
    const keyInput = document.getElementById('key-input');
    if (keyInput) {
        keyInput.value = '';
    }
    
    // Uncheck remember me checkbox
    const rememberCheckbox = document.getElementById('remember-me-checkbox');
    if (rememberCheckbox) {
        rememberCheckbox.checked = false;
    }
    
    showNotification(translate('logged-out') || 'Logged out successfully', 'info');
}

// Add logout option to sidebar (optional)
function addLogoutOption() {
    const sidebar = document.querySelector('.sidebar-menu');
    if (sidebar && !sidebar.querySelector('.logout-item')) {
        const logoutItem = document.createElement('li');
        logoutItem.className = 'sidebar-item logout-item';
        logoutItem.innerHTML = `
            <i class="fas fa-sign-out-alt"></i>
            <span data-translate="logout">Logout</span>
        `;
        
        logoutItem.addEventListener('click', () => {
            if (confirm(translate('confirm-logout') || 'Are you sure you want to logout?')) {
                logout();
                // Close sidebar
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebar-overlay');
                if (sidebar) sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        });
        
        // Add before the settings separator
        const settingsSeparator = sidebar.querySelector('.sidebar-separator');
        if (settingsSeparator) {
            sidebar.insertBefore(logoutItem, settingsSeparator);
        } else {
            sidebar.appendChild(logoutItem);
        }
    }
}

// Add logout translations
function addLogoutTranslations() {
    // English
    translations.en['logout'] = 'Logout';
    translations.en['logged-out'] = 'Logged out successfully';
    translations.en['confirm-logout'] = 'Are you sure you want to logout?';
    
    // French
    translations.fr['logout'] = 'Déconnexion';
    translations.fr['logged-out'] = 'Déconnecté avec succès';
    translations.fr['confirm-logout'] = 'Êtes-vous sûr de vouloir vous déconnecter?';
}



/* === Bottom nav behavior (added) === */

/* Bottom navigation behavior (added) */
function initBottomNav() {
    const navBtns = document.querySelectorAll('#bottom-nav .nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.dataset.target;
            // set active class
            document.querySelectorAll('#bottom-nav .nav-btn').forEach(b => b.classList.remove('nav-active'));
            btn.classList.add('nav-active');
            // show view
            if (target) {
                showView(target);
                // push history state
                try { history.pushState({view: target}, '', '#' + target); } catch(e) {}
            }
            // small bounce animation
            btn.animate([{ transform: 'translateY(-2px) scale(1.02)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.2,.9,.3,1)' });
        });
    });

    // sync initial active based on current view
    const activeView = document.querySelector('.view.active');
    if (activeView) {
        const id = activeView.id;
        const match = document.querySelector('#bottom-nav .nav-btn[data-target="' + id + '"]');
        if (match) {
            document.querySelectorAll('#bottom-nav .nav-btn').forEach(b => b.classList.remove('nav-active'));
            match.classList.add('nav-active');
        }
    }

    // scroll spy: observe which .view is in viewport and update active tab
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const btn = document.querySelector('#bottom-nav .nav-btn[data-target="' + id + '"]');
                if (btn) {
                    document.querySelectorAll('#bottom-nav .nav-btn').forEach(b => b.classList.remove('nav-active'));
                    btn.classList.add('nav-active');
                }
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.6 });

    document.querySelectorAll('.view').forEach(v => observer.observe(v));
}


// Enhance existing menu toggle to work as sidebar toggle (top-left button)
(function enhanceMenuToggle(){
    const menuToggle = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('close-sidebar-btn');
    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
})();

// Hook initBottomNav into initializeApp after views are set up
document.addEventListener('DOMContentLoaded', function() {
    // Delay to ensure views exist
    setTimeout(() => {
        try { initBottomNav(); } catch(e) { console.warn('initBottomNav failed', e); }
    }, 300);
});


// === UX Enhancements: upload history

/* Helper and enhancements code (omitted in this preview, added in full bundle) */


// Safety fallback: ensure main has bottom padding if CSS fails to load
try{document.addEventListener('DOMContentLoaded', function(){const m=document.querySelector('main'); if(m){const pb=window.getComputedStyle(m).getPropertyValue('padding-bottom')||''; if(!pb||pb.trim()==='0px'){ m.style.paddingBottom = (window.innerWidth<=600)?'128px':'112px'; }}});}catch(e){console.warn(e);}


/* Handle manifest shortcuts deep-links (fixed mapping) */
window.addEventListener('load', () => {
  const hash = location.hash;
  try {
    if (hash === '#stocktaking') {
      if (typeof openStocktakingModal === 'function') openStocktakingModal();
    } else if (hash === '#labels') {
      if (typeof openPricingLabelsModal === 'function') openPricingLabelsModal();
    } else if (hash === '#statistics') {
      if (typeof showView === 'function') showView('statistic-view');
    }
  } catch(e) { console.warn('Deep link error', e); }
});




/* Improved Install banner with fallback */
(function(){
  const banner = document.getElementById('install-banner');
  const installBtn = document.getElementById('install-btn');
  const dismissBtn = document.getElementById('install-dismiss');
  const DISMISS_KEY = 'installBannerDismissed';
  let deferredPrompt = null;

  // Helper to detect standalone/app-installed
  function isStandalone(){
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone === true);
  }

  // If user dismissed, don't show
  const dismissed = localStorage.getItem(DISMISS_KEY);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone() && !dismissed && banner) banner.hidden = false;
  });

  // Fallback: after 3s, if no event fired and not installed, show manual banner (some browsers/iOS)
  setTimeout(() => {
    if (!deferredPrompt && !isStandalone() && !dismissed && banner) {
      banner.hidden = false;
      // Change primary button text to "How to Install" if we can't prompt
      const txt = installBtn ? installBtn.firstChild : null;
      if (installBtn) installBtn.textContent = 'How to Install';
      if (banner) banner.dataset.fallback = '1';
    }
  }, 3000);

  installBtn && installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      const res = await deferredPrompt.prompt();
      deferredPrompt = null;
    } else {
      // Show basic instructions if we can't prompt
      alert('To install: open browser menu and choose "Install app" (or "Add to Home Screen" on iOS).');
    }
    if (banner) banner.hidden = true;
    localStorage.setItem(DISMISS_KEY, '1');
  });

  dismissBtn && dismissBtn.addEventListener('click', () => {
    if (banner) banner.hidden = true;
    localStorage.setItem(DISMISS_KEY, '1');
  });
})();



/* Robust deep-link handler for manifest shortcuts (with Scan Inventory) */
(function(){
  function ready(fn){ if (document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function tryOpen(){
    const hash = location.hash;
    try {
      if (hash === '#stocktaking' && typeof openStocktakingModal === 'function') { openStocktakingModal(); return true; }
      if (hash === '#labels' && typeof openPricingLabelsModal === 'function') { openPricingLabelsModal(); return true; }
      if (hash === '#statistics' && typeof showView === 'function') { showView('statistic-view'); return true; }
      if (hash === '#scan-inventory' && typeof openBarcodeScanner === 'function') { openBarcodeScanner({ type: 'input', id: 'inventory-search' }); return true; }
    } catch(e){ console.warn('Deep link error', e); }
    return false;
  }
  ready(() => {
    let tries = 0;
    const iv = setInterval(() => {
      if (tryOpen() || (++tries > 40)) clearInterval(iv);
    }, 50);
  });
  window.addEventListener('focus', tryOpen);
})();


/* --- Skeleton control --- */
function hideSkeletons() {
  const ds = document.getElementById('dashboard-skeleton');
  if (ds) ds.classList.add('hidden');
  const ss = document.getElementById('stats-skeleton');
  if (ss) ss.classList.add('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
  // hide dashboard skeleton shortly after load (UI rendered)
  setTimeout(hideSkeletons, 600);
});


/* --- Selective Haptics --- */
function haptic(type='light'){
  if (!('vibrate' in navigator)) return;
  const map = { light: 10, medium: [15, 30, 15], heavy: [30, 50, 30] };
  navigator.vibrate(map[type] || 10);
}
function bindHaptics(){
  const ids = ['price-barcode-btn','supplier-barcode-btn','inventory-barcode-btn','start-labels-scan-btn','start-scan-btn','export-season-btn','export-season-excel-btn','share-labels-btn','export-labels-excel-btn'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => haptic('light'), { passive: true });
  });
}
document.addEventListener('DOMContentLoaded', bindHaptics);


/* --- Swipe between tabs (left/right) --- */
function initSwipeNav(){
  const order = ['dashboard-view','inventory-view','price-check-view','settings-view'];
  const mainEl = document.querySelector('main');
  if (!mainEl) return;
  let startX=0, startY=0, tracking=false;
  mainEl.addEventListener('touchstart', (e)=>{
    if (!e.touches || e.touches.length!==1) return;
    const t = e.touches[0]; startX=t.clientX; startY=t.clientY; tracking=true;
  }, {passive:true});
  mainEl.addEventListener('touchmove', (e)=>{
    // if user scrolls vertically a lot, cancel swipe
    if (!tracking) return;
    const t = e.touches[0]; 
    if (Math.abs(t.clientY-startY) > 24) tracking=false;
  }, {passive:true});
  mainEl.addEventListener('touchend', (e)=>{
    if (!tracking) return; tracking=false;
    const dx = (e.changedTouches && e.changedTouches[0].clientX - startX) || 0;
    if (Math.abs(dx) < 60) return; // threshold
    // determine current active view
    const active = document.querySelector('.view.active');
    if (!active) return;
    const id = active.id;
    const idx = order.indexOf(id);
    if (idx===-1) return;
    let nextIdx = dx < 0 ? idx+1 : idx-1;
    if (nextIdx < 0 || nextIdx >= order.length) return;
    const next = order[nextIdx];
    const btn = document.querySelector('#bottom-nav .nav-btn[data-target="'+next+'"]');
    if (btn) btn.click(); else showView(next);
  }, {passive:true});
}
document.addEventListener('DOMContentLoaded', initSwipeNav);


/* Scanner upgrade wrapper disabled.
 * The original scanner already starts a ZXing decoder. The former wrapper
 * started a second decoder on the same video element, which caused competing
 * reset/playback state and the recurring paused-video behavior.
 */
/* Safe scan post-processing wrapper (Step 2, updated rules) */
(function(){
  if (typeof window.handleScannedCode !== 'function') return;
  const originalHandle = window.handleScannedCode;
  let lastCode = '', lastAt = 0;
  const DEFAULT_WINDOW = 650;

  window.handleScannedCode = function(text){
    try {
      // Subtle haptic on success
      if (navigator.vibrate) navigator.vibrate(15);

      // Determine mode: if scanning for stocktaking or pricing labels, do NOT throttle duplicates
      const ctx = window.scannerContext || {};
      const type = ctx && ctx.type;

      if (type !== 'stocktaking' && type !== 'pricing-labels') {
        const now = Date.now();
        if (text === lastCode && (now - lastAt) < DEFAULT_WINDOW) {
          return; // ignore same code too quickly for input-based flows
        }
        lastCode = text; lastAt = now;
      }

      return originalHandle.call(this, text);
    } catch (e) {
      try { return originalHandle.call(this, text); } catch(_) {}
    }
  };
})();
/* Step3 scanner controls wrapper: inject torch/camera + beep (no decode changes) */
(function(){
  if (typeof window.openBarcodeScanner !== 'function') return;
  const originalOpen = window.openBarcodeScanner;

  // Simple beep using Web Audio (no <audio> element needed)
  function beep(){
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880; // A5
      o.connect(g); g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      o.stop(now + 0.1);
    } catch(_) {}
  }

  // Hook into handleScannedCode to play beep (respect existing wrapper)
  (function setupBeep(){
    if (window.__scanBeepPatched) return;
    window.__scanBeepPatched = true;
    const orig = window.handleScannedCode;
    if (typeof orig !== 'function') return;
    window.handleScannedCode = function(text){
      try { beep(); } catch(_) {}
      return orig.apply(this, arguments);
    };
  })();

  // Camera state holder
  let currentDeviceId = null;

  async function switchCamera(video){
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter(d => d.kind === 'videoinput');
    if (!cams.length) return;
    // Prefer to cycle through list
    const idx = cams.findIndex(d => d.deviceId === currentDeviceId);
    const next = cams[(idx + 1) % cams.length];
    currentDeviceId = next.deviceId;
    // Create new stream and assign to the same video element
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: currentDeviceId } } });
      const old = video.srcObject;
      video.srcObject = stream;
      // stop old tracks
      if (old && old.getTracks) old.getTracks().forEach(t=>t.stop());
      // Inform listeners (if any)
      document.dispatchEvent(new CustomEvent('stockify:camera-switched', { detail: { deviceId: currentDeviceId } }));
    } catch(e){
      console.warn('Camera switch failed', e);
    }
  }

  function toggleTorch(video, torchBtn){
    const stream = video && video.srcObject;
    if (!stream) return;
    const track = stream.getVideoTracks && stream.getVideoTracks()[0];
    if (!track) return;
    const caps = track.getCapabilities ? track.getCapabilities() : {};
    if (!caps.torch) {
      // Torch not supported on this device
      return;
    }
    const on = !(toggleTorch._on);
    track.applyConstraints({ advanced: [{ torch: on }] }).then(()=>{
      toggleTorch._on = on;
      if (torchBtn) torchBtn.classList.toggle('torch-on', on);
    }).catch(()=>{});
  }

  function ensureControls(){
    const modal = document.getElementById('scanner-modal');
    const overlay = document.getElementById('scanner-overlay');
    const video = document.getElementById('scanner-video');
    if (!modal || !overlay || !video) return;

    // Buttons container in footer or overlay
    let footer = modal.querySelector('.scanner-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'scanner-footer';
      modal.appendChild(footer);
    }

    // Torch button
    let torchBtn = document.getElementById('torch-btn');
    if (!torchBtn) {
      torchBtn = document.createElement('button');
      torchBtn.id = 'torch-btn';
      torchBtn.className = 'scanner-action-btn';
      torchBtn.title = 'Toggle torch';
      torchBtn.innerHTML = '&#128262;'; // flashlight emoji
      footer.appendChild(torchBtn);
    }

    // Switch camera button
    let switchBtn = document.getElementById('switch-camera-btn');
    if (!switchBtn) {
      switchBtn = document.createElement('button');
      switchBtn.id = 'switch-camera-btn';
      switchBtn.className = 'scanner-action-btn';
      switchBtn.title = 'Switch camera';
      switchBtn.innerHTML = '&#8646;'; // switch arrows
      footer.appendChild(switchBtn);
    }

    // Wire actions once
    if (!torchBtn.__wired){
      torchBtn.addEventListener('click', ()=> toggleTorch(video, torchBtn), { passive: true });
      torchBtn.__wired = true;
    }
    if (!switchBtn.__wired){
      switchBtn.addEventListener('click', ()=> switchCamera(video), { passive: true });
      switchBtn.__wired = true;
    }

    // Initialize currentDeviceId from current stream if possible
    const stream = video.srcObject;
    const track = stream && stream.getVideoTracks ? stream.getVideoTracks()[0] : null;
    if (track && track.getSettings) {
      currentDeviceId = track.getSettings().deviceId || currentDeviceId;
    }
  }

  // Allow customizing de-dup window via global flag
  if (typeof window.SCAN_DEDUP_MS === 'number') {
    try {
      // Patch the Step 2 wrapper constant dynamically if present
      const patched = window.handleScannedCode.toString().includes('SAME_CODE_WINDOW');
      // no reliable runtime patching; the Step 2 wrapper already uses 650ms,
      // but we can respect a global override in a small additive mini-wrapper:
      const prev = window.handleScannedCode;
      window.handleScannedCode = function(text){
        const now = Date.now();
        window.__scanDedupCache = window.__scanDedupCache || { code:'', at:0 };
        if (text === window.__scanDedupCache.code && (now - window.__scanDedupCache.at) < window.SCAN_DEDUP_MS) return;
        window.__scanDedupCache = { code: text, at: now };
        return prev.apply(this, arguments);
      };
    } catch(_) {}
  }

  window.openBarcodeScanner = function(context){
    // Call original to keep behavior
    const r = originalOpen.apply(this, arguments);
    // After modal shows, inject controls
    try {
      // small delay to allow DOM to render
      setTimeout(ensureControls, 50);
    } catch(_) {}
    return r;
  };
})();



/* --- Duplicate scan modal for Digital Stocktaking --- */
function openDuplicateScanModal(barcode){
    let modal = document.getElementById('duplicate-scan-modal');
    if (!modal) {
        modal = createDuplicateScanModal();
        document.body.appendChild(modal);
    }
    const codeEl = modal.querySelector('.dup-barcode');
    if (codeEl) codeEl.textContent = barcode;
    modal.classList.add('active');

    // Wire buttons each time (ensures latest handlers)
    const addBtn = modal.querySelector('#dup-add-again');
    const delBtn = modal.querySelector('#dup-delete-existing');
    const cancelBtn = modal.querySelector('#dup-cancel');

    addBtn.onclick = () => {
        modal.classList.remove('active');
        openQuantityModal(barcode);
    };
    delBtn.onclick = () => {
        // Remove existing item(s) with this barcode
        const before = currentSeason.items.length;
        currentSeason.items = currentSeason.items.filter(it => it.barcode !== barcode);
        const removed = before - currentSeason.items.length;
        saveSeasonData();
        updateStocktakingDisplay();
        showNotification(removed > 0 ? 'Existing item removed.' : 'No existing item found.', 'info');
        modal.classList.remove('active');
        // Optionally reopen scanner to continue
        openBarcodeScanner({ type: 'stocktaking' });
    };
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            modal.classList.remove('active');
            // Reopen scanner to continue
            openBarcodeScanner({ type: 'stocktaking' });
        };
    }
}

function createDuplicateScanModal(){
    const wrap = document.createElement('div');
    wrap.id = 'duplicate-scan-modal';
    wrap.className = 'modal active'; // rely on existing modal styles
    wrap.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Duplicate Barcode</h2>
          <button class="close-btn" id="dup-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>This barcode <strong class="dup-barcode"></strong> was already scanned in this session.</p>
          <p>Do you want to <strong>add it again</strong> or <strong>delete the existing entry</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn" id="dup-add-again">Add Again</button>
          <button class="btn danger" id="dup-delete-existing">Delete Existing</button>
          <button class="btn secondary" id="dup-cancel">Cancel</button>
        </div>
      </div>
      <div class="modal-backdrop"></div>
    `;
    // Close button
    wrap.querySelector('#dup-close').addEventListener('click', ()=>{
      wrap.classList.remove('active');
      openBarcodeScanner({ type: 'stocktaking' });
    }, { passive: true });
    // Clicking backdrop closes too
    const backdrop = wrap.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', ()=>{
      wrap.classList.remove('active');
      openBarcodeScanner({ type: 'stocktaking' });
    }, { passive: true });
    return wrap;
}




/* Manual Entry Stocktaking Duplicate Patch (v3: using activeView) */
(function(){
  if (typeof window.openManualEntry !== 'function') return;
  const originalOpenManualEntry = window.openManualEntry;
  window.openManualEntry = function(){
    originalOpenManualEntry.apply(this, arguments);
    try {
      const modal = document.getElementById("custom-manual-entry-modal");
      const input = document.getElementById("manual-barcode-input");
      const okBtn = document.getElementById("manual-entry-ok-btn");
      if (!modal || !input || !okBtn) return;

      const viewName = (typeof window.activeView !== 'undefined' && window.activeView) || 
                       (typeof window.currentView !== 'undefined' && window.currentView) || '';

      const originalOk = okBtn.onclick;

      okBtn.onclick = () => {
        const barcode = (input.value || '').trim();
        if (!barcode) { showNotification('Please enter a barcode.', 'error'); return; }
        if (!isValidBarcode(barcode)) { showNotification('Invalid barcode format.', 'error'); return; }

        if (String(viewName).toLowerCase().includes('stocktaking')) {
          modal.classList.remove('active');
          const exists = window.currentSeason && Array.isArray(currentSeason.items) && currentSeason.items.some(it => it.barcode === barcode);
          if (exists) {
            openDuplicateScanModal(barcode);
          } else {
            openQuantityModal(barcode);
          }
          return;
        }

        if (typeof originalOk === 'function') {
          return originalOk.call(okBtn);
        }
      };

      input.onkeypress = (e) => { if (e.key === 'Enter') okBtn.click(); };

    } catch(e) {
      console.warn('Manual entry stocktaking patch error', e);
    }
  };
})();









/* Scanner header controls (inline SVG) — v4 force Gallery + proper order */
(function(){
  if (typeof window.openBarcodeScanner !== 'function') return;
  const originalOpen = window.openBarcodeScanner;

  async function ensureZXingLoaded() {
    if (window.ZXing && window.ZXing.BrowserMultiFormatReader) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@zxing/library@latest/umd/index.min.js';
      s.async = true; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function toggleTorch(video, btn){
    const stream = video && video.srcObject;
    if (!stream) return;
    const track = stream.getVideoTracks && stream.getVideoTracks()[0];
    if (!track) return;
    const caps = track.getCapabilities ? track.getCapabilities() : {};
    if (!caps.torch) { try{ showNotification('Torch not supported','info'); }catch(_){} return; }
    const on = !(toggleTorch._on);
    track.applyConstraints({ advanced: [{ torch: on }] }).then(()=>{
      toggleTorch._on = on;
      btn && btn.classList.toggle('torch-on', on);
    }).catch(()=>{});
  }

  let currentDeviceId = null;
  async function switchCamera(video){
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter(d => d.kind === 'videoinput');
    if (!cams.length) return;
    const idx = cams.findIndex(d => d.deviceId === currentDeviceId);
    const next = cams[(idx + 1) % cams.length];
    currentDeviceId = next.deviceId;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: currentDeviceId } } });
      const old = video.srcObject;
      video.srcObject = stream;
      if (old && old.getTracks) old.getTracks().forEach(t=>t.stop());
    } catch(e){ console.warn('Camera switch failed', e); }
  }

  async function decodeFromImageFile(file){
    try {
      await ensureZXingLoaded();
      const reader = new ZXing.BrowserMultiFormatReader();
      const fr = new FileReader();
      const p = new Promise((resolve, reject)=>{ fr.onload = ()=>resolve(fr.result); fr.onerror = reject; });
      fr.readAsDataURL(file);
      const dataUrl = await p;
      const img = new Image();
      img.src = dataUrl;
      await new Promise(res => { img.onload = res; });
      const result = await reader.decodeFromImage(img);
      if (result && result.getText) {
        if (navigator.vibrate) navigator.vibrate(15);
        try { handleScannedCode(result.getText()); } catch(e){ console.warn(e); }
        try { showNotification('Image decoded successfully','success'); } catch(_) {}
      } else {
        try { showNotification('No barcode found in image','warning'); } catch(_) {}
      }
    } catch(e){
      console.warn('decodeFromImageFile failed', e);
      try { showNotification('Could not read barcode from image','error'); } catch(_) {}
    }
  }

  function ensureControls(){
    const modal = document.getElementById('scanner-modal');
    const video = document.getElementById('scanner-video');
    if (!modal || !video) return;

    let header = modal.querySelector('.scanner-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'scanner-header';
      const title = document.createElement('div');
      title.className = 'scanner-title';
      title.textContent = 'Barcode Scanner';
      header.appendChild(title);
      modal.prepend(header);
    }

    // Clean up old placeholders
    header.querySelectorAll('button:not(.icon-btn), .legacy-scanner-icon').forEach(el=>{ el.style.display = 'none'; });

    let left = header.querySelector('.scanner-actions-left');
    if (!left) { left = document.createElement('div'); left.className = 'scanner-actions-left'; header.prepend(left); }
    let right = header.querySelector('.scanner-actions-right');
    if (!right) { right = document.createElement('div'); right.className = 'scanner-actions-right'; header.appendChild(right); }

    // Force remove any existing elements with our IDs to avoid conflicts
    ['scanner-back-btn','gallery-btn','torch-btn','switch-camera-btn'].forEach(id => {
      document.querySelectorAll('#'+id).forEach(n=>{ if(n && n.parentNode){ n.parentNode.removeChild(n); } });
    });

    function makeBtn(id, title, svg){
      const b = document.createElement('button');
      b.id = id;
      b.className = 'icon-btn';
      b.title = title;
      b.innerHTML = svg;
      return b;
    }

    const svgBack = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    const svgFlash = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    const svgSwitch = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>';
    const svgGallery = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';

    // Left: Back + Gallery (in that order)
    const backBtn = makeBtn('scanner-back-btn','Back', svgBack);
    left.appendChild(backBtn);
    if (!backBtn.__wired){
      backBtn.addEventListener('click', ()=>{ try{ closeBarcodeScanner && closeBarcodeScanner(); }catch(_){ modal.classList.remove('active'); } }, { passive:true });
      backBtn.__wired = true;
    }

    const galleryBtn = makeBtn('gallery-btn','Scan from image', svgGallery);
    left.appendChild(galleryBtn);
    if (!galleryBtn.__wired){
      const file = document.createElement('input');
      file.type = 'file'; file.accept = 'image/*'; file.style.display='none';
      galleryBtn.addEventListener('click', ()=> file.click(), { passive:true });
      file.addEventListener('change', ()=>{ if (file.files && file.files[0]) decodeFromImageFile(file.files[0]); });
      modal.appendChild(file);
      galleryBtn.__wired = true;
    }

    // Right: Torch + Switch
    const torchBtn = makeBtn('torch-btn','Flashlight', svgFlash);
    right.appendChild(torchBtn);
    if (!torchBtn.__wired){
      torchBtn.addEventListener('click', ()=> toggleTorch(video, torchBtn), { passive:true });
      torchBtn.__wired = true;
    }

    const switchBtn = makeBtn('switch-camera-btn','Switch camera', svgSwitch);
    right.appendChild(switchBtn);
    if (!switchBtn.__wired){
      switchBtn.addEventListener('click', ()=> switchCamera(video), { passive:true });
      switchBtn.__wired = true;
    }

    // Initialize camera id
    const track = video.srcObject && video.srcObject.getVideoTracks ? video.srcObject.getVideoTracks()[0] : null;
    if (track && track.getSettings) currentDeviceId = track.getSettings().deviceId || currentDeviceId;
  }

  window.openBarcodeScanner = function(context){
    const r = originalOpen.apply(this, arguments);
    setTimeout(ensureControls, 60);
    return r;
  };
})();

