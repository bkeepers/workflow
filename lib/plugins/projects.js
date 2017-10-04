const Plugin = require('../plugin');

module.exports = class Projects extends Plugin {

  // Creates a card, based on an issue, and adds to a column
  // Accepts a content object in the format {project: 'ProjectName', column: 'ColumnName'}
  createCard(context, content) {
    return Promise.resolve().then(() => {
      // Get all projects for repo
      getRepoProjects(context, content)
        // Then get the projectID for desired project
        .then(response => getID(response, content.project))
        // Then get the columns for that project
        .then(projectID => getProjectColumns(context, projectID))
        // Then get the columnID for the desired column
        .then(projectColumns => getID(projectColumns, content.column))
        // Then create the card
        .then(columnID => {
          context.github.projects.createProjectCard({
            column_id: columnID,
            content_id: context.payload.issue.id,
            content_type: 'Issue'
          });
        });
    });
  }

};

// Helper functions below

// Function to get all repository projects
function getRepoProjects(context) {
  return context.github.projects.getRepoProjects({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name
  });
}

// Function to return an ID based on a name
// looks through objects to find the object whose value for the 'name' key
// matches the 'name' parameter passed to the function and returns the ID of the object
function getID(objs, name) {
  for (let i = 0; i < objs.length; i++) {
    if (objs[i].name === name) {
      return objs[i].id;
    }
  }
}

// Function to get all columns in a project
function getProjectColumns(context, project_id) {
  return context.github.projects.getProjectColumns({
    project_id
  });
}
