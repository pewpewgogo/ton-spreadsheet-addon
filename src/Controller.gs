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
  const supportedFormats = ['raw', 'bounceable', 'nonbounceable', 'testnet', 'r', 'b', 'u', 't'];
  if (!supportedFormats.includes(format)) {
    throw new Error('Invalid type. Please use one of r|b|n|t');
  }

  const addr = new Address(address);
  switch (format) {
    case 'r':
    case 'raw':
      return addr.toString(false, true, true, false);
    case 'bounceable':
    case 'b':
      return addr.toString(true, true, true, false);
    case 'nonbounceable':
    case 'u':
      return addr.toString(true, true, false, false);
    case 'testnet':
    case 't':
      return addr.toString(true, true, true, true);
    default:
      throw new Error('Invalid format or type as a second argument');
  }
}