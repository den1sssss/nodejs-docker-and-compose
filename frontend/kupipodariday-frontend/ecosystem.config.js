module.exports = {
  apps: [{
    name: 'kupipodariday-frontend',
    script: 'serve',
    args: '-s build -l 3000',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000'
    }
  }],
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'ubuntu',
      host: process.env.DEPLOY_HOST,
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO,
      path: process.env.DEPLOY_PATH || '/home/ubuntu/kupipodariday-frontend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'post-setup': '',
      ssh_options: 'StrictHostKeyChecking=no'
    }
  }
};

