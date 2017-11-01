const {createRobot} = require('probot')
const app = require('..')

describe('app', () => {
  let robot
  let github
  let context = {
    event: 'issues',
    payload: require(`./fixtures/webhook/comment.created`)
  }

  const configure = async (content, ctx) => {
    github.repos.getContent.mockImplementation(params => Promise.resolve({
      data: {
        content: Buffer
          .from(typeof content === 'function' ? content(params) : content)
          .toString('base64')
      }
    }))
    robot.auth = () => Promise.resolve(github)
    await robot.receive(ctx || context)
  }

  beforeEach(() => {
    robot = createRobot()
    app(robot)

    github = {
      repos: {
        getContent: jest.fn().mockReturnValue(Promise.resolve({}))
      },
      issues: {
        createComment: jest.fn(),
        edit: jest.fn()
      }
    }
  })

  describe('reply to new issue with a comment', () => {
    it('posts a comment', async () => {
      await configure(`
        on("issues")
          .comment("Hello World!");
        `)
      expect(github.issues.createComment).toHaveBeenCalled()
    })
  })

  describe('on an event with a different action', () => {
    it('does not perform behavior', async () => {
      await configure(`
        on("issues.labeled")
          .comment("Hello World!");
        `)
      expect(github.issues.createComment).toHaveBeenCalledTimes(0)
    })
  })

  describe('filter', () => {
    const context = {
      event: 'issues',
      payload: require(`./fixtures/webhook/issues.labeled`)
    }

    it('calls action when condition matches', async () => {
      await configure(`
        on("issues.labeled")
          .filter((e) => e.payload.label.name == "bug")
          .close();
        `, context)
      expect(github.issues.edit).toHaveBeenCalled()
    })

    it('does not call action when conditions do not match', async () => {
      await configure(`
        on("issues.labeled")
          .filter((e) => e.payload.label.name == "foobar")
          .close();
        `, context)
      expect(github.issues.edit).toHaveBeenCalledTimes(0)
    })
  })

  describe('include', () => {
    it('includes a file in the local repository', async () => {
      await configure(params => {
        if (params.path === '.github/triage.js') {
          return 'on("issues").comment("Hello!");'
        }
        return 'include(".github/triage.js");'
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'bkeepers-inc',
        repo: 'test',
        path: '.github/triage.js'
      })
    })

    it('executes included rules', async () => {
      await configure(params => {
        if (params.path === '.github/triage.js') {
          return 'on("issues").comment("Hello!");'
        }
        return 'include(".github/triage.js");'
      })
      expect(github.issues.createComment).toHaveBeenCalled()
    })

    it('includes files relative to included repository', async () => {
      await configure(params => {
        if (params.path === 'script-a.js') {
          return 'include("script-b.js")'
        }
        if (params.path === 'script-b.js') {
          return ''
        }
        return `
          include("other/repo:script-a.js");
          include("another/repo:script-a.js");
          include("script-b.js");
        `
      })
      expect(github.repos.getContent).toHaveBeenCalledTimes(1 + 3 + 2)
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'other',
        repo: 'repo',
        path: 'script-b.js'
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'another',
        repo: 'repo',
        path: 'script-b.js'
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'bkeepers-inc',
        repo: 'test',
        path: 'script-b.js'
      })
    })
  })

  describe('contents', () => {
    it('gets content from repo', async () => {
      await configure(params => {
        if (params.path === '.github/ISSUE_REPLY_TEMPLATE') {
          return 'file contents'
        }
        return 'on("issues").comment(contents(".github/ISSUE_REPLY_TEMPLATE"));'
      })
      expect(github.issues.createComment).toHaveBeenCalledWith({
        owner: 'bkeepers-inc',
        repo: 'test',
        number: context.payload.issue.number,
        body: 'file contents'
      })
    })

    it('gets contents relative to included repository', async () => {
      await configure(params => {
        if (params.path === 'script-a.js') {
          return 'on("issues").comment(contents("content.md"));'
        }
        if (params.path === 'content.md') {
          return ''
        }
        return 'include("other/repo:script-a.js");'
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'other',
        repo: 'repo',
        path: 'content.md'
      })
    })

    it('gets multiple contents without mismatching source parameters', async () => {
      await configure(params => {
        if (params.path === 'content.md' || params.path === 'label.md') {
          return ''
        }
        return `
          on("issues")
            .comment(contents("other/repo:content.md"))
            .comment(contents("label.md"));
        `
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'other',
        repo: 'repo',
        path: 'content.md'
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'bkeepers-inc',
        repo: 'test',
        path: 'label.md'
      })
    })
  })
})
