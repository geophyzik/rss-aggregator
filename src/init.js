/* eslint-disable import/no-extraneous-dependencies */
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import watch from './view.js';
import ru from './locales/ru.mjs';
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

    UIstate: {
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
    console.log(url)
    return url
    }

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

          watchedState.form.processState = 'success';
          state.form.processState = 'chill';
        })
        .catch((e) => {
          console.log(e.message);
        });
    });
    setTimeout(checkUpdatePosts, 5000);
  };

  elements.rssForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.form.processState = 'chill';
    state.form.validState = 'none';
    const formData = new FormData(event.target);
    const link = formData.get('url');

    console.log(link)
    const schema = yup.object().shape({
      link: yup.string().required().trim()
        .url(i18n.t('errors.badUrl'))
        .notOneOf(state.feeds.map((feed) => feed.url.trim()), i18n.t('errors.duplicate')),
    });

    schema.validate({ link })
      .then(() => {
        watchedState.form.processState = 'processing';
        axios.get(completionURL(link))
          .then((response) => {
            const data = parserRSS(response);
            watchedState.form.validState = 'valid';
            data.feed.id = generateId();
            data.posts.forEach((el) => {
              // eslint-disable-next-line no-param-reassign
              el.id = generateId();
            });
            state.feeds.push(data.feed);
            state.posts = [...state.posts, ...data.posts];
            watchedState.form.processState = 'success';
            state.form.processState = 'chill';
            // eslint-disable-next-line no-multi-spaces
            checkUpdatePosts();                                       // refresh post function
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
    const idLatest = click.dataset.id;
    switch (click.tagName) {
      case 'BUTTON':
        state.UIstate.viewedPostsId = [...state.UIstate.viewedPostsId, ...idLatest];
        watchedState.form.processState = 'openModalWindow';
        state.form.processState = 'chill';
        break;
      case 'A':
        state.UIstate.viewedPostsId = [...state.UIstate.viewedPostsId, ...idLatest];
        watchedState.form.processState = 'success';
        state.form.processState = 'chill';
        break;
      default:
        break;
    }
  });
};
