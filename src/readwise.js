const axios = require('axios');

const readwiseApiUrl = 'https://readwise.io/api/v2/review';

async function getHighlights() {
  const response = await axios.get(readwiseApiUrl, {
    headers: {
      Authorization: `Token ${process.env.READWISE_AUTH_TOKEN}`
    }
  });

  return response.data.highlights;
}

module.exports = {
  getHighlights
}; 