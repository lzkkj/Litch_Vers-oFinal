(() => {
  'use strict';

  const body = document.body;
  const page = body.dataset.page || 'site';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // =========================================================
  // 1. HEADER RESPONSIVO + ESTADO DE SCROLL
  // =========================================================
  function setupHeader() {
    const header = qs('header');
    const nav = qs('.litch-nav', header || document);
    if (!header || !nav) return;

    const activeHrefByPage = {
      home: 'index.html',
      store: 'game-store.html',
      plus: 'litch+.html',
      plans: 'litch+.html',
      trial: 'litch+.html',
      community: 'community.html',
      about: 'about.html',
      help: 'help-me.html',
      partners: 'partners.html'
    };

    const activeHref = activeHrefByPage[page];
    if (activeHref) {
      qsa('a', nav).forEach(link => {
        const href = (link.getAttribute('href') || '').split('#')[0];
        const isActive = href === activeHref;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }

    if (!qs('.litch-menu-toggle', header)) {
      const menuButton = document.createElement('button');
      menuButton.type = 'button';
      menuButton.className = 'litch-menu-toggle';
      menuButton.setAttribute('aria-label', 'Abrir menu');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.innerHTML = '<span class="litch-menu-toggle__lines" aria-hidden="true"></span>';
      header.appendChild(menuButton);

      const closeMenu = () => {
        body.classList.remove('nav-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Abrir menu');
      };

      menuButton.addEventListener('click', () => {
        const isOpen = body.classList.toggle('nav-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      });

      qsa('a', nav).forEach(link => link.addEventListener('click', closeMenu));

      document.addEventListener('click', event => {
        if (!body.classList.contains('nav-open')) return;
        if (header.contains(event.target)) return;
        closeMenu();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 980) closeMenu();
      });
    }

    const updateHeader = () => body.classList.toggle('is-scrolled', window.scrollY > 16);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // =========================================================
  // 2. BARRA DE PROGRESSO + VOLTAR AO TOPO
  // =========================================================
  function setupScrollUI() {
    const progress = document.createElement('div');
    progress.className = 'litch-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    body.appendChild(progress);

    const backTop = document.createElement('button');
    backTop.type = 'button';
    backTop.className = 'litch-back-top';
    backTop.setAttribute('aria-label', 'Voltar ao topo');
    backTop.innerHTML = '↑';
    body.appendChild(backTop);

    const update = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(1, Math.max(0, window.scrollY / scrollable));
      progress.style.width = `${pct * 100}%`;
      backTop.classList.toggle('is-visible', window.scrollY > 620);
    };

    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
    update();
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  }

  // =========================================================
  // 3. REVEAL NO SCROLL (mesma linguagem de movimento do About)
  // =========================================================
  function setupReveal() {
    const selectorMap = {
      home: [
        '.litch-carousel__header', '.litch-card', '.home-introduction__content',
        '.home-introduction__visual', '.home-explore__header', '.home-explore-card', '.home-final'
      ],
      store: [
        '.litch-game-store__title', '.litch-hero', '.litch-game-store__subtitle',
        '.litch-store-carousel', '.litch-releases__title', '.litch-releases__nav', '.litch-release-row'
      ],
      plus: [
        '.litch-plus_title', '.litch-plus-hero__content', '.litch-plus-hero__visual',
        '.Litch-plus_previewtitle', '.litch-library__row', '.plus-final'
      ],
      community: [
        '.community-intro > *', '.Community-title', '.litch-community-rating',
        '.litch-review-card', '.community-final'
      ],
      help: [
        '.help-hero > *', '.litch-ai', '.help-faq > h2', '.help-faq__grid article'
      ],
      plans: [
        '.litch-plans-page__content > .litch-plus-hero__tag', '.litch-plans-page__title',
        '.litch-plans-page__subtitle', '.litch-plan-card'
      ],
      trial: [
        '.litch-trial-page__content > .litch-plus-hero__tag', '.litch-trial-page__title',
        '.litch-trial-page__subtitle', '.litch-trial-checkout__main', '.litch-trial-summary',
        '.litch-trial-games__header', '.litch-trial-game'
      ],
      about: [],
      partners: [
        '.partners-hero__copy > *', '.partners-hero__stage', '.partner-stat',
        '.partners-story__heading', '.partners-story__text', '.partners-section-heading',
        '.partner-person', '.partner-pillar', '.partners-signal__copy', '.partner-signal-card', '.partners-final'
      ]
    };

    const selectors = selectorMap[page] || [];
    const elements = selectors.flatMap(selector => qsa(selector));
    const unique = [...new Set(elements)];

    unique.forEach((el, index) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('fx-reveal');
      el.style.setProperty('--fx-delay', `${Math.min((index % 5) * 55, 220)}ms`);

      if (index % 7 === 2) el.classList.add('fx-reveal--left');
      if (index % 7 === 5) el.classList.add('fx-reveal--right');
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      unique.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -7% 0px' });

    unique.forEach(el => observer.observe(el));
  }

  // =========================================================
  // 4. SPOTLIGHT QUE SEGUE O MOUSE NOS CARDS
  // =========================================================
  function setupSpotlights() {
    if (!finePointer) return;

    const selectors = [
      '.home-explore-card', '.litch-store-card', '.litch-review-card',
      '.litch-plan-card', '.litch-trial-game', '.litch-trial-summary',
      '.help-faq__grid article', '.litch-ai', '.litch-library__cover',
      '.partner-person', '.partner-pillar', '.partner-signal-card', '.partner-stat'
    ];

    qsa(selectors.join(',')).forEach(card => {
      card.classList.add('fx-spotlight');
      card.addEventListener('mousemove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  // =========================================================
  // 5. TILT 3D — mesma ideia do About, aplicada de forma seletiva
  // =========================================================
  function setupTilt() {
    if (!finePointer || reduceMotion) return;

    const selectorsByPage = {
      home: '.home-explore-card',
      store: '.litch-hero',
      plus: '.litch-plus-hero',
      community: '.litch-review-card',
      help: '.litch-ai',
      plans: '.litch-plan-card',
      trial: '.litch-trial-summary',
      partners: '.partner-person'
    };

    const selector = selectorsByPage[page];
    if (!selector) return;

    qsa(selector).forEach(el => {
      el.classList.add('fx-tilt');
      const max = el.matches('.litch-hero, .litch-plus-hero, .litch-ai') ? 2.1 : 3.1;

      el.addEventListener('mousemove', event => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * max * 2;
        const rotateX = (0.5 - py) * max * 2;
        el.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
        el.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
      });

      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // =========================================================
  // 6. GLOW AMBIENTE DO CURSOR
  // =========================================================
  function setupCursorGlow() {
    if (!finePointer || reduceMotion) return;

    const glow = document.createElement('div');
    glow.className = 'litch-cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let x = targetX;
    let y = targetY;

    document.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
    }, { passive: true });

    const animate = () => {
      x += (targetX - x) * 0.11;
      y += (targetY - y) * 0.11;
      glow.style.transform = `translate3d(${x - 180}px, ${y - 180}px, 0)`;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  // =========================================================
  // 7. PALETA DE PESQUISA GLOBAL
  // =========================================================
  function setupSearchPalette() {
    const triggers = qsa('.litch-search-btn');
    if (!triggers.length) return;

    const palette = document.createElement('div');
    palette.className = 'litch-search-palette';
    palette.setAttribute('aria-hidden', 'true');
    palette.innerHTML = `
      <div class="litch-search-palette__dialog" role="dialog" aria-modal="true" aria-label="Pesquisar na Litch">
        <div class="litch-search-palette__top">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M16.5 16.5L21 21"></path></svg>
          <input class="litch-search-palette__input" type="search" placeholder="Pesquise jogos ou páginas..." autocomplete="off">
          <span class="litch-search-palette__key">ESC</span>
        </div>
        <div class="litch-search-palette__results"></div>
      </div>`;
    body.appendChild(palette);

    const input = qs('.litch-search-palette__input', palette);
    const results = qs('.litch-search-palette__results', palette);

    const pageItems = [
      { title: 'Home', subtitle: 'Página inicial', href: 'index.html', icon: '⌂' },
      { title: 'Game Store', subtitle: 'Catálogo e ofertas', href: 'game-store.html', icon: '▦' },
      { title: 'Litch+', subtitle: 'Streaming e biblioteca', href: 'litch+.html', icon: '+' },
      { title: 'Community', subtitle: 'Avaliações da comunidade', href: 'community.html', icon: '★' },
      { title: 'About', subtitle: 'Conheça a Litch', href: 'about.html', icon: 'L' },
      { title: 'Help-Me!', subtitle: 'Suporte e Litch AI', href: 'help-me.html', icon: '?' },
      { title: 'Partners — VYRA', subtitle: 'Parceria Litch × VYRA', href: 'parceiros.html', icon: '×' }
    ];

    const localItems = [];
    const localSelectors = [
      ['.litch-card', '.litch-card__name', '.litch-card__img', 'Destaque'],
      ['.litch-store-card', '.litch-store-card__name', '.litch-store-card__img', 'Game Store'],
      ['.litch-release-row', '.litch-release-row__name', '.litch-release-row__img', 'Categoria'],
      ['.litch-library__cover', '.litch-library__cover-name', 'img', 'Litch+'],
      ['.litch-review-card', 'h3', null, 'Review']
    ];

    localSelectors.forEach(([selector, nameSelector, imageSelector, subtitle]) => {
      qsa(selector).forEach((el, index) => {
        const title = qs(nameSelector, el)?.textContent?.trim();
        if (!title) return;
        const img = imageSelector ? qs(imageSelector, el)?.getAttribute('src') : '';
        localItems.push({ title, subtitle, el, img, icon: String(index + 1).padStart(2, '0') });
      });
    });

    const allItems = [...pageItems, ...localItems];

    const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));

    const render = query => {
      const term = query.trim().toLocaleLowerCase('pt-BR');
      const items = allItems
        .filter(item => !term || `${item.title} ${item.subtitle}`.toLocaleLowerCase('pt-BR').includes(term))
        .slice(0, 16);

      if (!items.length) {
        results.innerHTML = '<div class="litch-search-palette__empty">Nenhum resultado encontrado.</div>';
        return;
      }

      results.innerHTML = '';
      items.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'litch-search-result';
        const icon = item.img
          ? `<img src="${escapeHtml(item.img)}" alt="">`
          : escapeHtml(item.icon || 'L');
        button.innerHTML = `
          <span class="litch-search-result__icon">${icon}</span>
          <span class="litch-search-result__text"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.subtitle || '')}</span></span>
          <span class="litch-search-result__go">↗</span>`;

        button.addEventListener('click', () => {
          close();
          if (item.el) {
            item.el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            item.el.classList.remove('search-target-pulse');
            requestAnimationFrame(() => item.el.classList.add('search-target-pulse'));
            setTimeout(() => item.el.classList.remove('search-target-pulse'), 1500);
          } else if (item.href) {
            window.location.href = item.href;
          }
        });
        results.appendChild(button);
      });
    };

    const open = () => {
      palette.classList.add('is-open');
      palette.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
      input.value = '';
      render('');
      setTimeout(() => input.focus(), 30);
    };

    const close = () => {
      palette.classList.remove('is-open');
      palette.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
    };

    triggers.forEach(trigger => trigger.addEventListener('click', open));
    input.addEventListener('input', () => render(input.value));
    palette.addEventListener('click', event => { if (event.target === palette) close(); });

    document.addEventListener('keydown', event => {
      const openShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const slashShortcut = event.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName || '');
      if (openShortcut || slashShortcut) {
        event.preventDefault();
        open();
      }
      if (event.key === 'Escape' && palette.classList.contains('is-open')) close();
    });
  }

  // =========================================================
  // 8. COMMUNITY — filtro real das avaliações
  // =========================================================
  function setupCommunity() {
    if (page !== 'community') return;

    const grid = qs('.litch-community-grid');
    if (!grid) return;
    const cards = qsa('.litch-review-card', grid);

    // Estrelas gerais: começam vazias, preenchem uma a uma ao entrar no campo de visão
    const overallStars = qs('.litch-community-rating__stars');
    if (overallStars) {
      const stars = qsa('.rating-star', overallStars);

      const fillStars = () => {
        stars.forEach((star, index) => {
          const delay = reduceMotion ? 0 : index * 170;
          setTimeout(() => {
            star.textContent = '★';
            star.classList.add('is-filled');
          }, delay);
        });
        overallStars.classList.add('is-complete');
      };

      if (reduceMotion || !('IntersectionObserver' in window)) {
        fillStars();
      } else {
        const starObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            fillStars();
            starObserver.unobserve(entry.target);
          });
        }, { threshold: 0.65 });

        starObserver.observe(overallStars);
      }
    }

    const tools = document.createElement('div');
    tools.className = 'community-tools fx-reveal';
    tools.innerHTML = `
      <div class="community-tools__filters" aria-label="Filtrar avaliações">
        <button type="button" class="is-active" data-stars="all">All reviews</button>
        <button type="button" data-stars="5">5 stars</button>
        <button type="button" data-stars="4">4 stars</button>
      </div>
      <input class="community-tools__search" type="search" placeholder="Search a review..." aria-label="Pesquisar avaliações">`;
    grid.parentNode.insertBefore(tools, grid);
    requestAnimationFrame(() => tools.classList.add('is-visible'));

    const buttons = qsa('[data-stars]', tools);
    const search = qs('.community-tools__search', tools);
    let starFilter = 'all';

    const apply = () => {
      const term = search.value.trim().toLowerCase();
      cards.forEach(card => {
        const stars = qs('.litch-review-card__stars', card)?.textContent || '';
        const count = (stars.match(/★/g) || []).length;
        const text = card.textContent.toLowerCase();
        const starMatch = starFilter === 'all' || count === Number(starFilter);
        const textMatch = !term || text.includes(term);
        card.classList.toggle('is-filtered-out', !(starMatch && textMatch));
      });
    };

    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      starFilter = button.dataset.stars;
      apply();
    }));
    search.addEventListener('input', apply);
  }

  // =========================================================
  // 9. HELP — FAQ vira accordion
  // =========================================================
  function setupHelpFaq() {
    if (page !== 'help') return;
    const articles = qsa('.help-faq__grid article');
    articles.forEach((article, index) => {
      article.classList.add('is-collapsible');
      article.tabIndex = 0;
      article.setAttribute('role', 'button');
      article.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      if (index === 0) article.classList.add('is-open');

      const toggle = () => {
        const isOpen = article.classList.toggle('is-open');
        article.setAttribute('aria-expanded', String(isOpen));
      };

      article.addEventListener('click', toggle);
      article.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
      });
    });
  }

  // =========================================================
  // 10. PLANS — seleção visual segura (sem processar compra)
  // =========================================================
  function setupPlans() {
    if (page !== 'plans') return;
    const cards = qsa('.litch-plan-card');
    if (!cards.length) return;

    const toast = document.createElement('div');
    toast.className = 'litch-toast';
    toast.setAttribute('role', 'status');
    body.appendChild(toast);
    let toastTimer;

    cards.forEach(card => {
      const button = qs('.litch-plan-card__cta', card);
      if (!button) return;
      button.type = 'button';
      button.addEventListener('click', () => {
        cards.forEach(item => item.classList.remove('is-selected'));
        card.classList.add('is-selected');
        const plan = qs('.litch-plan-card__name', card)?.textContent?.trim() || 'Plan';
        toast.textContent = `${plan} selected — prototype only, no purchase was made.`;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
      });
    });
  }

  // =========================================================
  // 11. LITCH+ — clique pausa/continua a library
  // =========================================================
  function setupPlusLibrary() {
    if (page !== 'plus') return;
    qsa('.litch-library__row').forEach(row => {
      row.setAttribute('title', 'Click to pause/resume');
      row.addEventListener('click', () => row.classList.toggle('is-paused'));
    });
  }

  // =========================================================
  // 12. STORE — botão do hero leva aos Highlights
  // =========================================================
  function setupStoreHero() {
    if (page !== 'store') return;
    const button = qs('.litch-hero__cta');
    const target = qs('.litch-game-store__subtitle');
    if (!button || !target) return;
    button.type = 'button';
    button.addEventListener('click', () => target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }));
  }

  // =========================================================
  // 13. INTERNAL LINK TRANSITION (leve, sem bloquear ações)
  // =========================================================
  function setupLinkPolish() {
    qsa('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;
      link.addEventListener('pointerdown', () => link.classList.add('is-pressed'));
      link.addEventListener('pointerup', () => link.classList.remove('is-pressed'));
      link.addEventListener('pointerleave', () => link.classList.remove('is-pressed'));
    });
  }

  // =========================================================
  // INIT
  // =========================================================
  function init() {
    setupHeader();
    setupScrollUI();
    setupReveal();
    setupSpotlights();
    setupTilt();
    setupCursorGlow();
    setupSearchPalette();
    setupCommunity();
    setupHelpFaq();
    setupPlans();
    setupPlusLibrary();
    setupStoreHero();
    setupLinkPolish();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
