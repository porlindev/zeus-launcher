(function () {
  const CHEVRON_SVG =
    '<svg viewBox="0 0 12 8" width="10" height="7"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function closeAllExcept(exceptRoot) {
    document.querySelectorAll('.custom-select.open').forEach((el) => {
      if (el !== exceptRoot) el.classList.remove('open');
    });
  }

  document.addEventListener('click', () => closeAllExcept(null));

  function createCustomSelect({ placeholder = '' } = {}) {
    const root = document.createElement('div');
    root.className = 'custom-select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';

    const label = document.createElement('span');
    label.className = 'custom-select-label';
    label.textContent = placeholder;

    const chevron = document.createElement('span');
    chevron.className = 'custom-select-chevron';
    chevron.innerHTML = CHEVRON_SVG;

    trigger.append(label, chevron);

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu hidden';

    root.append(trigger, menu);

    let options = [];
    let value = '';
    let currentPlaceholder = placeholder;
    const changeListeners = [];

    function labelFor(val) {
      const opt = options.find((o) => o.value === val);
      return opt ? opt.label : currentPlaceholder;
    }

    function syncLabel() {
      label.textContent = labelFor(value);
    }

    function close() {
      root.classList.remove('open');
      menu.classList.add('hidden');
    }

    function open() {
      if (trigger.disabled) return;
      closeAllExcept(root);
      root.classList.add('open');
      menu.classList.remove('hidden');
    }

    function renderMenu() {
      menu.innerHTML = '';
      options.forEach((opt) => {
        const item = document.createElement('div');
        item.className = 'custom-select-option' + (opt.value === value ? ' active' : '');
        item.textContent = opt.label;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          setValue(opt.value, true);
          close();
        });
        menu.appendChild(item);
      });
    }

    function setValue(newValue, emit) {
      value = newValue;
      syncLabel();
      renderMenu();
      if (emit) {
        changeListeners.forEach((cb) => cb(value));
      }
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (root.classList.contains('open')) {
        close();
      } else {
        open();
      }
    });

    menu.addEventListener('click', (e) => e.stopPropagation());

    return {
      el: root,
      get value() {
        return value;
      },
      set value(v) {
        setValue(v, false);
      },
      setOptions(newOptions, { keepValue = false } = {}) {
        options = newOptions;
        if (keepValue && options.some((o) => o.value === value)) {
          // keep current value
        } else {
          value = options.length > 0 ? options[0].value : '';
        }
        syncLabel();
        renderMenu();
      },
      onChange(cb) {
        changeListeners.push(cb);
      },
      setDisabled(disabled) {
        trigger.disabled = disabled;
        root.classList.toggle('disabled', disabled);
      },
      setPlaceholder(text) {
        currentPlaceholder = text;
        if (!value) syncLabel();
      },
      setVisible(visible) {
        root.classList.toggle('hidden', !visible);
        if (!visible) close();
      },
      close,
    };
  }

  window.createCustomSelect = createCustomSelect;
})();
