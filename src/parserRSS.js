export default (responseData, link) => {
  const parser = new DOMParser();
  const parseData = parser.parseFromString(responseData, 'text/xml');
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
  } catch (err) {
    err.isParsingError = 'unableToParse';
    throw err;
  }
};
