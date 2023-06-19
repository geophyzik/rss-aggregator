export default (response, link) => {
  const parseData = new DOMParser().parseFromString(response.data.contents, 'text/xml');
  try {
    const feed = {
      title: parseData.querySelector('title').textContent,
      description: parseData.querySelector('description').textContent,
      url: link,
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
