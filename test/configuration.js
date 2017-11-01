const Configuration = require('../lib/configuration')
const content = require('./fixtures/content/probot.json')
const payload = require('./fixtures/webhook/comment.created')

const createSpy = jest.fn

content.data = {
  content: Buffer.from(`
    on("issues.opened")
      .comment("Hello World!")
      .assign("bkeepers");
  
    on("issues.closed")
      .unassign("bkeepers");
    `).toString('base64')
}

describe('Configuration', () => {
  describe('include', () => {
    let context
    let config

    beforeEach(() => {
      context = {
        payload,
        github: {
          repos: {
            getContent: createSpy().mockReturnValue(Promise.resolve(content))
          }
        },
        issue: createSpy().mockImplementation(args => args),
        repo: createSpy().mockImplementation(args => args)
      }
      config = new Configuration(context)
    })

    it('includes from the repo', () => {
      config.include('foo.js')
      expect(context.github.repos.getContent).toHaveBeenCalledWith({
        path: 'foo.js'
      })
    })

    it('returns undefined', () => {
      expect(config.include('foo.js')).toBe(undefined)
    })

    it('includes from another repository', () => {
      config.include('atom/configs:foo.js#branch')
      expect(context.github.repos.getContent).toHaveBeenCalledWith({
        owner: 'atom',
        repo: 'configs',
        path: 'foo.js',
        ref: 'branch'
      })
    })
  })
})
