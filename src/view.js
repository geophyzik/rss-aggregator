import onChange from 'on-change';

const renderPosts = (elements, state, i18n) => {
  const postsBox = document.createElement('div');
  const postsTitleBox = document.createElement('div');
  const postsTitle = document.createElement('h2');
  const postsList = document.createElement('ul');

  postsBox.classList.add('card', 'border-0');
  postsTitleBox.classList.add('card-body');
  postsTitle.classList.add('card-title', 'h4');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsTitle.textContent = i18n.t('posts');

  elements.containers.feedsContainer.append(postsBox);
  postsBox.append(postsTitleBox);
  postsTitleBox.append(postsTitle, postsList);

  state.posts.forEach((element) => {
    const post = document.createElement('li');
    const postTitle = document.createElement('a');
    const postButton = document.createElement('button');

    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    postTitle.setAttribute('href', element.link);
    postTitle.classList.add('fw-bold');
    postTitle.setAttribute('data-id', element.id);
    postTitle.setAttribute('target', '_blank');
    postTitle.setAttribute('rel', 'noopener noreferrer');
    postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postButton.setAttribute('data-bs-toggle', 'modal');
    postButton.setAttribute('data-bs-target', '#modal');
    postButton.setAttribute('data-id', element.id);

    postTitle.textContent = element.postName;
    postButton.textContent = i18n.t('lookPost');

    postsList.append(post);
    post.append(postTitle, postButton);
  });
};

const renderFeeds = (elements, state, i18n) => {
  const feedsBox = document.createElement('div');
  const feedsTitleBox = document.createElement('div');
  const feedsTitle = document.createElement('h2');
  const feedsList = document.createElement('ul');

  feedsBox.classList.add('card', 'border-0');
  feedsTitleBox.classList.add('card-body');
  feedsTitle.classList.add('card-title', 'h4');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  feedsTitle.textContent = i18n.t('feeds');

  state.feeds.forEach((element) => {
    const feed = document.createElement('li');
    const feedTitle = document.createElement('h3');
    const feedDescription = document.createElement('p');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedTitle.classList.add('h6', 'm-0');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedTitle.textContent = element.title;
    feedDescription.textContent = element.description;
    feedsList.append(feed);
    feed.append(feedTitle, feedDescription);
  });

  elements.containers.feedsContainer.replaceChildren(feedsBox);
  feedsBox.append(feedsTitleBox);
  feedsTitleBox.append(feedsTitle, feedsList);
};

const renderState = (elements, state, i18n) => {
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
        renderState(elements, state, i18n);
        break;
      case 'form.processState':
        renderFeeds(elements, state, i18n);
        renderPosts(elements, state, i18n);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
