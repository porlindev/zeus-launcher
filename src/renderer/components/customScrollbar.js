(function () {
  function attachCustomScrollbar(content, { maxHeight, flex = false } = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-scroll';
    if (maxHeight) {
      wrapper.style.maxHeight = maxHeight;
    }
    if (flex) {
      wrapper.style.flex = '1';
      wrapper.style.minHeight = '0';
    }

    content.parentNode.insertBefore(wrapper, content);
    wrapper.appendChild(content);
    content.classList.add('custom-scroll-content');

    const track = document.createElement('div');
    track.className = 'custom-scroll-track hidden';
    const thumb = document.createElement('div');
    thumb.className = 'custom-scroll-thumb';
    track.appendChild(thumb);
    wrapper.appendChild(track);

    function update() {
      const { scrollHeight, clientHeight, scrollTop } = content;
      if (scrollHeight <= clientHeight + 1) {
        track.classList.add('hidden');
        return;
      }
      track.classList.remove('hidden');
      const trackHeight = track.clientHeight;
      const thumbHeight = Math.max(24, (clientHeight / scrollHeight) * trackHeight);
      const maxThumbTop = trackHeight - thumbHeight;
      const maxScroll = scrollHeight - clientHeight;
      const thumbTop = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbTop : 0;
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
    }

    content.addEventListener('scroll', update);

    let dragging = false;
    let dragStartY = 0;
    let dragStartScrollTop = 0;

    thumb.addEventListener('mousedown', (e) => {
      dragging = true;
      dragStartY = e.clientY;
      dragStartScrollTop = content.scrollTop;
      document.body.classList.add('custom-scroll-dragging');
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const { scrollHeight, clientHeight } = content;
      const trackHeight = track.clientHeight;
      const thumbHeight = thumb.clientHeight;
      const maxThumbTop = trackHeight - thumbHeight;
      if (maxThumbTop <= 0) return;
      const deltaY = e.clientY - dragStartY;
      const deltaScroll = (deltaY / maxThumbTop) * (scrollHeight - clientHeight);
      content.scrollTop = dragStartScrollTop + deltaScroll;
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('custom-scroll-dragging');
    });

    track.addEventListener('mousedown', (e) => {
      if (e.target !== track) return;
      const rect = track.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const thumbHeight = thumb.clientHeight;
      const usable = rect.height - thumbHeight;
      const ratio = usable > 0 ? (clickY - thumbHeight / 2) / usable : 0;
      const clamped = Math.min(1, Math.max(0, ratio));
      content.scrollTop = clamped * (content.scrollHeight - content.clientHeight);
    });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(content);
    resizeObserver.observe(wrapper);

    update();

    return { update };
  }

  window.attachCustomScrollbar = attachCustomScrollbar;
})();
