module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './packages/backend',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'frontend',
      cwd: './packages/frontend',
      script: '../../node_modules/vite/bin/vite.js',
      args: 'preview --port 5173 --host',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
