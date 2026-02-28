const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy API requests to api.wintaibot.com (avoids CORS/403 in dev)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.wintaibot.com',
      changeOrigin: true,
    })
  );
  // Proxy /ai to AWS backend (for other features)
  app.use(
    '/ai',
    createProxyMiddleware({
      target: 'http://wintspringbootaws.eba-2kvb9tdk.us-east-2.elasticbeanstalk.com',
      changeOrigin: true,
    })
  );
};
