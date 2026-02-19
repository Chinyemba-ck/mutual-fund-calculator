// 25 equity/bond mutual funds — all verified to return valid beta from Newton Analytics API.
// All support /api/calculate (CAPM + continuous compounding future value).

const { fetchBeta } = require('./betaService');
const { fetchExpectedReturn } = require('./historicalReturnService');

// Risk-free rate: US 10-year Treasury yield, hardcoded per spec
const RISK_FREE_RATE = 0.0425;

const FUNDS = [
  { name: 'Vanguard Total Stock Market Index Fund;Institutional Plus', ticker: 'VSMPX' },
  { name: 'Fidelity 500 Index Fund',                                   ticker: 'FXAIX' },
  { name: 'Vanguard 500 Index Fund;Admiral',                           ticker: 'VFIAX' },
  { name: 'Vanguard Total Stock Market Index Fund;Admiral',            ticker: 'VTSAX' },
  { name: 'Vanguard Total International Stock Index Fund;Investor',    ticker: 'VGTSX' },
  { name: 'Fidelity Strategic Advisers Fidelity US Total Stk',        ticker: 'FCTDX' },
  { name: 'Vanguard Institutional Index Fund;Inst Plus',               ticker: 'VIIIX' },
  { name: 'Vanguard Total Bond Market II Index Fund;Institutional',    ticker: 'VTBNX' },
  { name: 'American Funds Growth Fund of America;A',                   ticker: 'AGTHX' },
  { name: 'Vanguard Total Bond Market II Index Fund;Investor',         ticker: 'VTBIX' },
  { name: 'Fidelity Contrafund',                                       ticker: 'FCNTX' },
  { name: 'PIMCO Income Fund;Institutional',                           ticker: 'PIMIX' },
  { name: 'T. Rowe Price Blue Chip Growth Fund',                       ticker: 'TRBCX' },
  { name: 'Dodge & Cox Stock Fund',                                    ticker: 'DODGX' },
  { name: 'Dodge & Cox International Stock Fund',                      ticker: 'DODFX' },
  { name: 'Vanguard Wellington Fund;Investor',                         ticker: 'VWELX' },
  { name: 'Vanguard US Growth Fund;Investor',                          ticker: 'VWUSX' },
  { name: 'Vanguard Dividend Growth Fund;Investor',                    ticker: 'VDIGX' },
  { name: 'Vanguard Health Care Fund;Investor',                        ticker: 'VGHCX' },
  { name: 'Vanguard PRIMECAP Core Fund;Investor',                      ticker: 'VPCCX' },
  { name: 'Legg Mason ClearBridge Large Cap Growth Fund',              ticker: 'LMGTX' },
  { name: 'PIMCO Income Fund;A',                                       ticker: 'PONAX' },
  { name: 'Templeton Global Bond Fund;A',                              ticker: 'TPINX' },
  { name: 'Invesco Gold & Special Minerals Fund;A',                    ticker: 'OPGSX' },
  { name: 'American Funds Capital Income Builder;A',                   ticker: 'CAIBX' },
];

function getAllFunds() {
  return FUNDS;
}

function validateTicker(ticker) {
  const found = FUNDS.some(f => f.ticker.toUpperCase() === ticker.toUpperCase());
  if (!found) {
    const error = new Error(`Ticker not found in supported fund list: ${ticker}`);
    error.status = 404;
    throw error;
  }
}

// Steps:
//  1. Fetch beta from Newton Analytics
//  2. Fetch expected return from Yahoo Finance (previous year)
//  3. r = riskFreeRate + beta * (expectedReturn - riskFreeRate)  [CAPM]
//  4. FV = principal * e^(r * years)                             [continuous compounding]
async function calculate(ticker, principal, years) {
  const beta = await fetchBeta(ticker);
  const expectedReturnRate = await fetchExpectedReturn(ticker);

  const capmRate = RISK_FREE_RATE + beta * (expectedReturnRate - RISK_FREE_RATE);
  const futureValue = principal * Math.exp(capmRate * years);

  return { ticker, principal, years, beta, expectedReturnRate, riskFreeRate: RISK_FREE_RATE, capmRate, futureValue };
}

module.exports = { getAllFunds, validateTicker, calculate };
