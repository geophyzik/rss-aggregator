export default (response) => {
  const parseData = new DOMParser().parseFromString(response.data.contents, 'text/html');
  try {
    const feed = {
      title: parseData.querySelector('title').textContent,
      description: parseData.querySelector('description').textContent,
      url: response.data.status.url,
    };

    const posts = [];

    parseData.querySelectorAll('item').forEach((el) => {
      posts.push({
        title: el.querySelector('title').textContent,
        description: el.querySelector('description').textContent,
        link: el.querySelector('link').nextSibling.textContent.trim(),
      });
    });
    return { feed, posts };
  } catch (e) {
    e.message = 'unableToParse';
    throw e;
  }
};
