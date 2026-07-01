module.exports = {
  apps: [
    {
      name: 'mtba-backend',
      cwd: './code/backend',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'mtba-frontend',
      cwd: './code/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
