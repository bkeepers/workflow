const expect = require('expect');
const Issues = require('../../lib/plugins/issues');
const payload = require('../fixtures/webhook/comment.created');

const createSpy = expect.createSpy;

describe('plugins/Issues', () => {
  let context;
  let issues;

  beforeEach(() => {
    context = {
      payload,
      github: {
        issues: {
          createComment: createSpy(),

          addAssigneesToIssue: createSpy(),
          removeAssigneesFromIssue: createSpy(),

          addLabels: createSpy(),
          removeLabel: createSpy(),

          lock: createSpy(),
          unlock: createSpy(),

          edit: createSpy(),
          deleteComment: createSpy(),
          create: createSpy()
        },
        repos: {
          deleteCommitComment: createSpy()
        },
        pullRequests: {
          deleteComment: createSpy()
        }
      },
      issue: expect.createSpy(),
      repo: expect.createSpy()
    };
    issues = new Issues();
  });

  afterEach(() => expect.restoreSpies());

  describe('locking', () => {
    it('locks', () => {
      issues.lock(context);

      expect(context.github.issues.lock).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({});
    });

    it('unlocks', () => {
      issues.unlock(context);

      expect(context.github.issues.unlock).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({});
    });
  });

  describe('state', () => {
    it('opens an issue', () => {
      issues.open(context);

      expect(context.github.issues.edit).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({state: 'open'});
    });

    it('closes an issue', () => {
      issues.close(context);

      expect(context.github.issues.edit).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({state: 'closed'});
    });
  });

  describe('labels', () => {
    it('adds a label', () => {
      issues.label(context, 'hello');

      expect(context.github.issues.addLabels).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({body: ['hello']});
    });

    it('adds multiple labels', () => {
      issues.label(context, 'hello', 'world');

      expect(context.github.issues.addLabels).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({body: ['hello', 'world']});
    });

    it('removes a single label', () => {
      issues.unlabel(context, 'hello');

      expect(context.github.issues.removeLabel).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({name: 'hello'});
    });

    it('removes a multiple labels', () => {
      issues.unlabel(context, 'hello', 'goodbye');

      expect(context.github.issues.removeLabel).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({name: 'hello'});
      expect(context.issue).toHaveBeenCalledWith({name: 'goodbye'});
    });
  });

  describe('comments', () => {
    it('creates a comment', () => {
      issues.comment(context, 'Hello world!');

      expect(context.github.issues.createComment).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({body: 'Hello world!'});
    });

    it('evaluates templates with handlebars', () => {
      issues.comment(context, 'Hello @{{ sender.login }}!');

      expect(context.github.issues.createComment).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({body: 'Hello @bkeepers!'});
    });
  });

  describe('assignment', () => {
    it('assigns a user', () => {
      issues.assign(context, 'bkeepers');

      expect(context.github.issues.addAssigneesToIssue).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({assignees: ['bkeepers']});
    });

    it('assigns multiple users', () => {
      issues.assign(context, 'hello', 'world');

      expect(context.github.issues.addAssigneesToIssue).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({assignees: ['hello', 'world']});
    });

    it('unassigns a user', () => {
      issues.unassign(context, 'bkeepers');

      expect(context.github.issues.removeAssigneesFromIssue).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({body: {assignees: ['bkeepers']}});
    });

    it('unassigns multiple users', () => {
      issues.unassign(context, 'hello', 'world');

      expect(context.github.issues.removeAssigneesFromIssue).toHaveBeenCalled();
      expect(context.issue).toHaveBeenCalledWith({body: {assignees: ['hello', 'world']}});
    });
  });

  describe('deleteComment', () => {
    it('deletes an issue comment', () => {
      issues.deleteComment(context);

      expect(context.github.issues.deleteComment).toHaveBeenCalled();
      expect(context.repo).toHaveBeenCalledWith({id: 252508381});
    });

    it('deletes a commit comment', () => {
      context.payload = require('../fixtures/webhook/commit_comment.created');

      issues.deleteComment(context);

      expect(context.github.repos.deleteCommitComment).toHaveBeenCalled();
      expect(context.repo).toHaveBeenCalledWith({id: 20067099});
    });

    it('deletes a PR comment', () => {
      context.payload = require('../fixtures/webhook/pull_request_review_comment.created');

      issues.deleteComment(context);

      expect(context.github.pullRequests.deleteComment).toHaveBeenCalled();
      expect(context.repo).toHaveBeenCalledWith({id: 90805181});
    });
  });

  describe('createIssue', () => {
    it('creates an issue', () => {
      return issues.createIssue(context, {title: 'testing', body: 'body'}).then(() => {
        expect(context.github.issues.create).toHaveBeenCalled();
        expect(context.repo).toHaveBeenCalledWith({
          title: 'testing',
          body: 'body',
          assignees: undefined,
          labels: undefined
        });
      });
    });

    it('resolves body content', () => {
      return issues.createIssue(context, {title: 'testing', body: Promise.resolve('body')}).then(() => {
        expect(context.github.issues.create).toHaveBeenCalled();
        expect(context.repo).toHaveBeenCalledWith({
          title: 'testing',
          body: 'body',
          assignees: undefined,
          labels: undefined
        });
      });
    });

    it('sets optional parameters', () => {
      return issues.createIssue(context, {title: 'testing', body: 'body', assignees: ['bkeepers'], labels: ['hello']}).then(() => {
        expect(context.github.issues.create).toHaveBeenCalled();
        expect(context.repo).toHaveBeenCalledWith({
          title: 'testing',
          body: 'body',
          assignees: ['bkeepers'],
          labels: ['hello']
        });
      });
    });
  });
});
