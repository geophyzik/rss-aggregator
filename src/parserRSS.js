export default (response, link) => {
  const parser = new DOMParser();
  const data = response.data.contents;
  const parseData = parser.parseFromString(data, 'text/xml');
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
        link: el.querySelector('link').textContent.trim(),
      });
    });
    return { feed, posts };
  } catch (e) {
    e.message = 'unableToParse';
    throw e;
  }
};
