# Fun Budget - Deployment Guide

## Overview
Fun Budget is a lightweight family budgeting application designed for easy self-hosting on Proxmox or any Docker-compatible environment.

## Features
- Multi-user budget management
- Recurring funding rules with idempotency
- Overflow/rollover policies
- Quick expense entry (5-second feature)
- Multi-language support (English/Portuguese)
- SQLite database for easy backup
- Responsive web interface

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fun-budget
   ```

2. **Build and start the application**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000

### Manual Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in `apps/backend/` (optional, defaults to local SQLite):
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Set up the database**
   ```bash
   npm run prisma:migrate -w apps/backend
   ```

4. **Build the application**
   ```bash
   npm run build --workspaces
   ```

5. **Start the services**
   ```bash
   # Terminal 1: Backend
   cd apps/backend && npm start
   
   # Terminal 2: Frontend
   cd apps/frontend && npm run dev
   ```

## Proxmox Deployment

### Option 1: Docker Container (Recommended)

1. **Create a new LXC container** with Docker support
2. **Install Docker and Docker Compose**
   ```bash
   apt update && apt install docker.io docker-compose -y
   ```
3. **Deploy using the steps above**

### Option 2: LXC Container with Node.js

1. **Create a new LXC container** with Ubuntu/Debian
2. **Install Node.js 18+**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. **Follow manual installation steps**

## Backup and Recovery

### SQLite Database Backup
The application uses SQLite for data storage. The database file is located at:
```
./data/dev.db
```

**Backup command:**
```bash
# While the application is stopped
cp ./data/dev.db ./backups/dev-$(date +%Y%m%d-%H%M%S).db
```

**Recovery command:**
```bash
# Stop the application first
cp ./backups/dev-YYYYMMDD-HHMMSS.db ./data/dev.db
# Restart the application
```

### Online Backup (SQLite)
```bash
# Create backup while application is running
sqlite3 ./data/dev.db ".backup ./backups/dev-$(date +%Y%m%d-%H%M%S).db"
```

## Configuration

### Environment Variables
- `NODE_ENV`: Set to `production` for production deployment
- `DATABASE_URL`: SQLite database file path (default: `file:./data/dev.db`)

### Nginx Configuration
The frontend includes a pre-configured nginx setup for production deployment with API proxy.

## Security Considerations

1. **Change default ports** if exposing to the internet
2. **Use HTTPS** with a reverse proxy (nginx, traefik, etc.)
3. **Regular backups** of the SQLite database
4. **Firewall rules** to restrict access

## Monitoring

### Health Checks
- Backend: `GET /health` (returns 200 if healthy)
- Frontend: Check if the web interface loads

### Logs
```bash
# Docker logs
docker-compose logs -f

# Application logs (if running manually)
tail -f apps/backend/logs/*.log
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure the `./data` directory exists and is writable
   - Check SQLite file permissions

2. **Port conflicts**
   - Modify `docker-compose.yml` to use different ports
   - Update nginx configuration accordingly

3. **Build failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Performance Optimization
- SQLite database: Use WAL mode for better concurrency
- Frontend: Enable gzip compression in nginx
- Backend: Consider PM2 for process management in production

## Updates

### Updating the Application
1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Database Migrations
For Docker deployments, migrations run automatically on container startup.

For manual updates:
```bash
npm run migrate:prod -w apps/backend
```

## Support

For issues and questions:
- Check the logs first
- Verify configuration files
- Test with a fresh database backup
- Review the troubleshooting section above