const expect = require('expect');
const {createRobot} = require('probot');
const plugin = require('..');

describe('Probot', () => {
  let robot;
  let github;

  beforeEach(() => {
    robot = createRobot();
    plugin(robot);

    github = {
      repos: {
        getContent: expect.createSpy().andReturn(Promise.resolve({
          data: {
            content: Buffer.from(`
              on("issue_comment.created")
                .comment("Hello World!");
            `).toString('base64')
          }
        }))
      },
      issues: {
        createComment: expect.createSpy()
      }
    };

    robot.auth = () => Promise.resolve(github);
  });

  describe('reply to new issue with a comment', () => {
    it('posts a comment', async () => {
      const payload = require('./fixtures/webhook/comment.created');

      await robot.receive({event: 'issue_comment', payload});

      expect(github.issues.createComment).toHaveBeenCalled();
    });
  });
});
