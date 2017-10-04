const path = require('path');
const Sandbox = require('./sandbox');
const Workflow = require('./workflow');

module.exports = class Configuration {
  static load(context, fileName, defaultConfig) {
    const params = context.repo({path: path.join('.github', fileName)});

    return context.github.repos.getContent(params)
      .then(res => {
        const config = new Configuration(context);
        return config.parse(Buffer.from(res.data.content, 'base64').toString());
      })
      .catch(err => {
        if (err.code === 404) {
          return defaultConfig || null;
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

  include(fileName) {
    const load = Configuration.load(this.context, fileName);

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
