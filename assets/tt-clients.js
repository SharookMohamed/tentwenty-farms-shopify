(function() {
  var section = document.getElementById('tt-clients');
  if (!section) return;

  var title = section.querySelector('.tt-clients__title');
  var desc = section.querySelector('.tt-clients__desc');
  var items = section.querySelectorAll('.tt-clients__item');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        title && title.classList.add('is-visible');
        desc && desc.classList.add('is-visible');
        items.forEach(function(item, i) {
          setTimeout(function() {
            item.classList.add('is-visible');
          }, i * 100);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.15 });

  observer.observe(section);
})();
