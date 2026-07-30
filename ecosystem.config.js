module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './packages/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'root',
        DB_PASSWORD: '',
        DB_NAME: 'myapp',
        JWT_SECRET: '',
      },
    },
    {
      name: 'frontend',
      cwd: './packages/frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 5173 --host',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
