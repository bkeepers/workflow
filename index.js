const Configuration = require('./lib/configuration')
const Context = require('./lib/context')

module.exports = robot => {
  robot.on('*', receive)

  async function receive (event) {
    if (event.payload.repository) {
      const github = await robot.auth(event.payload.installation.id)
      const context = new Context(github, event)
      const config = await Configuration.load(context, '.probot.js')
      return config.execute()
    }
  }
}
