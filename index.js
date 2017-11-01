const Configuration = require('./lib/configuration')
const HaltedError = require('./lib/errors/halted')

module.exports = robot => {
  robot.on('*', async context => {
    const config = await Configuration.load(context, '.github/probot.js')
    return config.execute().catch(err => {
      if (err instanceof HaltedError) {
        robot.log.info(err)
      } else {
        throw err
      }
    })
  })
}
