/* eslint-disable */
import * as yup from 'yup';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
//import axios from 'axios';
const schema = yup.object().shape({
  link: yup.string().min(1).url(),
});

const app = () => {
  console.log('commands duplicated')
  // const state = {
  //   processState: '',
  //   errors: '',
  //   valid: '',
  // }
  
  // const rssForm = document.querySelector('.rss-form');
  // const input = document.querySelector('input');

  // const render = (state) => {
  //   rssForm.reset();
  //   input.focus();
  // };

  // const watchedState = onChange(state, render);

  // rssForm.addEventListener('submit', async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.target);
  //   const link = formData.get('url');
    
  //   schema.validate({link})
  //     .then((res) => {
  //       watchedState.processState = 'filling';
  //       watchedState.valid = 'true';

  //       console.log('vse ok')
  //       // console.log(state)
  //     })
  //     .catch((e) => {
  //       watchedState.errors = e.errors;
  //       watchedState.valid = 'false';
  //       watchedState.processState = 'stop';

  //       console.log('e='+e.errors)
  //       // console.log(state)
  //     });

  //    console.log('state')
  // });
};

export default app;