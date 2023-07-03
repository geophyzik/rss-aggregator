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
  })
    .then(() => {
      const state = {
        form: {
          processState: 'filling',
          errors: null,
          validState: null,
        },

        feeds: [],
        posts: [],

        UIstate: {
          updateStatus: 'false',
          viewedPosts: new Set(),
          currentPostsId: null,
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
        const promises = state.feeds.map((eachFeed) => axios.get(completionURL(eachFeed.url))
          .then((response) => {
            const getData = parserRSS(response, eachFeed.url);
            const newData = getData.posts;
            const oldData = state.posts;
            const newPosts = newData.filter((e1) => !oldData.some((e2) => e2.title === e1.title));
            const updatedPost = newPosts.map((el) => ({ ...el, id: generateId() }));
            if (updatedPost.length > 0) {
              state.posts = [...state.posts, ...updatedPost];
            }
            watchedState.form.processState = 'success';
          })
          .catch((e) => {
            console.log(e.message);
          }));
        watchedState.form.processState = 'filling';
        Promise.allSettled(promises).finally(() => {
          setTimeout(checkUpdatePosts, 5000);
        });
      };

      elements.rssForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const link = formData.get('url');
        watchedState.form.validState = null;
        watchedState.form.processState = 'processing';
        const schema = yup.object().shape({
          link: yup.string().required().trim()
            .url('errors.badUrl')
            .notOneOf(state.feeds.map((feed) => feed.url.trim()), 'errors.duplicate'),
        });

        schema.validate({ link })
          .then(() => {
            axios.get(completionURL(link))
              .then((response) => {
                const data = parserRSS(response, link);
                data.feed.id = generateId();
                const postWithId = data.posts.map((el) => ({ ...el, id: generateId() }));
                state.feeds.push(data.feed);
                state.posts = [...state.posts, ...postWithId];
                watchedState.form.processState = 'success';
                watchedState.form.validState = true;
              })
              .catch((err) => {
                const defineError = (error) => {
                  if (error.isParsingError) {
                    return 'errors.invalidRSS';
                  }
                  if (axios.isAxiosError(error)) {
                    return 'errors.networkProblem';
                  }
                  return 'errors.defect';
                };
                state.form.errors = defineError(err);
                watchedState.form.validState = false;
                throw err;
              });
          })
          .catch((err) => {
            state.form.errors = err.errors;
            watchedState.form.validState = false;
            throw err;
          });
      });

      elements.containers.postsContainer.addEventListener('click', (e) => {
        const click = e.target;
        const currentId = Number(click.dataset.id);
        const [post] = state.posts.filter((el) => el.id === currentId);
        state.UIstate.viewedPosts.add(post);
        state.UIstate.currentPostsId = currentId;
        watchedState.form.processState = click.tagName === 'BUTTON' ? 'openModalWindow' : 'openLink';
        watchedState.form.processState = 'filling';
      });
      checkUpdatePosts();
    });
};
