(function () {
  var section = document.getElementById('tt-quality');
  if (!section) return;

  var title = section.querySelector('.tt-quality__title');
  var desc = section.querySelector('.tt-quality__desc');
  var wrap = document.getElementById('tt-quality-wrap');
  var clients = section.querySelectorAll('.tt-quality__client');
  var cards = Array.from(section.querySelectorAll('.tt-quality__card'));
  var cursor = document.getElementById('tt-quality-cursor');

  if (!cards.length || !wrap) return;

  var total = cards.length;
  var current = 0;
  var isDragging = false;
  var startX = 0;
  var dragDelta = 0;
  var threshold = 80;

  // ── Scroll reveal ─────────────────────────────────────────
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        title && title.classList.add('is-visible');
        setTimeout(function () { desc && desc.classList.add('is-visible'); }, 200);
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });
  observer.observe(section);

  // ── Positions ─────────────────────────────────────────────
  function getWrapMetrics() {
    var ww = wrap.offsetWidth;
    var cardW = cards[0].offsetWidth;
    var center = ww / 2 - cardW / 2;
    var edgePeek = cardW * 0.28;
    return { ww: ww, cardW: cardW, center: center, edgePeek: edgePeek };
  }

  // Only -1, 0, 1 are visible — everything else is hidden off-screen instantly
  function getOffset(i) {
    var offset = ((i - current) % total + total) % total;
    if (offset > Math.floor(total / 2)) offset -= total;
    return offset;
  }

    function positionCards(liveX, animate) {
    var m = getWrapMetrics();
    liveX = liveX || 0;

    cards.forEach(function (card, i) {
      var offset = getOffset(i);
      var isVisible = (offset === -1 || offset === 0 || offset === 1);

      if (!isVisible) {
        card.classList.add('tt-quality__card--hidden');
        card.classList.remove('tt-quality__card--visible');
        return;
      }

      card.classList.remove('tt-quality__card--hidden');
      card.classList.add('tt-quality__card--visible');

      var x, rotate, scale, opacity, z;

      if (offset === 0) {
        x = m.center; rotate = 0; scale = 1; opacity = 1; z = 3;
      } else if (offset === -1) {
        x = -m.cardW + m.edgePeek; rotate = -8; scale = 0.9; opacity = 1; z = 2;
      } else if (offset === 1) {
        x = m.ww - m.edgePeek; rotate = 8; scale = 0.9; opacity = 1; z = 2;
      }

      if (liveX !== 0) {
        if (offset === 0) { x += liveX * 0.4; rotate += liveX * 0.01; }
        else { x += liveX * 0.5; rotate += liveX * 0.005; }
      }

      card.style.transition = animate
        ? 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease'
        : 'none';
      card.style.transform = 'translateX(' + x + 'px) rotate(' + rotate + 'deg) scale(' + scale + ')';
      card.style.opacity = opacity;
      card.style.zIndex = z;
    });
  }

  function setActive(index) {
    current = ((index % total) + total) % total;

    // Step 1 — instantly hide all non-adjacent with class
    cards.forEach(function (card, i) {
      var offset = getOffset(i);
      if (offset !== -1 && offset !== 0 && offset !== 1) {
        card.classList.add('tt-quality__card--hidden');
        card.classList.remove('tt-quality__card--visible');
      }
    });

    // Step 2 — animate visible three on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        positionCards(0, true);
      });
    });

    clients.forEach(function (c, i) {
      c.classList.toggle('is-active', i === current);
    });
  }
  function setActive(index) {
    // First hide all non-adjacent cards instantly BEFORE animating
    current = ((index % total) + total) % total;

    // Hide all first with no transition
    cards.forEach(function (card, i) {
      var offset = getOffset(i);
      if (offset !== -1 && offset !== 0 && offset !== 1) {
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
      }
    });

    // Then animate the visible three
    requestAnimationFrame(function () {
      positionCards(0, true);
    });

    clients.forEach(function (c, i) {
      c.classList.toggle('is-active', i === current);
    });
  }

  // ── Custom cursor ─────────────────────────────────────────
  window.addEventListener('mousemove', function (e) {
    if (cursor) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
    if (!isDragging) return;
    dragDelta = e.clientX - startX;
    positionCards(dragDelta, false);
  });

  wrap.addEventListener('mouseenter', function () {
    cursor && cursor.classList.add('is-visible');
  });

  wrap.addEventListener('mouseleave', function () {
    cursor && cursor.classList.remove('is-visible');
    if (isDragging) {
      isDragging = false;
      cursor && cursor.classList.remove('is-dragging');
      if (dragDelta < -threshold) setActive(current + 1);
      else if (dragDelta > threshold) setActive(current - 1);
      else positionCards(0, true);
      dragDelta = 0;
    }
  });

  wrap.addEventListener('mousedown', function (e) {
    isDragging = true;
    startX = e.clientX;
    dragDelta = 0;
    cursor && cursor.classList.add('is-dragging');
    e.preventDefault();
  });

  window.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    cursor && cursor.classList.remove('is-dragging');
    if (dragDelta < -threshold) setActive(current + 1);
    else if (dragDelta > threshold) setActive(current - 1);
    else positionCards(0, true);
    dragDelta = 0;
  });

  // ── Touch ─────────────────────────────────────────────────
  var touchStartX = 0;
  var touchDelta = 0;

  wrap.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchDelta = 0;
  }, { passive: true });

  wrap.addEventListener('touchmove', function (e) {
    touchDelta = e.touches[0].clientX - touchStartX;
    positionCards(touchDelta, false);
  }, { passive: true });

  wrap.addEventListener('touchend', function () {
    if (touchDelta < -threshold) setActive(current + 1);
    else if (touchDelta > threshold) setActive(current - 1);
    else positionCards(0, true);
    touchDelta = 0;
  }, { passive: true });

  // ── Init ──────────────────────────────────────────────────
  positionCards(0, false);
  setActive(0);
  window.addEventListener('resize', function () { positionCards(0, false); });
})();