/**
 * FullAnimeCard.js
 * Converted from T02_GameCard.jsx and GameSelector.jsx
 */

export class FullAnimeCard {
    constructor(animeObj, onClose) {
        this.animeObj = this.normalizeData(animeObj);
        this.recommender = animeObj.recommendedBy;
        this.onClose = onClose;
        this.selectedChapter = this.animeObj.chapter_1 || Object.values(this.animeObj).find(v => typeof v === 'object' && v.title);
        this.activeIdx = 0;
        this.expanded = false;
        this.hovering = false;
        this.interval = null;
        this.container = null;
        this.overlay = null;
        
        // DOM References for smooth updates
        this.mainImgElem = null;
        this.titleElem = null;
        this.synopsisElem = null;
        this.imageStrip = null;
        this.chapterItems = [];
    }

    normalizeData(anime) {
        // If data is already in "Game" format, return it
        if (anime.chapter_1 || anime.game_1) return anime;

        // Otherwise convert simple anime object to "Game" format
        return {
            chapter_1: {
                title: anime.title,
                synopsis: anime.synopsisPT || anime.synopsis,
                imgs: anime.imgs || { 0: anime.thumb },
                url: anime.url
            }
        };
    }

    render() {
        const chapters = Object.values(this.animeObj)
            .filter(obj => typeof obj === 'object' && obj !== null && obj.title);
        
        const imgs = Object.values(this.selectedChapter.imgs || {});
        const mainImg = imgs[this.activeIdx];

        const overlay = document.createElement('div');
        overlay.className = 'anime-card-overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) this.close();
        };

        const modal = document.createElement('div');
        const recommenderLower = (this.recommender || '').toLowerCase();
        modal.className = `anime-card-modal border-${recommenderLower}`;
        this.container = modal;

        // Left Section: Cover + Carousel
        const leftSection = document.createElement('section');
        leftSection.className = 'anime-left-section';
        leftSection.onmouseenter = () => { this.hovering = true; this.stopTimer(); };
        leftSection.onmouseleave = () => { this.hovering = false; this.startTimer(); };

        const mainCover = document.createElement('div');
        mainCover.className = 'anime-main-cover';
        mainCover.title = "Click to expand";
        mainCover.onclick = () => this.openLightbox();
        
        this.mainImgElem = document.createElement('img');
        if (mainImg) {
            this.mainImgElem.src = mainImg;
            this.mainImgElem.alt = this.selectedChapter.title;
            mainCover.appendChild(this.mainImgElem);
        } else {
            const placeholder = document.createElement('span');
            placeholder.className = 'anime-cover-placeholder';
            placeholder.textContent = '?';
            mainCover.appendChild(placeholder);
        }

        const expandHint = document.createElement('div');
        expandHint.className = 'anime-expand-hint';
        expandHint.textContent = '⛶';
        mainCover.appendChild(expandHint);

        const stripWrapper = document.createElement('div');
        stripWrapper.className = 'anime-strip-wrapper';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'anime-strip-arrow';
        prevBtn.innerHTML = '‹';
        prevBtn.onclick = () => this.prev();

        this.imageStrip = document.createElement('nav');
        this.imageStrip.className = 'anime-image-strip';
        this.renderThumbnails();

        const nextBtn = document.createElement('button');
        nextBtn.className = 'anime-strip-arrow';
        nextBtn.innerHTML = '›';
        nextBtn.onclick = () => this.next();

        stripWrapper.append(prevBtn, this.imageStrip, nextBtn);
        leftSection.append(mainCover, stripWrapper);

        // Center Section: Info
        const centerSection = document.createElement('section');
        centerSection.className = 'anime-center-section';

        const info = document.createElement('div');
        info.className = 'anime-info';
        this.titleElem = document.createElement('h3');
        this.titleElem.className = 'anime-title';
        this.titleElem.textContent = this.selectedChapter.title;

        this.synopsisElem = document.createElement('p');
        this.synopsisElem.className = 'anime-synopsis';
        this.synopsisElem.textContent = this.selectedChapter.synopsis;

        info.append(this.titleElem, this.synopsisElem);

        const buttons = document.createElement('div');
        buttons.className = 'anime-action-buttons';
        // Mock buttons
        const btnLink = document.createElement('button');
        btnLink.className = 'anime-action-btn';
        btnLink.textContent = 'Ver no site';
        if (recommenderLower) {
            btnLink.style.background = `var(--color-${recommenderLower})`;
            btnLink.style.boxShadow = `0 5px 15px rgba(0,0,0,0.3)`;
            // Contrast fix: black outline for white text
            btnLink.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)';
        }
        btnLink.onclick = () => window.open(this.selectedChapter.url, '_blank');
        buttons.appendChild(btnLink);

        centerSection.append(info, buttons);

        // Right Section: Sidebar (if multiple seasons)
        if (chapters.length > 1) {
            const rightSection = document.createElement('section');
            rightSection.className = 'anime-right-section';

            const rightTitle = document.createElement('div');
            rightTitle.className = 'anime-right-title';
            rightTitle.textContent = 'TEMPORADAS';
            rightSection.appendChild(rightTitle);

            chapters.forEach(chapter => {
                const item = document.createElement('div');
                item.className = `anime-chapter-item ${chapter === this.selectedChapter ? 'active' : ''}`;
                item.onclick = () => this.changeChapter(chapter);
                
                const thumb = document.createElement('img');
                thumb.className = 'anime-chapter-thumb';
                thumb.src = chapter.imgs ? Object.values(chapter.imgs)[0] : '';
                
                const label = document.createElement('span');
                label.className = 'anime-chapter-label';
                label.textContent = chapter.title;

                item.append(thumb, label);
                rightSection.appendChild(item);
            });
            modal.style.gridTemplateColumns = '280px 1fr 220px';
            modal.append(leftSection, centerSection, rightSection);
        } else {
            modal.style.gridTemplateColumns = '350px 1fr';
            modal.append(leftSection, centerSection);
        }

        const closeBtn = document.createElement('button');
        closeBtn.className = 'anime-modal-close';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = () => this.close();
        modal.appendChild(closeBtn);

        overlay.appendChild(modal);
        this.overlay = overlay;
        document.body.appendChild(overlay);

        this.startTimer();

        // Keyboard support
        this.keydownHandler = (e) => {
            if (e.key === 'Escape') this.close();
        };
        window.addEventListener('keydown', this.keydownHandler);
        
        return overlay;
    }

    renderThumbnails() {
        this.imageStrip.innerHTML = '';
        const imgs = Object.values(this.selectedChapter.imgs || {});
        imgs.forEach((img, i) => {
            const thumb = document.createElement('img');
            thumb.className = `anime-strip-thumb ${i === this.activeIdx ? 'active' : ''}`;
            thumb.src = img;
            thumb.onclick = (e) => {
                e.stopPropagation();
                this.selectThumb(i);
            };
            this.imageStrip.appendChild(thumb);
        });
    }

    startTimer() {
        const imgs = Object.values(this.selectedChapter.imgs || {});
        if (imgs.length <= 1) return;
        this.stopTimer();
        this.interval = setInterval(() => {
            this.next();
        }, 3000);
    }

    stopTimer() {
        if (this.interval) clearInterval(this.interval);
    }

    changeChapter(chapter) {
        this.selectedChapter = chapter;
        this.activeIdx = 0;
        this.renderThumbnails(); // Image strip usually needs full refresh if images change
        this.updateUI();
        
        // Update selection in sidebar
        const sidebarItems = this.container.querySelectorAll('.anime-chapter-item');
        sidebarItems.forEach(item => {
            const label = item.querySelector('.anime-chapter-label');
            if (label && label.textContent === chapter.title) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    prev() {
        const imgs = Object.values(this.selectedChapter.imgs || {});
        this.activeIdx = (this.activeIdx - 1 + imgs.length) % imgs.length;
        this.updateUI();
    }

    next() {
        const imgs = Object.values(this.selectedChapter.imgs || {});
        this.activeIdx = (this.activeIdx + 1) % imgs.length;
        this.updateUI();
    }

    selectThumb(i) {
        this.activeIdx = i;
        this.updateUI();
    }

    updateUI() {
        const imgs = Object.values(this.selectedChapter.imgs || {});
        const currentImg = imgs[this.activeIdx];

        // Update Main Image
        if (this.mainImgElem && currentImg) {
            this.mainImgElem.src = currentImg;
            this.mainImgElem.alt = this.selectedChapter.title;
        }

        // Update Thumbnails
        const thumbs = this.imageStrip.querySelectorAll('.anime-strip-thumb');
        thumbs.forEach((thumb, i) => {
            if (i === this.activeIdx) {
                thumb.classList.add('active');
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                thumb.classList.remove('active');
            }
        });

        // Update Text Content
        if (this.titleElem) this.titleElem.textContent = this.selectedChapter.title;
        if (this.synopsisElem) this.synopsisElem.textContent = this.selectedChapter.synopsis;
    }

    openLightbox() {
        const imgs = Object.values(this.selectedChapter.imgs || {});
        const mainImg = imgs[this.activeIdx];
        if (!mainImg) return;

        const lightbox = document.createElement('div');
        lightbox.className = 'anime-lightbox';
        lightbox.onclick = () => lightbox.remove();

        const frame = document.createElement('div');
        frame.className = 'anime-lightbox-frame';
        frame.onclick = (e) => e.stopPropagation();

        const img = document.createElement('img');
        img.className = 'anime-lightbox-img';
        img.src = mainImg;
        
        const overlay = document.createElement('div');
        overlay.className = 'anime-lightbox-overlay';
        overlay.innerHTML = `
            <h2 class="anime-lightbox-title">${this.selectedChapter.title}</h2>
            <p class="anime-lightbox-synopsis">${this.selectedChapter.synopsis}</p>
        `;

        frame.append(img, overlay);
        
        const close = document.createElement('button');
        close.className = 'anime-lightbox-close';
        close.innerHTML = '✕';
        close.onclick = () => lightbox.remove();
        
        lightbox.append(frame, close);
        document.body.appendChild(lightbox);
    }

    close() {
        this.stopTimer();
        window.removeEventListener('keydown', this.keydownHandler);
        const overlay = this.container.parentElement;
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 200);
        if (this.onClose) this.onClose();
    }
}
