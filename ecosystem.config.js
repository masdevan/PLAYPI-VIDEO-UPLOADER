module.exports = {
    apps: [
      {
        name: "playpi",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  }