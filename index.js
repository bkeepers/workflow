const Configuration = require('./lib/configuration');
const HaltedError = require('./lib/errors/halted');

module.exports = robot => {
  robot.on('*', async context => {
    const config = await Configuration.load(context, '.probot.js');
    return config.execute();
  }).catch(HaltedError, err => {
    this.log.info(err);
  });
};
