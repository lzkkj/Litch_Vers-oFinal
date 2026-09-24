(() => {
  'use strict';

  if (document.body.dataset.page !== 'partners') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // =========================================================
  // 1. CTA do hero leva até a equipe VYRA
  // =========================================================
  const teamButton = qs('[data-scroll-team]');
  const teamSection = qs('#vyra-team');

  if (teamButton && teamSection) {
    teamButton.addEventListener('click', () => {
      teamSection.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  }

  // =========================================================
  // 2. Contadores animados — executam uma única vez
  // =========================================================
  const counters = qsa('[data-counter]');

  const runCounter = element => {
    const target = Number(element.dataset.counter || 0);

    if (reduceMotion) {
      element.textContent = target;
      return;
    }

    const duration = 720;
    const start = performance.now();

    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.55 });

    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  // =========================================================
  // 3. Painel interativo da parceria
  // =========================================================
  const signalData = {
    identity: {
      title: 'Independent identities',
      text: 'Litch and VYRA remain visually distinct while sharing the same partnership space.',
      meter: '72%',
      index: '01'
    },
    experience: {
      title: 'Ideas become experience',
      text: 'The partnership is represented through interface, motion and presentation — not just through a name in the footer.',
      meter: '86%',
      index: '02'
    },
    connection: {
      title: 'Projects can connect',
      text: 'The partner page creates a clear path between Litch, VYRA and the people representing the collaboration.',
      meter: '100%',
      index: '03'
    }
  };

  const tabs = qsa('[data-partner-tab]');
  const signalCard = qs('.partner-signal-card');
  const signalTitle = qs('#partnerSignalTitle');
  const signalText = qs('#partnerSignalText');
  const signalMeter = qs('#partnerSignalMeter');
  const signalTop = qs('.partner-signal-card__top span');

  const updateSignal = key => {
    const data = signalData[key];
    if (!data || !signalCard) return;

    tabs.forEach(tab => {
      const active = tab.dataset.partnerTab === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    signalCard.classList.remove('is-switching');
    void signalCard.offsetWidth;
    signalCard.classList.add('is-switching');

    if (signalTitle) signalTitle.textContent = data.title;
    if (signalText) signalText.textContent = data.text;
    if (signalMeter) signalMeter.style.width = data.meter;
    if (signalTop) signalTop.textContent = `LIVE COLLABORATION / ${data.index}`;
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => updateSignal(tab.dataset.partnerTab));
  });
})();
