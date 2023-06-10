import onChange from 'on-change';

const render = (elements, state, i18n) => {
  if (state.form.validState === 'invalid') {
    const validFeedback = elements.feedback;
    elements.input.classList.remove('is-valid');
    elements.input.classList.add('is-invalid');
    validFeedback.classList.remove('text-success');
    validFeedback.classList.add('text-danger');
    validFeedback.textContent = state.form.errors;
  }

  if (state.form.validState === 'valid') {
    const invalidFeedback = elements.feedback;
    elements.input.classList.remove('is-invalid');
    elements.input.classList.add('is-valid');
    invalidFeedback.classList.remove('text-danger');
    invalidFeedback.classList.add('text-success');
    invalidFeedback.textContent = i18n.t('success');
  }

  elements.rssForm.reset();
  elements.input.focus();
};

export default (elements, state, i18n) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.validState':
        render(elements, state, i18n);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
