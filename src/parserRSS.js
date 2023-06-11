export default (response) => {
  const parser = new DOMParser();
  const doc1 = parser.parseFromString(response, "application/xml");
  console.log(doc1)
};
