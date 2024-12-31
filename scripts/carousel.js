document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    
    let currentPosition = 0;
    const slideWidth = 270; // 250px width + 20px gap
    const maxSlides = track.children.length;
    const visibleSlides = Math.floor((track.parentElement.clientWidth) / slideWidth);
    const maxPosition = (maxSlides - visibleSlides) * slideWidth;

    function updateButtons() {
        prevButton.disabled = currentPosition <= 0;
        nextButton.disabled = currentPosition >= maxPosition;
    }

    function slide(direction) {
        if (direction === 'prev' && currentPosition > 0) {
            currentPosition -= slideWidth;
        } else if (direction === 'next' && currentPosition < maxPosition) {
            currentPosition += slideWidth;
        }
        
        track.style.transform = `translateX(-${currentPosition}px)`;
        updateButtons();
    }

    prevButton.addEventListener('click', () => slide('prev'));
    nextButton.addEventListener('click', () => slide('next'));
    
    // Initial button state
    updateButtons();

    // PDF viewer functionality
    const books = document.querySelectorAll('.book-cover');
    const readerContainer = document.querySelector('.reader-container');
    const overlay = document.querySelector('.reader-overlay');
    const closeButton = document.querySelector('.reader-close');
    const canvas = document.getElementById('pdf-viewer');
    const ctx = canvas.getContext('2d');
    const prevPage = document.querySelector('.prev-page');
    const nextPage = document.querySelector('.next-page');
    const currentPageSpan = document.querySelector('.current-page');
    const totalPagesSpan = document.querySelector('.total-pages');

    let currentPdfPage = 1;
    let pdfDocument = null;

    async function loadPdf(url) {
        try {
            const loadingTask = pdfjsLib.getDocument(url);
            pdfDocument = await loadingTask.promise;
            totalPagesSpan.textContent = pdfDocument.numPages;
            renderPage(1);
        } catch (error) {
            console.log('Creating blank pages');
            createBlankPages();
        }
    }

    function createBlankPages() {
        const placeholderTexts = [
            "Welcome to our e-book!",
            "This is a sample page",
            "Turn the page to continue...",
            "Reading is an adventure",
            "Knowledge is power",
            "Keep exploring",
            "Almost there",
            "What's next?",
            "The journey continues",
            "Thank you for reading"
        ];

        pdfDocument = {
            numPages: 10,
            getPage: (pageNum) => ({
                getViewport: () => ({ width: 595, height: 842 }),
                render: () => new Promise(resolve => {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Add text
                    ctx.fillStyle = '#212121';
                    ctx.font = '24px "Space Grotesk"';
                    ctx.textAlign = 'center';
                    ctx.fillText(placeholderTexts[pageNum - 1], canvas.width/2, canvas.height/2);
                    
                    resolve();
                })
            })
        };
        totalPagesSpan.textContent = pdfDocument.numPages;
        renderPage(1);
    }

    async function renderPage(pageNumber) {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        
        // Calculate scale to fit better in the container
        const containerWidth = window.innerWidth * 0.7;  // Reduced from 0.8
        const containerHeight = window.innerHeight * 0.7; // Reduced from 0.8
        const scale = Math.min(
            containerWidth / viewport.width,
            containerHeight / viewport.height
        ) * 0.9; // Additional 10% reduction for margins
        
        const scaledViewport = page.getViewport({ scale });
        
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
            canvasContext: ctx,
            viewport: scaledViewport
        }).promise;

        currentPageSpan.textContent = pageNumber;
        currentPdfPage = pageNumber;
        
        prevPage.disabled = pageNumber <= 1;
        nextPage.disabled = pageNumber >= pdfDocument.numPages;

        // Adjust dark mode text for blank pages
        if (document.body.classList.contains('dark-mode') && !pdfDocument.getDocument) {
            ctx.fillStyle = 'white';
            ctx.fillText(placeholderTexts[pageNumber - 1], canvas.width/2, canvas.height/2);
        }
    }

    function openReader(book) {
        const pdfUrl = book.dataset.pdf;
        readerContainer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        loadPdf(pdfUrl);
    }

    function closeReader() {
        readerContainer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        pdfDocument = null;
        currentPdfPage = 1;
    }

    prevPage.addEventListener('click', () => {
        if (currentPdfPage > 1) {
            renderPage(currentPdfPage - 1);
        }
    });

    nextPage.addEventListener('click', () => {
        if (currentPdfPage < pdfDocument.numPages) {
            renderPage(currentPdfPage + 1);
        }
    });

    books.forEach(book => {
        book.addEventListener('click', () => openReader(book));
    });

    closeButton.addEventListener('click', closeReader);
    overlay.addEventListener('click', closeReader);
});
