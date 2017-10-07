const expect = require('expect');
const Projects = require('../../lib/plugins/projects');
const payload = require('../fixtures/webhook/issue.created');
const projects = require('../fixtures/projects');

const createSpy = expect.createSpy;

describe('plugins/Projects', () => {
  let context;

  beforeEach(() => {
    context = {
      payload,
      github: {
        projects: {
          createProjectCard: createSpy(),
          getProjectColumns: createSpy().andReturn(Promise.resolve([projects])),
          getRepoProjects: createSpy().andReturn(Promise.resolve([projects]))
        }
      }
    };
    this.projects = new Projects();
  });

  describe('createCard', () => {
    it('creates a project card', () => {
      this.projects.createCard(context, {project: 'myProject', column: 'myProject'}).then(() => {
        expect(context.github.projects.getRepoProjects).toHaveBeenCalledWith({
          owner: 'pholleran',
          repo: 'test'
        });
      });
    });
  });
});
