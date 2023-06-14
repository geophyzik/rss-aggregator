import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import watch from './view.js';
import ru from './locales/ru';
import parserRSS from './parserRSS.js';

export default async () => {
  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources: { ru },
  });

  const state = {
    form: {
      processState: '',
      errors: '',
      validState: '',
    },

    feeds: [],
    posts: [],
  };

  const elements = {
    rssForm: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    containers: {
      postsContainer: document.querySelector('.container-xxl > div > .posts'),
      feedsContainer: document.querySelector('.container-xxl > div > .feeds'),
    },
  };

  const fullUrl = (link) => {
    const allOrigin = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    const encode = encodeURIComponent(link);
    return `${allOrigin}+${encode}`;
  };

  const count = (() => {
    let num = 0;
    // eslint-disable-next-line no-plusplus
    const func = () => ++num;
    return func;
  })();

  const watchedState = watch(elements, state, i18n);

  elements.rssForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.form.processState = 'filling';
    state.form.validState = 'none';
    const formData = new FormData(event.target);
    const link = formData.get('url');

    const schema = yup.object().shape({
      link: yup.string().min(1)
        .url(i18n.t('errors.badUrl'))
        .notOneOf(state.feeds.map((feed) => feed.url), i18n.t('errors.duplicate')),
    });

    schema.validate({ link })
      .then(() => {
        axios.get(fullUrl(link))
          .then((response) => {
            watchedState.form.validState = 'valid';
            const data = parserRSS(response);
            const idNumber = count();
            data.feed.id = idNumber;
            data.posts.forEach((el) => {
              // eslint-disable-next-line no-param-reassign
              el.id = idNumber;
            });
            state.feeds.push(data.feed);
            state.posts = [...state.posts, ...data.posts];
            watchedState.form.processState = 'succes';
          })
          .catch((e) => {
            state.form.errors = 'Ресурс не содержит валидный RSS';
            watchedState.form.validState = 'invalid';
            throw e;
          });
      })
      .catch((e) => {
        state.form.errors = e.errors;
        watchedState.form.validState = 'invalid';
        e.message = 'validate error';
        throw e;
      });
  });
};
