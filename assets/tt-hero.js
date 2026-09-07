(function () {
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
    var slide = slides[index];
    var isMobile = window.innerWidth <= 768;
    var src = null;

    if (isMobile) {
      var source = slide.querySelector('source');
      if (source && source.srcset) {
        src = source.srcset.split(' ')[0];
      }
    }

    if (!src) {
      var img = slide.querySelector('img');
      if (img) src = img.src;
    }

    if (!src) return;

    var tempImg = new Image();
    tempImg.onload = function () {
      thumbInner.style.backgroundImage = 'url(' + src + ')';
    };
    tempImg.src = src;
  }

  function startBorderAnimation() {
    if (!borderRect) return;
    borderRect.style.transition = 'none';
    borderRect.style.strokeDashoffset = perimeter;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        borderRect.style.transition = 'stroke-dashoffset ' + autoplayDuration / 1000 + 's linear';
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
    updateThumb((current + 1) % total);
    startBorderAnimation();
    clearTimeout(timer);
    timer = setTimeout(function () {
      goTo(current + 1);
    }, autoplayDuration);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      clearTimeout(timer);
      goTo(current + 1);
    });
  }

  var firstImg = slides[1] ? slides[1].querySelector('img') : slides[0].querySelector('img');
  if (firstImg && firstImg.complete) {
    updateThumb(1 % total);
  } else if (firstImg) {
    firstImg.addEventListener('load', function () {
      updateThumb(1 % total);
    });
  }

  window.addEventListener('resize', function () {
    updateThumb((current + 1) % total);
  });

  startBorderAnimation();
  timer = setTimeout(function () {
    goTo(1);
  }, autoplayDuration);
})();
