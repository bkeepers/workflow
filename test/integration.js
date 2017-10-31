const Configuration = require('../lib/configuration')
const payload = require('./fixtures/webhook/comment.created.json')

const createSpy = jest.fn

describe('integration', () => {
  let context

  beforeEach(() => {
    context = {
      event: 'issues',
      payload,
      github: {
        issues: {
          createComment: createSpy().mockReturnValue(Promise.resolve()),
          edit: createSpy().mockReturnValue(Promise.resolve())
        },
        repos: {
          getContent: createSpy()
        }
      },
      issue: createSpy().mockImplementation(args => args),
      repo: createSpy().mockImplementation(args => args)
    }
  })

  function configure (content) {
    return new Configuration(context).parse(content)
  }

  describe('reply to new issue with a comment', () => {
    it('posts a coment', () => {
      const config = configure('on("issues").comment("Hello World!")')
      return config.execute(context).then(() => {
        expect(context.github.issues.createComment).toHaveBeenCalled()
      })
    })
  })

  describe('on an event with a different action', () => {
    it('does not perform behavior', () => {
      const config = configure('on("issues.labeled").comment("Hello World!")')

      return config.execute(context).catch(() => {
        expect(context.github.issues.createComment).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('filter', () => {
    beforeEach(() => {
      const payload = require('./fixtures/webhook/issues.labeled.json')

      Object.assign(context, {event: 'issues', payload})
    })

    it('calls action when condition matches', () => {
      const config = configure('on("issues.labeled").filter((e) => e.payload.label.name == "bug").close()')
      return config.execute(context).then(() => {
        expect(context.github.issues.edit).toHaveBeenCalled()
      })
    })

    it('does not call action when conditions do not match', () => {
      const config = configure('on("issues.labeled").filter((e) => e.payload.label.name == "foobar").close()')

      return config.execute(context).catch(() => {
        expect(context.github.issues.edit).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('include', () => {
    let content

    beforeEach(() => {
      content = require('./fixtures/content/probot.json')

      content.content = Buffer.from('on("issues").comment("Hello!");').toString('base64')
      context.github.repos.getContent.mockReturnValue(Promise.resolve(content))
    })

    it('includes a file in the local repository', () => {
      configure('include(".github/triage.js");')
      expect(context.github.repos.getContent).toHaveBeenCalledWith({
        path: '.github/triage.js'
      })
    })

    it('executes included rules', done => {
      configure('include(".github/triage.js");').execute().then(() => {
        expect(context.github.issues.createComment).toHaveBeenCalled()
        done()
      })
    })

    it('includes files relative to included repository', () => {
      context.github.repos.getContent.mockImplementation(params => {
        if (params.path === 'script-a.js') {
          return Promise.resolve({
            content: Buffer.from('include("script-b.js")').toString('base64')
          })
        } else {
          return Promise.resolve({content: ''})
        }
      })

      const config = configure('include("other/repo:script-a.js");')

      return config.execute().then(() => {
        expect(context.github.repos.getContent).toHaveBeenCalledWith({
          owner: 'other',
          repo: 'repo',
          path: 'script-b.js'
        })
      })
    })
  })

  describe('contents', () => {
    it('gets content from repo', () => {
      const content = {content: Buffer.from('file contents').toString('base64')}
      context.github.repos.getContent.mockReturnValue(Promise.resolve(content))

      const config = configure(`
        on("issues").comment(contents(".github/ISSUE_REPLY_TEMPLATE"));
      `)

      return config.execute().then(() => {
        expect(context.github.issues.createComment).toHaveBeenCalledWith({
          body: 'file contents'
        })
      })
    })

    it('gets contents relative to included repository', () => {
      context.github.repos.getContent.mockImplementation(params => {
        if (params.path === 'script-a.js') {
          return Promise.resolve({
            content: Buffer.from(`
              on("issues").comment(contents("content.md"));
            `).toString('base64')
          })
        } else {
          return Promise.resolve({content: ''})
        }
      })

      const config = configure('include("other/repo:script-a.js");')

      return config.execute().then(() => {
        expect(context.github.repos.getContent).toHaveBeenCalledWith({
          owner: 'other',
          repo: 'repo',
          path: 'content.md'
        })
      })
    })
  })
})
