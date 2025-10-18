import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lectana API running on port ${PORT}`);
  console.log(`🔧 CORS configured for production`);
  console.log(`📡 Routes configured: /api/* and /* (compatibility mode)`);
  console.log(`🕐 Server started at: ${new Date().toISOString()}`);
});
