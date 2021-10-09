const Configuration = require('./lib/configuration')
const HaltedError = require('./lib/errors/halted')

module.exports = robot => {
  robot.webhooks.onAny(async context => {
    const config = await Configuration.load(context, '.github/probot.js')
    return config.execute().catch(err => {
      if (err instanceof HaltedError) {
        context.log.info(err)
      } else {
        throw err
      }
    })
  })
}
