const { app } = require('./app');
const { connectDatabase } = require('./config/database');
const { env } = require('./config/env');

async function startServer() {
  try {
    await connectDatabase();
    console.log('MongoDB connected');

    app.listen(env.port, () => {
      console.log(`ondo-voting-api listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
