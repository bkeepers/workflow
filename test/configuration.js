const path = require('path');
const expect = require('expect');
const Configuration = require('../lib/configuration');
const payload = require('./fixtures/webhook/comment.created');
const content = require('./fixtures/content/probot');

const createSpy = expect.createSpy;

content.data = {
  content: Buffer.from(`
    on("issues.opened")
      .comment("Hello World!")
      .assign("bkeepers");
  
    on("issues.closed")
      .unassign("bkeepers");
    `).toString('base64')
};

describe('Configuration', () => {
  describe('include', () => {
    let context;
    let config;

    beforeEach(() => {
      context = {
        payload,
        github: {
          repos: {
            getContent: createSpy().andReturn(Promise.resolve(content))
          }
        },
        issue: expect.createSpy(),
        repo: expect.createSpy()
      };
      config = new Configuration(context);
    });

    it('includes from the repo', () => {
      config.include('foo.js');

      expect(context.github.repos.getContent).toHaveBeenCalled();
      expect(context.repo).toHaveBeenCalledWith({
        path: path.join('.github', 'foo.js')
      });
    });

    it('returns undefined', () => {
      expect(config.include('foo.js')).toBe(undefined);
    });
  });
});
