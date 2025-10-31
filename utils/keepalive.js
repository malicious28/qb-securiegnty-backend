// Keep-Alive service for Render / similar free-tier hosts
// Default behavior: ping the lightweight /wake-up endpoint (no DB hit)
// To deliberately ping /health (which performs a DB check), set
// KEEPALIVE_DB_PING=true OR KEEPALIVE_PATH=/health in the environment.
class KeepAliveService {
  constructor(serverUrl, options = {}) {
    this.serverUrl = serverUrl.replace(/\/+$/, ''); // strip trailing slash
    this.interval = null;

    // Determine which path to ping. Default to /wake-up to avoid hitting DB.
    const envPath = process.env.KEEPALIVE_PATH;
    const envDbPing = process.env.KEEPALIVE_DB_PING;

    if (envPath) {
      this.path = envPath;
    } else if (envDbPing && envDbPing.toLowerCase() === 'true') {
      this.path = '/health';
    } else if (options.path) {
      this.path = options.path;
    } else {
      this.path = '/wake-up';
    }
  }

  async pingServer() {
    const url = `${this.serverUrl}${this.path}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`✅ Keep-alive ping successful -> ${this.path}`);
      } else {
        console.log(`⚠️ Keep-alive ping failed (${response.status}) -> ${this.path}`);
      }
    } catch (error) {
      console.log(`❌ Keep-alive error (${this.path}):`, error.message);
    }
  }

  startKeepAlive() {
    // Ping every 14 minutes (Render sleeps after ~15 minutes)
    this.interval = setInterval(() => this.pingServer(), 14 * 60 * 1000);

    console.log(`🔁 Keep-alive service started (14min intervals) -> path: ${this.path}`);

    // Initial ping after 1 minute to avoid accidental immediate DB load
    setTimeout(() => this.pingServer(), 60 * 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ Keep-alive service stopped');
    }
  }
}

module.exports = KeepAliveService;
