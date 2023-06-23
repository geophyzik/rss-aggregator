/* eslint-disable import/no-extraneous-dependencies */
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import watch from './view.js';
import ru from './locales/ru.js';
import parserRSS from './parserRSS.js';

export default () => {
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

    UIstate: {
      updateStatus: 'false',
      viewedPostsId: [],
    },
  };

  const elements = {
    rssForm: document.querySelector('.rss-form'),
    mainBtn: document.querySelector('[type="submit"]'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    containers: {
      postsContainer: document.querySelector('.container-xxl > div > .posts'),
      feedsContainer: document.querySelector('.container-xxl > div > .feeds'),
    },
  };

  const completionURL = (link) => {
    let url = new URL('https://allorigins.hexlet.app/get');
    url.searchParams.set('disableCache', 'true');
    url.searchParams.set('url', link);
    url = url.toString();
    return url;
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
          const newData = parserRSS(response, eachFeed.url);
          // eslint-disable-next-line max-len
          const newPost = newData.posts.filter((el) => !state.posts.some((el2) => el2.postName === el.postName));
          newPost.forEach((el) => {
            // eslint-disable-next-line no-param-reassign
            el.id = eachFeed.id;
          });
          state.posts = [...state.posts, ...newPost];

          watchedState.form.processState = 'success';
          state.form.processState = 'filling';
        })
        .catch((e) => {
          console.log(e.message);
        });
    });
    setTimeout(checkUpdatePosts, 5000);
  };

  elements.rssForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.form.processState = 'filling';
    const formData = new FormData(event.target);
    const link = formData.get('url');

    const schema = yup.object().shape({
      link: yup.string().required().trim()
        .url(i18n.t('errors.badUrl'))
        .notOneOf(state.feeds.map((feed) => feed.url.trim()), i18n.t('errors.duplicate')),
    });
    watchedState.form.validState = 'validity';
    schema.validate({ link })
      .then(() => {
        watchedState.form.processState = 'processing';
        axios.get(completionURL(link))
          .then((response) => {
            const data = parserRSS(response, link);
            watchedState.form.validState = 'valid';
            data.feed.id = generateId();
            data.posts.forEach((el) => {
              // eslint-disable-next-line no-param-reassign
              el.id = generateId();
            });
            state.feeds.push(data.feed);
            state.posts = [...state.posts, ...data.posts];
            watchedState.form.processState = 'success';
            state.form.processState = 'filling';
            // eslint-disable-next-line no-multi-spaces
            if (state.UIstate.updateStatus === 'false') {
              state.UIstate.updateStatus = 'true';
              checkUpdatePosts();
            }
          })
          .catch((e) => {
            if (e.message === 'Network Error') {
              state.form.errors = i18n.t('errors.networkProblem');
            }
            if (e.message === 'unableToParse') {
              state.form.errors = i18n.t('errors.invalidRSS');
            }
            watchedState.form.validState = 'invalid';
            throw e;
          });
      })
      .catch((e) => {
        state.form.errors = e.errors;
        watchedState.form.validState = 'invalid';
        state.form.processState = 'chill';
        throw e;
      });
  });

  elements.containers.postsContainer.addEventListener('click', (e) => {
    const click = e.target;
    const idLatest = Number(click.dataset.id);
    switch (click.tagName) {
      case 'BUTTON':
        state.UIstate.viewedPostsId.push(idLatest);
        watchedState.form.processState = 'openModalWindow';
        state.form.processState = 'filling';
        break;
      case 'A':
        state.UIstate.viewedPostsId.push(idLatest);
        watchedState.form.processState = 'success';
        state.form.processState = 'filling';
        break;
      default:
        break;
    }
  });
};
