const Plugin = require('../lib/plugin')

class TestPlugin extends Plugin {
  foo () {

  }
}

describe('Plugin', () => {
  const plugin = new TestPlugin()

  describe('api', () => {
    it('includes methods', () => {
      expect(plugin.api.indexOf('foo') >= 0).toBe(true)
    })

    it('excludes constructor', () => {
      expect(plugin.api.indexOf('constructor')).toBe(-1)
    })
  })
})
