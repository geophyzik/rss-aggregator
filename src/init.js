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
      processState: 'filling',
      errors: null,
      validState: 'validity',
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
    const func = () => {
      num += 1;
      return num;
    };
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
          const updatedPost = newPost.map((el) => ({ ...el, id: generateId() }));
          state.posts = [...state.posts, ...updatedPost];

          watchedState.form.processState = 'success';
          state.form.processState = 'filling';
          // console.log('update', eachFeed);  //
        })
        .catch((e) => {
          console.log(e.message);
        });
    });
    // console.log('done ');  //
    setTimeout(checkUpdatePosts, 5000);
  };

  elements.rssForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.form.processState = 'filling';
    const formData = new FormData(event.target);
    const link = formData.get('url');

    const schema = yup.object().shape({
      link: yup.string().required().trim()
        .url('errors.badUrl')
        .notOneOf(state.feeds.map((feed) => feed.url.trim()), 'errors.duplicate'),
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
            const postWithId = data.posts.map((el) => ({ ...el, id: generateId() }));
            state.feeds.push(data.feed);
            state.posts = [...state.posts, ...postWithId];
            watchedState.form.processState = 'success';
            if (state.UIstate.updateStatus === 'false') {
              state.UIstate.updateStatus = 'true';
              checkUpdatePosts();
            }
            // console.log(state);    //
          })
          .catch((e) => {
            state.form.errors = axios.isAxiosError(e) ? 'errors.networkProblem' : 'errors.invalidRSS';
            watchedState.form.validState = 'invalid';
            throw e;
          });
      })
      .catch((e) => {
        state.form.errors = e.errors;
        watchedState.form.validState = 'invalid';
        throw e;
      });
    state.form.processState = 'filling';
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
