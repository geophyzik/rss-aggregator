/* eslint-disable */
import * as yup from 'yup';
import onChange from 'on-change';

const init = () => {
  const state = {
    processState: '',
    errors: '',
    valid: '',
    
    feeds: [],
    posts: [],
  }

  const rssForm = document.querySelector('.rss-form');
  const input = document.querySelector('input');
  const feedback = document.querySelector('.feedback');

  const render = () => {
  
    if (state.valid === 'invalid') {
      console.log('lol_invalid')
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = 'Ссылка должна быть валидным URL';
    }

    if (state.valid === 'valid') {
      console.log('lol_valid')
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = 'RSS успешно загружен';
    }

    rssForm.reset();
    input.focus();
  };

  const watchedState = onChange(state, render);

  rssForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url');
    const schema = yup.object().shape({
      link: yup.string().min(1).url('badUrl').notOneOf([...state.feeds],'duplicate'),
      });

    schema.validate({link})
      .then((res) => {
        //watchedState.processState = 'filling';
        watchedState.valid = 'valid';
        state.feeds.push(link);

        console.log('LINK VALID vse ok!!!')
        console.log(state)
      })
      .catch((e) => {
        //watchedState.errors = e.errors;
        watchedState.valid = 'invalid'; 

        console.log('LINK INVALID vse BAD!!!'+e.errors)
        console.log(state)
      });

     //console.log([...state.feeds])
  });
};

export default app;