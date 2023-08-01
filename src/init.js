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
    debug: false,
    resources: { ru },
  })
    .then(() => {
      const state = {
        form: {
          processState: 'filling',
          errors: null,
        },

        feeds: [],
        posts: [],

        UIstate: {
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

      const updateSchema = (data) => yup.object().shape({
        link: yup.string().required().trim()
          .url('errors.badUrl')
          .notOneOf(data.feeds.map((feed) => feed.url.trim()), 'errors.duplicate'),
      });

      const defineError = (error) => {
        if (error.isParsingError) {
          return 'errors.invalidRSS';
        }
        if (axios.isAxiosError(error)) {
          return 'errors.networkProblem';
        }
        return error.errors ?? 'errors.defect';
      };

      const watchedState = watch(elements, state, i18n);

      const checkUpdatePosts = () => {
        const promises = state.feeds.map((eachFeed) => axios.get(completionURL(eachFeed.url))
          .then((response) => {
            const responseData = response.data.contents;
            const dataFromParse = parserRSS(responseData, eachFeed.url);
            const newPosts = dataFromParse.posts;
            const oldPosts = state.posts;
            const newData = newPosts.filter((e1) => !oldPosts.some((e2) => e2.link === e1.link));
            const postWithId = newData.map((el) => {
              const updatedPost = { ...el, id: generateId(), feedId: eachFeed.id };
              return updatedPost;
            });
            if (postWithId.length > 0) {
              state.posts = [...state.posts, ...postWithId];
            }
            watchedState.form.processState = 'update';
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
        const schema = updateSchema(state);
        watchedState.form.processState = 'processing';

        schema
          .validate({ link })
          .then(() => axios.get(completionURL(link)))
          .then((response) => {
            const responseData = response.data.contents;
            const data = parserRSS(responseData, link);
            data.feed.id = generateId();
            const idFromFeed = data.feed.id;
            const postWithId = data.posts.map((el) => {
              const updatedPost = { ...el, id: generateId(), feedId: idFromFeed };
              return updatedPost;
            });
            state.feeds.push(data.feed);
            state.posts = [...state.posts, ...postWithId];
            watchedState.form.processState = 'success';
          })
          .catch((err) => {
            state.form.errors = defineError(err);
            watchedState.form.processState = 'failed';
            throw err;
          });
          // console.log(state)
      });

      elements.containers.postsContainer.addEventListener('click', (e) => {
        const click = e.target;
        const currentId = Number(click.dataset.id);
        state.UIstate.viewedPosts.add(currentId);
        state.UIstate.currentPostsId = currentId;
        watchedState.form.processState = click.tagName === 'BUTTON' ? 'openModalWindow' : 'openLink';
        watchedState.form.processState = 'filling';
      });

      checkUpdatePosts();
    });
};
