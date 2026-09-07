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
  var isAnimating = false;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          title && title.classList.add('is-visible');
          setTimeout(function () {
            desc && desc.classList.add('is-visible');
          }, 200);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );
  observer.observe(section);

  function metrics() {
    var ww = wrap.offsetWidth;
    var cardW = cards[0].offsetWidth;
    return {
      ww: ww,
      cardW: cardW,
      center: ww / 2 - cardW / 2,
      peek: cardW * 0.28,
    };
  }

  function getOffset(i) {
    var o = (((i - current) % total) + total) % total;
    if (o > Math.floor(total / 2)) o -= total;
    return o;
  }

  function hideCard(card, m) {
    card.style.cssText =
      'position:absolute;top:50%;visibility:hidden;opacity:0;transition:none;z-index:0;pointer-events:none;transform:translateX(' +
      m.center +
      'px) translateY(-50%) scale(0.7);';
  }

  function positionCard(card, offset, m, liveX, animate) {
    var x, rotate, scale, z;
    liveX = liveX || 0;

    if (offset === 0) {
      x = m.center + liveX * 0.4;
      rotate = liveX * 0.008;
      scale = 1;
      z = 3;
    } else if (offset === -1) {
      x = -m.cardW + m.peek + liveX * 0.55;
      rotate = -8;
      scale = 0.9;
      z = 2;
    } else {
      x = m.ww - m.peek + liveX * 0.55;
      rotate = 8;
      scale = 0.9;
      z = 2;
    }

    card.style.position = 'absolute';
    card.style.top = '50%';
    card.style.visibility = 'visible';
    card.style.opacity = '1';
    card.style.zIndex = z;
    card.style.pointerEvents = offset === 0 ? 'auto' : 'none';
    card.style.transition = animate ? 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease' : 'none';
    card.style.transform = 'translateX(' + x + 'px) translateY(-50%) rotate(' + rotate + 'deg) scale(' + scale + ')';
  }

  function render(liveX, animate) {
    var m = metrics();
    liveX = liveX || 0;
    cards.forEach(function (card, i) {
      var offset = getOffset(i);
      if (offset === -1 || offset === 0 || offset === 1) {
        positionCard(card, offset, m, liveX, animate);
      } else {
        hideCard(card, m);
      }
    });
  }

  function goTo(index) {
    if (isAnimating) return;
    isAnimating = true;
    current = ((index % total) + total) % total;
    var m = metrics();
    cards.forEach(function (card, i) {
      var offset = getOffset(i);
      if (offset !== -1 && offset !== 0 && offset !== 1) {
        hideCard(card, m);
      }
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        render(0, true);
        clients.forEach(function (c, i) {
          c.classList.toggle('is-active', i === current);
        });
        setTimeout(function () {
          isAnimating = false;
        }, 680);
      });
    });
  }

  window.addEventListener('mousemove', function (e) {
    if (cursor) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
    if (!isDragging) return;
    dragDelta = e.clientX - startX;
    render(dragDelta, false);
  });

  wrap.addEventListener('mouseenter', function () {
    cursor && cursor.classList.add('is-visible');
  });

  wrap.addEventListener('mouseleave', function () {
    cursor && cursor.classList.remove('is-visible');
    if (isDragging) {
      isDragging = false;
      cursor && cursor.classList.remove('is-dragging');
      if (dragDelta < -threshold) goTo(current + 1);
      else if (dragDelta > threshold) goTo(current - 1);
      else render(0, true);
      dragDelta = 0;
    }
  });

  wrap.addEventListener('mousedown', function (e) {
    if (isAnimating) return;
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
    if (dragDelta < -threshold) goTo(current + 1);
    else if (dragDelta > threshold) goTo(current - 1);
    else render(0, true);
    dragDelta = 0;
  });

  var touchStartX = 0;
  var touchDelta = 0;

  wrap.addEventListener(
    'touchstart',
    function (e) {
      if (isAnimating) return;
      touchStartX = e.touches[0].clientX;
      touchDelta = 0;
    },
    { passive: true }
  );

  wrap.addEventListener(
    'touchmove',
    function (e) {
      touchDelta = e.touches[0].clientX - touchStartX;
      render(touchDelta, false);
    },
    { passive: true }
  );

  wrap.addEventListener(
    'touchend',
    function () {
      if (touchDelta < -threshold) goTo(current + 1);
      else if (touchDelta > threshold) goTo(current - 1);
      else render(0, true);
      touchDelta = 0;
    },
    { passive: true }
  );

  render(0, false);
  clients[0] && clients[0].classList.add('is-active');
  window.addEventListener('resize', function () {
    render(0, false);
  });
})();
