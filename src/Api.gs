// API.gs

const API_URL = 'https://your-api-endpoint.com';

function getBalance(address, ticker) {
  const userToken = getUserToken();
  const url = `https://${API_URL}/balance/${ticker}/${address}`;
  const options = {
    headers: {
      Authorization: userToken ? `Bearer ${userToken}` : '',
    },
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  return data.balance;
}

function setUserToken(token) {
  PropertiesService.getUserProperties().setProperty('API_TOKEN', token);
}

function getUserToken() {
  return PropertiesService.getUserProperties().getProperty('API_TOKEN');
}

function getCachedBalance(address, ticker) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `${address}_${ticker}`;
  const cachedBalance = cache.get(cacheKey);

  if (cachedBalance) {
    return cachedBalance;
  } else {
    const balance = getBalance(address, ticker);
    cache.put(cacheKey, balance, 600); // 10 minutes
    return balance;
  }
}