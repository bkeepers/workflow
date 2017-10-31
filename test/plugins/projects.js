const Projects = require('../../lib/plugins/projects')
const payload = require('../fixtures/webhook/issue.created.json')

const createSpy = jest.fn

describe('projects plugin', () => {
  let context
  let projects

  beforeEach(() => {
    context = {
      payload,
      github: {
        projects: {
          createProjectCard: createSpy(),
          getProjectColumns: createSpy().mockReturnValue(Promise.resolve([require('../fixtures/projects')])),
          getRepoProjects: createSpy().mockReturnValue(Promise.resolve([require('../fixtures/projects')]))
        }
      }
    }
    projects = new Projects()
  })

  describe('createCard', () => {
    it('creates a project card', () => {
      projects.createCard(context, {project: 'myProject', column: 'New'}).then(() => {
        expect(context.github.projects.getRepoProjects).toHaveBeenCalledWith({
          owner: 'pholleran',
          repo: 'test'
        })
      })
    })
  })
})
