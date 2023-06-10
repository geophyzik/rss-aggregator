/* eslint-disable */
import * as yup from 'yup';
import watch from './view.js';
import ru from './locales/ru';
import en from './locales/en';
import i18next from 'i18next';

export default async () => {

  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources: { ru } ,
  });

  const state = {
    form: {
      processState: '',
      errors: '',
      validState: '',
    },
    
    feeds: [],
    posts: [],
  }

  const elements = {
   rssForm: document.querySelector('.rss-form'),
   input: document.querySelector('input'),
   feedback: document.querySelector('.feedback'),
  };
  
  const watchedState = watch(elements, state, i18n);

  elements.rssForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url');

    const schema = yup.object().shape({
      link: yup.string().min(1)
        .url(i18n.t('errors.badUrl'))
        .notOneOf([...state.feeds],i18n.t('errors.duplicate')),
      });

    schema.validate({link})
      .then((res) => {
        //watchedState.processState = 'filling'; mb nado budet
        watchedState.form.validState = 'valid';
        state.feeds.push(link);
       // console.log(state)
      })
      .catch((e) => {
        state.form.errors = e.errors;
        watchedState.form.validState = 'invalid'; 
        //console.log(state)
      });

     //console.log([...state.feeds])
  });
};
