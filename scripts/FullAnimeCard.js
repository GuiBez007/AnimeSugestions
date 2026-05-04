/**
 * FullAnimeCard.js
 * Converted from T02_GameCard.jsx and GameSelector.jsx
 */

export class FullAnimeCard {
    constructor(animeObj, currentLanguage = 'pt', onClose) {
        this.currentLanguage = currentLanguage;
        this.rawAnimeObj = animeObj;
        this.animeObj = this.normalizeData(animeObj);
        this.recommender = animeObj.recommendedBy;
        this.video = animeObj.video;
        this.arcs = animeObj.arcs;
        this.episodesPerArc = animeObj.episodesPerArc;
        this.animeStatus = animeObj.animeStatus;
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
        this.mainVideoElem = null;
        this.titleElem = null;
        this.synopsisElem = null;
        this.imageStrip = null;
        this.chapterItems = [];
    }

    normalizeData(anime) {
        // If data is already in "Game" format, return it
        if (anime.chapter_1 || anime.game_1) return anime;

        const synopsis = this.currentLanguage === 'en' ? (anime.synopsis || anime.synopsisPT) : (anime.synopsisPT || anime.synopsis);

        // Otherwise convert simple anime object to "Game" format
        return {
            chapter_1: {
                title: anime.title,
                synopsis: synopsis,
                notes: anime.notes,
                imgs: anime.imgs || { 0: anime.thumb },
                url: anime.url
            }
        };
    }

    getYouTubeEmbed(url) {
        if (!url) return null;
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    getYouTubeThumb(url) {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '';
    }

    getCarouselMedia() {
        const imgs = Object.values(this.selectedChapter.imgs || {});
        if (this.video) {
            const videoEmbed = this.getYouTubeEmbed(this.video);
            if (videoEmbed) {
                return [{ type: 'video', url: videoEmbed, thumb: this.getYouTubeThumb(this.video) }, ...imgs.map(url => ({ type: 'image', url }))];
            }
        }
        return imgs.map(url => ({ type: 'image', url }));
    }

    render() {
        const chapters = Object.values(this.animeObj)
            .filter(obj => typeof obj === 'object' && obj !== null && obj.title);
        
        const mediaItems = this.getCarouselMedia();
        const mainItem = mediaItems[this.activeIdx];

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
        mainCover.onmouseenter = () => { this.isHoveringMainCover = true; };
        mainCover.onmouseleave = () => { this.isHoveringMainCover = false; };
        
        this.mainImgElem = document.createElement('img');
        this.mainImgElem.style.width = '100%';
        this.mainImgElem.style.height = '100%';
        mainCover.appendChild(this.mainImgElem);

        if (mainItem && mainItem.type === 'video') {
            this.mainVideoElem = document.createElement('iframe');
            this.mainVideoElem.className = 'anime-main-video';
            this.mainVideoElem.style.width = '100%';
            this.mainVideoElem.style.height = '100%';
            this.mainVideoElem.style.border = 'none';
            this.mainVideoElem.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            this.mainVideoElem.allowFullscreen = true;
            
            try {
                const videoUrl = new URL(mainItem.url);
                videoUrl.searchParams.set('enablejsapi', '1');
                this.mainVideoElem.src = videoUrl.toString();
            } catch (err) {
                this.mainVideoElem.src = mainItem.url;
            }
            
            mainCover.appendChild(this.mainVideoElem);
            this.mainImgElem.style.display = 'none';
        } else if (mainItem) {
            this.mainImgElem.src = mainItem.url;
            this.mainImgElem.alt = this.selectedChapter.title;
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
        
        const carouselHint = document.createElement('div');
        carouselHint.className = 'anime-carousel-hint';
        carouselHint.textContent = 'Pare o carousel deixando o mouse em cima da imagem grande';
        
        leftSection.append(mainCover, stripWrapper, carouselHint);

        // Center Section: Info
        const centerSection = document.createElement('section');
        centerSection.className = 'anime-center-section';

        const info = document.createElement('div');
        info.className = 'anime-info';

        const badgesRow = document.createElement('div');
        badgesRow.className = 'anime-badges-row';

        if (this.arcs) {
            const bArcs = document.createElement('span');
            bArcs.className = 'anime-badge blue';
            bArcs.textContent = `Arcos/Temporadas: ${this.arcs}`;
            badgesRow.appendChild(bArcs);
        }

        if (this.episodesPerArc) {
            const bEpisodes = document.createElement('span');
            bEpisodes.className = 'anime-badge blue';
            bEpisodes.textContent = `Média de episódios: ${this.episodesPerArc}`;
            badgesRow.appendChild(bEpisodes);
        }

        const currentStatus = this.rawAnimeObj.status || 'to-watch';
        const actionGroup = document.createElement('div');
        actionGroup.className = `anime-action-group ${currentStatus}`;

        const favBtn = document.createElement('button');
        favBtn.className = `anime-fav-btn-group ${this.rawAnimeObj.favorite ? 'active' : ''}`;
        favBtn.innerHTML = '⭐';
        favBtn.title = this.rawAnimeObj.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos';

        const customDropdown = document.createElement('div');
        customDropdown.className = 'anime-custom-dropdown';

        const dropdownTrigger = document.createElement('div');
        dropdownTrigger.className = 'anime-dropdown-trigger';
        
        const statuses = [
            { id: 'to-watch', label: 'Assistir' },
            { id: 'watched', label: 'Assistido' },
            { id: 'hyped', label: 'Hypado' }
        ];

        const currentStatusObj = statuses.find(s => s.id === currentStatus);
        dropdownTrigger.textContent = currentStatusObj ? currentStatusObj.label : 'Assistir';

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'anime-dropdown-menu';

        statuses.forEach(st => {
            const optElem = document.createElement('div');
            optElem.className = `anime-dropdown-item ${currentStatus === st.id ? 'active' : ''}`;
            optElem.textContent = st.label;
            optElem.onclick = (e) => {
                e.stopPropagation();
                const newStatus = st.id;
                this.rawAnimeObj.status = newStatus;
                
                dropdownTrigger.textContent = st.label;
                dropdownMenu.classList.remove('open');
                
                dropdownMenu.querySelectorAll('.anime-dropdown-item').forEach(i => i.classList.remove('active'));
                optElem.classList.add('active');

                actionGroup.className = `anime-action-group ${newStatus}`;

                showSaveButton();
                if (typeof window.render === 'function') window.render();
            };
            dropdownMenu.appendChild(optElem);
        });

        dropdownTrigger.onclick = (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('open');
        };

        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('open');
        });

        customDropdown.append(dropdownTrigger, dropdownMenu);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'anime-save-btn-group';
        saveBtn.innerHTML = '💾';
        saveBtn.title = 'Salvar alterações no Local Storage';
        saveBtn.style.display = 'none';

        const showSaveButton = () => {
            saveBtn.style.display = 'inline-flex';
        };

        favBtn.onclick = (e) => {
            e.stopPropagation();
            this.rawAnimeObj.favorite = !this.rawAnimeObj.favorite;
            favBtn.classList.toggle('active', this.rawAnimeObj.favorite);
            showSaveButton();
            if (typeof window.render === 'function') window.render();
        };

        saveBtn.onclick = (e) => {
            e.stopPropagation();
            const savedData = JSON.parse(localStorage.getItem('animeSuggestionsData') || '{}');
            savedData[this.rawAnimeObj.title] = {
                favorite: this.rawAnimeObj.favorite,
                status: this.rawAnimeObj.status
            };
            localStorage.setItem('animeSuggestionsData', JSON.stringify(savedData));
            saveBtn.style.display = 'none';
            this.hasSaved = true;
        };

        actionGroup.append(favBtn, customDropdown, saveBtn);
        badgesRow.appendChild(actionGroup);

        const titleRow = document.createElement('div');
        titleRow.className = 'anime-title-row';

        this.titleElem = document.createElement('h3');
        this.titleElem.className = 'anime-title';
        this.titleElem.textContent = this.selectedChapter.title;
        titleRow.appendChild(this.titleElem);

        this.synopsisElem = document.createElement('p');
        this.synopsisElem.className = 'anime-synopsis';
        this.synopsisElem.textContent = this.selectedChapter.synopsis;

        const notesValue = this.selectedChapter.notes || this.animeObj.notes || this.rawAnimeObj.notes || "Excelente anime, recomendo assistir!";
        
        const notesWrapper = document.createElement('div');
        notesWrapper.className = 'anime-notes-wrapper';

        const notesTitle = document.createElement('div');
        notesTitle.className = 'anime-notes-title';
        notesTitle.textContent = `Notas do ${this.recommender || 'Recomendador'}`;

        const notesText = document.createElement('p');
        notesText.className = 'anime-notes-text';
        notesText.textContent = notesValue;

        const notesFooter = document.createElement('div');
        notesFooter.className = 'anime-notes-footer';

        if (this.selectedChapter.url) {
            const viewLink = document.createElement('a');
            viewLink.className = 'view-btn';
            viewLink.href = this.selectedChapter.url;
            viewLink.target = '_blank';
            viewLink.rel = 'noreferrer';
            viewLink.innerHTML = '<span>+ INFO</span>';
            notesFooter.appendChild(viewLink);
        }

        notesWrapper.append(notesTitle, notesText, notesFooter);

        info.append(badgesRow, titleRow, this.synopsisElem, notesWrapper);
        centerSection.appendChild(info);

        // Right Section: Sidebar (if multiple seasons/chapters)
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
        const mediaItems = this.getCarouselMedia();
        mediaItems.forEach((item, i) => {
            const thumb = document.createElement('img');
            thumb.className = `anime-strip-thumb ${item.type === 'video' ? 'video-thumb' : ''} ${i === this.activeIdx ? 'active' : ''}`;
            thumb.src = item.type === 'video' ? item.thumb : item.url;
            thumb.onclick = (e) => {
                e.stopPropagation();
                this.selectThumb(i);
            };
            this.imageStrip.appendChild(thumb);
        });
    }

    startTimer() {
        const mediaItems = this.getCarouselMedia();
        if (mediaItems.length <= 1) return;
        this.stopTimer();

        if (!this.messageListenerAdded) {
            window.addEventListener('message', (event) => {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    if (data.event === 'infoDelivery' && data.info && typeof data.info.playerState !== 'undefined') {
                        if (data.info.playerState === 1) { // 1 = YT.PlayerState.PLAYING
                            this.videoIsPlaying = true;
                        } else if (data.info.playerState === 2) { // 2 = YT.PlayerState.PAUSED
                            this.videoIsPlaying = false;
                        }
                    }
                } catch (e) {
                    // ignore
                }
            });
            this.messageListenerAdded = true;
        }

        this.interval = setInterval(() => {
            if (this.videoIsPlaying || this.isHoveringMainCover) return;
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
        const mediaItems = this.getCarouselMedia();
        this.activeIdx = (this.activeIdx - 1 + mediaItems.length) % mediaItems.length;
        this.updateUI();
    }

    next() {
        const mediaItems = this.getCarouselMedia();
        this.activeIdx = (this.activeIdx + 1) % mediaItems.length;
        this.updateUI();
    }

    selectThumb(i) {
        this.activeIdx = i;
        this.updateUI();
    }

    updateUI() {
        const mediaItems = this.getCarouselMedia();
        const currentMedia = mediaItems[this.activeIdx];

        if (currentMedia) {
            this.videoIsPlaying = false;
            if (currentMedia.type === 'video') {
                if (!this.mainVideoElem) {
                    this.mainVideoElem = document.createElement('iframe');
                    this.mainVideoElem.className = 'anime-main-video';
                    this.mainVideoElem.style.width = '100%';
                    this.mainVideoElem.style.height = '100%';
                    this.mainVideoElem.style.border = 'none';
                    this.mainVideoElem.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    this.mainVideoElem.allowFullscreen = true;
                    const cover = this.container.querySelector('.anime-main-cover');
                    if (cover) {
                        cover.insertBefore(this.mainVideoElem, cover.querySelector('.anime-expand-hint'));
                    }
                }
                try {
                    const videoUrl = new URL(currentMedia.url);
                    videoUrl.searchParams.set('enablejsapi', '1');
                    this.mainVideoElem.src = videoUrl.toString();
                } catch (err) {
                    this.mainVideoElem.src = currentMedia.url;
                }
                this.mainVideoElem.style.display = 'block';
                if (this.mainImgElem) this.mainImgElem.style.display = 'none';
            } else {
                if (this.mainVideoElem) {
                    this.mainVideoElem.src = '';
                    this.mainVideoElem.style.display = 'none';
                }
                if (this.mainImgElem) {
                    this.mainImgElem.src = currentMedia.url;
                    this.mainImgElem.alt = this.selectedChapter.title;
                    this.mainImgElem.style.display = 'block';
                }
            }
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
        const mediaItems = this.getCarouselMedia();
        const currentMedia = mediaItems[this.activeIdx];
        if (!currentMedia) return;

        const lightbox = document.createElement('div');
        lightbox.className = 'anime-lightbox';
        lightbox.onclick = () => lightbox.remove();

        const frame = document.createElement('div');
        frame.className = 'anime-lightbox-frame';
        frame.onclick = (e) => e.stopPropagation();

        if (currentMedia.type === 'video') {
            const video = document.createElement('iframe');
            video.className = 'anime-lightbox-video';
            video.style.width = '100%';
            video.style.height = '450px';
            video.style.border = 'none';
            video.src = currentMedia.url;
            video.allowFullscreen = true;
            frame.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.className = 'anime-lightbox-img';
            img.src = currentMedia.url;
            frame.appendChild(img);
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'anime-lightbox-overlay';
        overlay.innerHTML = `
            <h2 class="anime-lightbox-title">${this.selectedChapter.title}</h2>
            <p class="anime-lightbox-synopsis">${this.selectedChapter.synopsis}</p>
        `;

        frame.append(overlay);
        
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
        setTimeout(() => {
            overlay.remove();
            if (this.hasSaved) {
                location.reload();
            }
        }, 200);
        if (this.onClose) this.onClose();
    }
}
