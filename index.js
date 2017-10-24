const Configuration = require('./lib/configuration')
const Context = require('./lib/context')

module.exports = robot => {
  robot.on('*', async context => {
    const contextOld = new Context(context.github, context)
    const config = await Configuration.load(contextOld, '.probot.js')
    return config.execute()
  })
}
