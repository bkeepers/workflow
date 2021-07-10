const Sandbox = require('./sandbox')
const Workflow = require('./workflow')
const url = require('./util/github-url')

module.exports = class Configuration {
  static load (context, path, source) {
    const options = context.repo(url(path, source))
    const config = new Configuration(context, options)
    return config.contents().then(buffer => config.parse(buffer))
  }

  constructor (context, source) {
    this.context = context
    this.source = source || {}
    this.workflows = []

    this.api = {
      on: this.on.bind(this),
      include: this.include.bind(this),
      contents: this.contents.bind(this)
    }
  }

  on (...events) {
    const workflow = new Workflow()
    this.workflows.push(workflow)
    return workflow.api.on(...events)
  }

  include (path) {
    const load = Configuration.load(this.context, path, this.source)

    this.workflows.push({
      execute () {
        return load.then(config => config.execute(this.context))
      }
    })
  }

  contents (path) {
    const options = path
      ? this.context.repo(url(path, this.source))
      : this.source
    return this.context.octokit.repos.getContent(options).then(res =>
      Buffer.from(res.data.content, 'base64').toString()
    )
  }

  parse (content) {
    new Sandbox(content).execute(this.api)
    return this
  }

  execute () {
    return Promise.all(this.workflows.map(w => w.execute(this.context)))
  }
}
