(function() {
  var hero = document.getElementById('tt-hero');
  if (!hero) return;

  var slides = hero.querySelectorAll('.tt-hero__slide');
  var thumbInner = document.getElementById('tt-thumb-inner');
  var borderRect = hero.querySelector('.tt-hero__thumb-border rect');
  var counterCurrent = hero.querySelector('.tt-hero__counter-current');
  var counterTotal = hero.querySelector('.tt-hero__counter-total');
  var nextBtn = hero.querySelector('.tt-hero__next');

  if (!slides.length) return;

  var current = 0;
  var total = slides.length;
  var autoplayDuration = 5000;
  var timer = null;
  var perimeter = 240;

  counterTotal.textContent = total < 10 ? '0' + total : '' + total;

  function updateThumb(index) {
    if (!thumbInner) return;
    var img = slides[index].querySelector('img');
    if (img) {
      if (img.complete) {
        thumbInner.style.backgroundImage = 'url(' + img.src + ')';
      } else {
        img.addEventListener('load', function() {
          thumbInner.style.backgroundImage = 'url(' + img.src + ')';
        });
      }
    }
  }

  function startBorderAnimation() {
    if (!borderRect) return;
    // Reset
    borderRect.style.transition = 'none';
    borderRect.style.strokeDashoffset = perimeter;
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        borderRect.style.transition = 'stroke-dashoffset ' + (autoplayDuration / 1000) + 's linear';
        borderRect.style.strokeDashoffset = '0';
      });
    });
  }

  function goTo(index) {
    slides[current].classList.remove('is-active');
    current = (index + total) % total;
    slides[current].classList.add('is-active');
    var num = current + 1;
    counterCurrent.textContent = num < 10 ? '0' + num : '' + num;
    updateThumb(current);
    startBorderAnimation();
    clearTimeout(timer);
    timer = setTimeout(function() { goTo(current + 1); }, autoplayDuration);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      clearTimeout(timer);
      goTo(current + 1);
    });
  }

  // Init
  updateThumb(0);
  startBorderAnimation();
  timer = setTimeout(function() { goTo(1); }, autoplayDuration);
})();