// Fetches the 12-month rolling beta for a mutual fund ticker against the S&P 500
// using the Newton Analytics open-source API.
// Endpoint: https://api.newtonanalytics.com/stock-beta/
// Parameters: index=^GSPC, interval=1mo, observations=12

const axios = require('axios');

const BETA_URL = 'https://api.newtonanalytics.com/stock-beta/';

async function fetchBeta(ticker) {
  try {
    const response = await axios.get(BETA_URL, {
      params: { ticker, index: '^GSPC', interval: '1mo', observations: 12 },
      timeout: 10000,
    });

    const data = response.data?.data;
    if (data === undefined || data === null || typeof data !== 'number') {
      const error = new Error(`Newton Analytics response missing numeric beta for ticker: ${ticker}`);
      error.status = 502;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    const error = new Error(`Failed to reach Newton Analytics API: ${err.message}`);
    error.status = 503;
    throw error;
  }
}

module.exports = { fetchBeta };
