const Plugin = require('../plugin');

module.exports = class Filter extends Plugin {
  filter(context, fn) {
    return fn(context) || Promise.reject(new Error('halted'));
  }

  then(context, fn) {
    return fn(context);
  }

  on(context, ...events) {
    const res = events.find(e => {
      const [name, action] = e.split('.');
      return name === context.event && (!action || action === context.payload.action);
    });

    return res ? Promise.resolve(res) : Promise.reject(new Error('halted'));
  }
};
