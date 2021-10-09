const Plugin = require('../plugin')
const HaltedError = require('../errors/halted')

module.exports = class Filter extends Plugin {
  filter (context, fn) {
    return fn(context) ||
      Promise.reject(new HaltedError('Filter have rejected the event'))
  }

  then (context, fn) {
    return fn(context)
  }

  on (context, ...events) {
    const res = events.find(e => {
      const [name, action] = e.split('.')
      return name === context.name && (!action || action === context.payload.action)
    })

    return res
      ? Promise.resolve(res)
      : Promise.reject(new HaltedError('Current event does not match'))
  }
}
