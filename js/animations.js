  document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('litchTrack');
    const dotsWrap = document.getElementById('litchDots');
    const prevBtn = document.querySelector('.litch-carousel__arrow--prev');
    const nextBtn = document.querySelector('.litch-carousel__arrow--next');

    if (!track || !dotsWrap) return;

    const cards = Array.from(track.children);
    if (!cards.length) return;

    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'litch-carousel__dot';
        dot.setAttribute('aria-label', `Ir para o item ${i + 1}`);
        dot.addEventListener('click', () => scrollToCard(i));
        dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);

    function scrollToCard(index) {
        const card = cards[index];
        if (!card) return;
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }

    function updateActiveDot() {
        const maxScroll = track.scrollWidth - track.clientWidth;

        if (track.scrollLeft <= 4) {
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === 0));
            return;
        }

        if (track.scrollLeft >= maxScroll - 4) {
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === cards.length - 1));
            return;
        }

        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;

        cards.forEach((card, i) => {
            const cardCenter = card.offsetLeft + card.clientWidth / 2;
            const dist = Math.abs(cardCenter - trackCenter);
            if (dist < closestDist) {
                closestDist = dist;
                closest = i;
            }
        });

        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === closest));
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' });
        });
    }

    track.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateActiveDot);
    });

    updateActiveDot();
});

(() => {
    const initLitchGamePreview = () => {
        const preview = document.getElementById('litchGamePreview');
        if (!preview) return;

        const titleEl = document.getElementById('litchPreviewTitle');
        const metaEl = document.getElementById('litchPreviewMeta');
        const priceEl = document.getElementById('litchPreviewPrice');
        const tagsEl = document.getElementById('litchPreviewTags');
        const trailerEl = document.getElementById('litchPreviewTrailer');
        const videoThumbEl = document.getElementById('litchPreviewVideoThumb');
        const imageEl = document.getElementById('litchPreviewImage');
        const eyebrowEl = preview.querySelector('.litch-game-preview__eyebrow');

        const gameItems = Array.from(document.querySelectorAll('.litch-releases .litch-release-row'));

        if (!gameItems.length) return;

        let currentSource = null;
        let hideTimer = null;
        let isPinned = false;
        let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        const setPinned = (value) => {
            isPinned = value;
            preview.classList.toggle('is-pinned', isPinned);
            preview.title = isPinned
                ? 'Preview fixado — clique fora ou pressione ESC para fechar'
                : 'Clique para fixar este preview';

            if (eyebrowEl) {
                eyebrowEl.textContent = isPinned
                    ? 'Preview fixado • ESC para fechar'
                    : 'Litch Preview • clique para fixar';
            }
        };

        const hidePreviewNow = () => {
            window.clearTimeout(hideTimer);
            setPinned(false);
            preview.classList.remove('is-visible');
            preview.setAttribute('aria-hidden', 'true');

            if (currentSource) {
                currentSource.classList.remove('litch-preview-source-active');
            }

            currentSource = null;
        };

        const getText = (source, selectors) => {
            for (const selector of selectors) {
                const element = source.querySelector(selector);
                const text = element?.textContent?.trim();
                if (text) return text;
            }
            return '';
        };

        const getImage = (source) => {
            const image = source.querySelector('.litch-release-row__img');
            return image?.currentSrc || image?.src || '';
        };

        const getGameData = (source) => {
            const name = getText(source, ['.litch-release-row__name']) || 'Game';
            const genre = getText(source, ['.litch-release-row__genre']);
            const date = getText(source, ['.litch-release-row__date']);
            const price = getText(source, ['.litch-release-row__price-new']);

            const sourceImage = getImage(source);
            const appId = source.dataset.steamAppid || '';

            const trailerUrl = source.dataset.trailerUrl ||
                `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' official trailer')}`;

            const extraImage = source.dataset.previewImage || (
                appId
                    ? `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`
                    : sourceImage
            );

            return {
                name,
                genre,
                date,
                price,
                sourceImage,
                trailerUrl,
                extraImage
            };
        };

        const renderTags = (genre) => {
            tagsEl.innerHTML = '';

            const tags = (genre || '')
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean)
                .slice(0, 4);

            if (!tags.length) {
                const tag = document.createElement('span');
                tag.textContent = 'Litch';
                tagsEl.appendChild(tag);
                return;
            }

            tags.forEach(tagText => {
                const tag = document.createElement('span');
                tag.textContent = tagText;
                tagsEl.appendChild(tag);
            });
        };

        const positionPreview = (source, pointerEvent) => {
            if (isPinned) return;

            const sourceRect = source.getBoundingClientRect();
            const previewRect = preview.getBoundingClientRect();
            const margin = 14;
            const gap = 14;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const pointerX = pointerEvent?.clientX ?? lastPointer.x;
            const pointerY = pointerEvent?.clientY ?? lastPointer.y;

            let left;
            let top;
            let opensLeft = false;

            if (sourceRect.width < viewportWidth * 0.58) {
                left = sourceRect.right + gap;

                if (left + previewRect.width > viewportWidth - margin) {
                    left = sourceRect.left - previewRect.width - gap;
                    opensLeft = true;
                }

                top = sourceRect.top;
            } else {
                left = pointerX + 24;

                if (left + previewRect.width > viewportWidth - margin) {
                    left = pointerX - previewRect.width - 24;
                    opensLeft = true;
                }

                top = pointerY - 54;
            }

            left = Math.max(margin, Math.min(left, viewportWidth - previewRect.width - margin));
            top = Math.max(margin, Math.min(top, viewportHeight - previewRect.height - margin));

            preview.style.left = `${left}px`;
            preview.style.top = `${top}px`;
            preview.classList.toggle('opens-left', opensLeft);
        };

        const showPreview = (source, pointerEvent) => {
            window.clearTimeout(hideTimer);

            if (currentSource && currentSource !== source) {
                currentSource.classList.remove('litch-preview-source-active');
            }

            currentSource = source;
            currentSource.classList.add('litch-preview-source-active');

            const data = getGameData(source);

            titleEl.textContent = data.name;
            metaEl.textContent = data.date || 'Available on Litch';
            priceEl.textContent = data.price || '';
            priceEl.hidden = !data.price;

            renderTags(data.genre);

            trailerEl.href = data.trailerUrl;
            videoThumbEl.src = data.sourceImage;
            videoThumbEl.alt = `Trailer de ${data.name}`;

            imageEl.dataset.fallback = data.sourceImage;
            imageEl.src = data.extraImage || data.sourceImage;
            imageEl.alt = `Imagem de ${data.name}`;

            setPinned(false);
            preview.setAttribute('aria-hidden', 'false');
            preview.classList.add('is-visible');

            requestAnimationFrame(() => positionPreview(source, pointerEvent));
        };

        const scheduleHide = () => {
            if (isPinned) return;

            window.clearTimeout(hideTimer);
            hideTimer = window.setTimeout(hidePreviewNow, 130);
        };

        imageEl.addEventListener('error', () => {
            const fallback = imageEl.dataset.fallback;
            if (fallback && imageEl.src !== fallback) {
                imageEl.src = fallback;
            }
        });

        videoThumbEl.addEventListener('error', () => {
            if (currentSource) {
                const fallback = getImage(currentSource);
                if (fallback && videoThumbEl.src !== fallback) {
                    videoThumbEl.src = fallback;
                }
            }
        });

        gameItems.forEach(source => {
            source.addEventListener('mouseenter', event => {
                if (isPinned) return;

                lastPointer = { x: event.clientX, y: event.clientY };
                showPreview(source, event);
            });

            source.addEventListener('mousemove', event => {
                if (isPinned) return;

                lastPointer = { x: event.clientX, y: event.clientY };

                if (currentSource === source) {
                    positionPreview(source, event);
                }
            });

            source.addEventListener('mouseleave', scheduleHide);
        });

        preview.addEventListener('mouseenter', () => {
            window.clearTimeout(hideTimer);
        });

        preview.addEventListener('mouseleave', scheduleHide);

        preview.addEventListener('click', () => {
            if (!preview.classList.contains('is-visible')) return;

            window.clearTimeout(hideTimer);
            setPinned(true);
        });

        document.addEventListener('click', event => {
            if (!isPinned || preview.contains(event.target)) return;

            const clickedGame = event.target.closest('.litch-releases .litch-release-row');
            hidePreviewNow();

            if (clickedGame) {
                lastPointer = { x: event.clientX, y: event.clientY };
                showPreview(clickedGame, event);
            }
        });

        window.addEventListener('resize', () => {
            if (currentSource && !isPinned) positionPreview(currentSource);
        });

        window.addEventListener('scroll', () => {
            if (preview.classList.contains('is-visible') && !isPinned) {
                scheduleHide();
            }
        }, true);

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') hidePreviewNow();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLitchGamePreview);
    } else {
        initLitchGamePreview();
    }
})();