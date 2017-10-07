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
              on('issue_comment.created')
                .comment('Hello World!');
            `).toString('base64')
          }
        }))
      },
      issues: {
        createComment: expect.createSpy(),
        edit: expect.createSpy()
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

  // describe('on an event with a different action', () => {
  //   it('does not perform behavior', async () => {
  //     const payload = require('./fixtures/webhook/issue.created');
  //
  //     await robot.receive({event: 'issues', payload});
  //
  //     expect(github.issues.createComment).toNotHaveBeenCalled();
  //   });
  // });
  //
  // describe('filter', () => {
  //   it('calls action when condition matches', async () => {
  //     const payload = require('./fixtures/webhook/issues.labeled');
  //
  //     await robot.receive({event: 'issues', payload});
  //
  //     expect(github.issues.edit).toHaveBeenCalled();
  //   });
  //
  //   it('does not call action when conditions do not match', async () => {
  //     github.repos.getContent.andReturn(Promise.resolve({
  //       data: {
  //         content: Buffer.from(`
  //           on('issues.labeled')
  //             .filter(context => context.payload.label.name == 'foobar')
  //             .close()
  //         `).toString('base64')
  //       }
  //     }));
  //     const payload = require('./fixtures/webhook/issues.labeled');
  //
  //     await robot.receive({event: 'issues', payload});
  //
  //     expect(github.issues.edit).toNotHaveBeenCalled();
  //   });
  // });
});
