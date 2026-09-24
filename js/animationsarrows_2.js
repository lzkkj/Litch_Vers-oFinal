document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.litch-store-carousel .js-carousel').forEach(root => {
        const track = root.querySelector('.litch-store-carousel__track');
        const dotsWrap = root.querySelector('.litch-carousel__dots');
        const prevBtn = root.querySelector('.litch-carousel__arrow--prev');
        const nextBtn = root.querySelector('.litch-carousel__arrow--next');

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
});