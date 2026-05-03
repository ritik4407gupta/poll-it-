module.exports = {
  apps: [
    {
      name: 'poll-it',
      script: 'npx',
      args: 'serve -l 3000 .',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
