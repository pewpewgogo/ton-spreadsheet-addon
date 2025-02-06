/**
 * @param address {string}
 * @param ticker {string}
 * @returns {*}
 */
function getBalanceForAddress(address, ticker) {
  const supportedTickers = ['TON', 'NOT', 'DOGS', 'PX', 'USDT'];
  if (!supportedTickers.includes(ticker)) {
    throw new Error('Invalid ticker');
  }
  return getCachedBalance(address, ticker);
}

/**
 * @param address {string}
 * @param format {"raw"|"bounceable"|"nonbounceable"|"testnet"}
 * @returns {*}
 */
function convertAddress(address, format = 'raw') {
  const supportedFormats = ['raw', 'bounceable', 'nonbounceable', 'testnet'];
  if (!supportedFormats.includes(format)) {
    throw new Error('Invalid format');
  }

  const addr = Address.parse(address);
  switch (format) {
    case 'raw':
      return addr.toRawString();
    case 'bounceable':
      return addr.toString({bounceable: true})
    case 'nonbounceable':
      return addr.toString({bounceable: false});
    case 'testnet':
      return addr.toString({testOnly: true});
  }
}