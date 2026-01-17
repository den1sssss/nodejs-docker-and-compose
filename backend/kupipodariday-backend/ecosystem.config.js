module.exports = {
  apps: [{
    name: 'kupipodariday-backend',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    }
  }],
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'ubuntu',
      host: process.env.DEPLOY_HOST,
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO,
      path: process.env.DEPLOY_PATH || '/home/ubuntu/kupipodariday-backend',
      'pre-deploy-local': 'echo "Copying .env file to server..." && scp .env $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/.env || echo "Warning: .env file not found locally"',
      'post-deploy': 'cp shared/.env .env 2>/dev/null || true && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'post-setup': '',
      ssh_options: 'StrictHostKeyChecking=no'
    }
  }
};
