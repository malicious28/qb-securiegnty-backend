// Simple Keep-Alive for Render Free Tier
class KeepAliveService {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.interval = null;
  }

  async pingServer() {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      if (response.ok) {
        console.log('✅ Keep-alive ping successful');
      } else {
        console.log('⚠️ Keep-alive ping failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Keep-alive error:', error.message);
    }
  }

  startKeepAlive() {
    // Ping every 14 minutes (Render sleeps after 15 minutes)
    this.interval = setInterval(() => {
      this.pingServer();
    }, 14 * 60 * 1000); // 14 minutes

    console.log('� Keep-alive service started (14min intervals)');
    
    // Initial ping after 1 minute
    setTimeout(() => this.pingServer(), 60000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('� Keep-alive service stopped');
    }
  }
}

module.exports = KeepAliveService;
