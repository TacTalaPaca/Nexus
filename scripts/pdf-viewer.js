class PDFViewer {
    constructor() {
        // Make instance globally available
        window.PDFViewer = this.constructor;
        
        // Check if viewer elements exist before initializing
        if (document.querySelector('.pdf-viewer')) {
            this.initializeElements();
            this.setupEventListeners();
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.minSwipeDistance = 50;
        }
    }

    initializeElements() {
        this.viewer = document.querySelector('.pdf-viewer');
        this.canvas = document.querySelector('.pdf-page');
        this.ctx = this.canvas.getContext('2d');
        this.currentPage = 1;
        this.pdfDoc = null;
        this.pageRendering = false;
        this.pageNumPending = null;

        // Set up PDF.js
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    }

    setupEventListeners() {
        // Book cover click events
        document.querySelectorAll('.book-cover').forEach(cover => {
            cover.addEventListener('click', (e) => {
                e.preventDefault();
                this.openPDF(cover.dataset.pdf);
            });
        });

        document.querySelector('.close-pdf').addEventListener('click', () => this.closePDF());
        document.querySelector('.prev-page').addEventListener('click', () => this.changePage(-1));
        document.querySelector('.next-page').addEventListener('click', () => this.changePage(1));

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closePDF();
        });

        // Add touch events for swipe
        this.viewer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, false);

        this.viewer.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, false);

        // Prevent default touch behavior to avoid browser navigation gestures
        this.viewer.addEventListener('touchmove', (e) => {
            if (Math.abs(e.changedTouches[0].screenX - this.touchStartX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        // Add keyboard arrow keys support
        document.addEventListener('keydown', (e) => {
            if (!this.viewer.classList.contains('active')) return;
            
            if (e.key === 'ArrowLeft') this.changePage(-1);
            if (e.key === 'ArrowRight') this.changePage(1);
        });
    }

    async openPDF(url) {
        try {
            const loadingTask = pdfjsLib.getDocument(url);
            this.pdfDoc = await loadingTask.promise;
            
            this.currentPage = 1;
            document.querySelector('.total-pages').textContent = this.pdfDoc.numPages;
            
            this.viewer.classList.add('active');
            this.renderPage(this.currentPage);
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    }

    closePDF() {
        this.viewer.classList.remove('active');
        setTimeout(() => {
            this.pdfDoc = null;
            this.currentPage = 1;
        }, 300);
    }

    async renderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
            return;
        }

        this.pageRendering = true;
        const page = await this.pdfDoc.getPage(num);
        
        const wrapper = document.querySelector('.page-wrapper');
        const viewport = page.getViewport({ scale: 1 });
        
        // Calculate scale to fit height while maintaining aspect ratio
        const heightScale = (wrapper.clientHeight / viewport.height) * 0.95;
        const scaledViewport = page.getViewport({ scale: heightScale });

        this.canvas.width = scaledViewport.width;
        this.canvas.height = scaledViewport.height;

        try {
            await page.render({
                canvasContext: this.ctx,
                viewport: scaledViewport
            }).promise;

            this.pageRendering = false;
            document.querySelector('.current-page').textContent = num;
            document.querySelector('.total-pages').textContent = this.pdfDoc.numPages;

            if (this.pageNumPending !== null) {
                this.renderPage(this.pageNumPending);
                this.pageNumPending = null;
            }
        } catch (error) {
            console.error('Error rendering page:', error);
            this.pageRendering = false;
        }
    }

    async changePage(offset) {
        const newPage = this.currentPage + offset;
        if (newPage >= 1 && newPage <= this.pdfDoc.numPages) {
            const wrapper = document.querySelector('.page-wrapper');
            const direction = offset > 0 ? 'turning-right' : 'turning-left';
            
            wrapper.classList.add('changing', direction);
            
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.currentPage = newPage;
            await this.renderPage(this.currentPage);
            
            wrapper.classList.remove('changing', direction);
            
            // Update page info
            document.querySelector('.current-page').textContent = this.currentPage;
        }
    }

    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) < this.minSwipeDistance) return;

        if (swipeDistance > 0) {
            // Swipe right, go to previous page
            this.changePage(-1);
        } else {
            // Swipe left, go to next page
            this.changePage(1);
        }
    }
}

// Initialize viewer when document is ready and when route changes
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.pdf-viewer')) {
        new PDFViewer();
    }
});
