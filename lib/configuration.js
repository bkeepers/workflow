const path = require('path');
const Sandbox = require('./sandbox');
const Workflow = require('./workflow');
const HaltedError = require('./errors/halted');

module.exports = class Configuration {
  static load(context, options, fallback) {
    if (typeof options === 'string') {
      options = {
        path: path.join('.github', options)
      };
    }
    const params = Object.assign({
      path: path.join('.github', '.probot.js')
    }, options);

    return context.github.repos.getContent(context.repo(params))
      .then(res => {
        const config = new Configuration(context);
        return config.parse(Buffer.from(res.data.content, 'base64').toString());
      })
      .catch(err => {
        if (err.code === 404) {
          return fallback || Promise.reject(new HaltedError('no config file'));
        }
        throw err;
      });
  }

  constructor(context) {
    this.context = context;
    this.workflows = [];

    this.api = {
      on: this.on.bind(this),
      include: this.include.bind(this)
    };
  }

  on(...events) {
    const workflow = new Workflow();
    this.workflows.push(workflow);
    return workflow.api.on(...events);
  }

  include(options) {
    const load = Configuration.load(this.context, options);

    this.workflows.push({
      execute() {
        return load.then(config => config.execute(this.context));
      }
    });

    return undefined;
  }

  parse(content) {
    new Sandbox(content).execute(this.api);
    return this;
  }

  execute() {
    return Promise.all(this.workflows.map(w => w.execute(this.context)));
  }
};
