const expect = require('expect');
const Projects = require('../../lib/plugins/projects');
const Context = require('../../lib/context');
const payload = require('../fixtures/webhook/issue.created.json');

const createSpy = expect.createSpy;

describe('projects plugin', () => {

  let context;
  let github;

  before(() => {
    github = {
      projects: {
        createProjectCard: createSpy(),
        getProjectColumns: createSpy(),
        getRepoProjects: createSpy(),
      }
    };
    context = new Context(github, {payload});
    this.projects = new Projects();
  });

  describe('create cards', () => {
    it('creates a card', () => {
      this.projects.createCard(context, {project:'myProject', column:'myColumn'});
      
      expect(github.projects.getRepoProjects).toHaveBeenCalled();
    });
  });

});
