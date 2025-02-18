const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/delete-highlight/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Make the DELETE request to Readwise API
    await axios.delete(`https://readwise.io/api/v2/highlights/${id}/`, {
      headers: {
        Authorization: `Token ${process.env.READWISE_AUTH_TOKEN}`
      }
    });

    // Return a simple success page
    res.send(`
      <html>
        <body>
          <h1>Highlight Deleted</h1>
          <p>The highlight has been successfully deleted from Readwise.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error deleting highlight:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>Failed to delete highlight. Please try again later.</p>
          <p>Error: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(port, () => {
        console.log(`Delete proxy server running at http://localhost:${port}`);
        resolve(server);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { startServer, app }; 