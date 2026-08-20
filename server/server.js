// server/server.js
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 LIGHTINMOTION Backend Server running at http://localhost:${PORT}`);
});
