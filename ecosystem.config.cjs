module.exports = {
  apps: [
    {
      name: 'salon-interfaz',
      port: '3001',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs'
    }
  ]
}