// Variables globales
let cart = [];
let currentImageIndex = 0;
let galleryImages = [];

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTicketModal();
    initializeGallery();
    initializeServiciosStore();
    initializeCart();
    initializeLightbox();
    initializeImageModal();
    initializeAudioPlayer();
    
    // Agregar efectos de sonido simulados
    addSoundEffects();
});