const { createProxyMiddleware } = require('http-proxy-middleware');

// Use local backend when REACT_APP_USE_LOCAL_API=true (run backend with: cd backend && mvn spring-boot:run)
const apiTarget = process.env.REACT_APP_USE_LOCAL_API === 'true'
  ? 'http://localhost:8080'
  : 'https://api.wintaibot.com';

module.exports = function (app) {
  app.use(
    '/auth',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      secure: apiTarget.startsWith('https'),
    })
  );
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      secure: apiTarget.startsWith('https'),
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
