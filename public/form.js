(() => {
  const fields = Array.from(
    document.querySelectorAll('textarea[data-autosize]')
  );

  // Общее сообщение для стандартной браузерной валидации
  const validationMessage = 'Введите корректное значение.';

  function update(field) {
    const counter = document.getElementById(`${field.id}-count`);

    if (counter) {
      counter.textContent = `${field.value.length} / ${field.maxLength}`;
      counter.hidden = false;
    }

    const styles = window.getComputedStyle(field);

    const border =
      parseFloat(styles.borderTopWidth) +
      parseFloat(styles.borderBottomWidth);

    const minHeight = parseFloat(styles.minHeight);
    const maxHeight = parseFloat(styles.maxHeight);

    // Сначала сбрасываем высоту, чтобы поле могло
    // как увеличиваться, так и уменьшаться.
    field.style.height = 'auto';

    const contentHeight = field.scrollHeight + border;

    const height = Math.max(
      minHeight,
      Math.min(contentHeight, maxHeight)
    );

    field.style.height = `${height}px`;

    field.style.overflowY =
      contentHeight > height ? 'auto' : 'hidden';
  }

  function updateAll() {
    fields.forEach(update);
  }

  // Автоматическое изменение размера textarea
  fields.forEach((field) => {
    field.addEventListener('input', () => update(field));
  });

  // Единое сообщение для всех ошибок HTML-валидации:
  // required, min, max, type, pattern и т.д.
  document.addEventListener(
    'invalid',
    (event) => {
      const field = event.target;

      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      ) {
        field.setCustomValidity(validationMessage);
      }
    },
    true
  );

  // При изменении значения убираем старое custom-сообщение,
  // чтобы браузер заново проверил реальные ограничения поля.
  document.addEventListener('input', (event) => {
    const field = event.target;

    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      field.setCustomValidity('');
    }
  });

  // Для select и некоторых других элементов полезно
  // также очищать сообщение при change.
  document.addEventListener('change', (event) => {
    const field = event.target;

    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      field.setCustomValidity('');
    }
  });

  let pendingFrame;

  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(pendingFrame);

    pendingFrame = window.requestAnimationFrame(updateAll);
  });

  window.addEventListener('pageshow', updateAll);

  updateAll();
})();