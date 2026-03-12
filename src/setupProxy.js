const { createProxyMiddleware } = require('http-proxy-middleware');

// Auth + API: api.wintaibot.com (or localhost:8080 when REACT_APP_USE_LOCAL_API=true)
const apiTarget = process.env.REACT_APP_USE_LOCAL_API === 'true'
  ? 'http://localhost:8080'
  : 'https://api.wintaibot.com';

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      secure: true,
    })
  );
  app.use(
    '/ai',
    createProxyMiddleware({
      target: 'https://api.wintaibot.com',
      changeOrigin: true,
      secure: true,
    })
  );
};
