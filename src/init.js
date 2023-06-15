/* eslint-disable import/no-extraneous-dependencies */
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

    UIstate: [],
  };

  const elements = {
    rssForm: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    buttonsPost: document.querySelectorAll('li > .btn-sm'),
    containers: {
      postsContainer: document.querySelector('.container-xxl > div > .posts'),
      feedsContainer: document.querySelector('.container-xxl > div > .feeds'),
    },
  };

  const completionURL = (link) => {
    const allOrigin = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    const encode = encodeURIComponent(link);
    return `${allOrigin}+${encode}`;
  };

  const generateId = (() => {
    let num = 0;
    // eslint-disable-next-line no-plusplus
    const func = () => ++num;
    return func;
  })();

  const watchedState = watch(elements, state, i18n);

  const checkUpdatePosts = () => {
    state.feeds.forEach((eachFeed) => {
      axios.get(completionURL(eachFeed.url))
        .then((response) => {
          const newData = parserRSS(response);
          // eslint-disable-next-line max-len
          const newPost = newData.posts.filter((el) => !state.posts.some((el2) => el2.postName === el.postName));
          newPost.forEach((el) => {
            // eslint-disable-next-line no-param-reassign
            el.id = eachFeed.id;
          });
          state.posts = [...state.posts, ...newPost];

          watchedState.form.processState = 'work';
          state.form.processState = 'chill';
        })
        .catch((e) => {
          // state.form.errors = 'Ресурс не содержит валидный RSS';
          // watchedState.form.validState = 'invalid';
          throw e;
        });
    });
    console.log('end update', state);
    setTimeout(checkUpdatePosts, 5000);
  };

  elements.rssForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.form.processState = 'chill';
    state.form.validState = 'none';
    const formData = new FormData(event.target);
    const link = formData.get('url');

    const schema = yup.object().shape({
      link: yup.string().min(1)
        .url(i18n.t('errors.badUrl'))
        .notOneOf(state.feeds.map((feed) => feed.url.trim()), i18n.t('errors.duplicate')),
    });

    schema.validate({ link })
      .then(() => {
        axios.get(completionURL(link))
          .then((response) => {
            watchedState.form.validState = 'valid';
            const data = parserRSS(response);
            data.feed.id = generateId();
            data.posts.forEach((el) => {
              // eslint-disable-next-line no-param-reassign
              el.id = generateId();
            });
            state.feeds.push(data.feed);
            state.posts = [...state.posts, ...data.posts];
            watchedState.form.processState = 'work';
            state.form.processState = 'chill';
            checkUpdatePosts();                          // рефрешер постов
            console.log('___state', state)
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

  // document.querySelectorAll('li > .btn-sm').forEach((button) => {
  //   console.log('baton',button)
  //   button.addEventListener('click', (e) => {
  //     // const targetTab = e.target;
  //     // console.log(e)
  //     alert('wow')
  //   });
  // });
};
