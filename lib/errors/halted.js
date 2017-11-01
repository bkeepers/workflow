module.exports = class HaltedError extends Error {
  constructor (context, ...params) {
    super(...params)
    this.context = context
  }
}
