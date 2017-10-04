const Filter = require('./plugins/filter');
const Issues = require('./plugins/issues');
const Projects = require('./plugins/projects');

const defaultPlugins = [
  new Filter(),
  new Issues(),
  new Projects()
];

module.exports = class Workflow {
  constructor(plugins = defaultPlugins) {
    this.stack = [];
    this.api = {};

    // Define a new function in the API for each plugin method
    for (const plugin of plugins) {
      for (const method of plugin.api) {
        this.api[method] = this.proxy(plugin[method]).bind(this);
      }
    }
  }

  /**
   * Return the API to allow methods to be chained
   *
   * Push new function on the stack that calls the plugin method with a context.
   * Resolve all args before passing to plugin.
   *
   * @param fn
   * @returns {function(...[*]=)}
   */
  proxy(fn) {
    return (...args) => {
      this.stack.push(context => Promise.all(args).then(args => fn(context, ...args)));

      return this.api;
    };
  }

  /**
   * Reduce the stack to a chain of promises, each called with the given context
   *
   * @param context
   * @returns {*}
   */
  execute(context) {
    return this.stack.reduce((promise, fn) => {
      return promise.then(fn.bind(fn, context));
    }, Promise.resolve());
  }
};
