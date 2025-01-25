module.exports = {
  apps: [
    {
      name: 'salon-interfaz',
      // get port from .env
      port: process.env.PORT || 3001,
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs'
    }
  ]
}