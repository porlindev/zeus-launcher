(function () {
  const container = document.getElementById('toast-container');
  const ICONS = { error: '!', success: '✓', info: 'i' };

  function showToast(message, { type = 'info', duration = 4500, action } = {}) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = ICONS[type] ?? ICONS.info;

    const text = document.createElement('span');
    text.className = 'toast-message';
    text.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'close');
    closeBtn.textContent = '✕';

    const remove = () => {
      toast.classList.remove('toast-in');
      toast.classList.add('toast-out');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };

    toast.append(icon, text);

    if (action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action';
      actionBtn.type = 'button';
      actionBtn.textContent = action.label;
      actionBtn.addEventListener('click', () => {
        action.onClick();
        remove();
      });
      toast.append(actionBtn);
    }

    toast.append(closeBtn);

    closeBtn.addEventListener('click', remove);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-in'));

    if (duration > 0) {
      setTimeout(remove, duration);
    }
  }

  window.showToast = showToast;
})();
