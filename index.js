const Configuration = require('./lib/configuration')

module.exports = robot => {
  robot.on('*', async context => {
    const config = await Configuration.load(context, '.probot.js')
    return config.execute().catch(err => {
      if (err.message === 'halted') {
        robot.log.info(err)
      } else {
        throw err
      }
    })
  })
}
