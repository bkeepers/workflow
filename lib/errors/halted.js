module.exports = class HaltedError extends Error {
  constructor(event = '*', ...params) {
    super(...params);
    this.event = event;
  }
};
