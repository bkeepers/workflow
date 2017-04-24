const Plugin = require('../plugin');

module.exports = class Projects extends Plugin {

  // creates a card, based on an issue, and adds to a column
  // accepts a content object in the format {project: 'ProjectName', column: 'ColumnName'}
  createCard(context, content) {
    return Promise.resolve().then(() => {

      // get all projects for repo
      getRepoProjects(context, content)
        // then get the projectID for desired project
        .then(function(response){
          return getID(response, content.project);
        })
        // then get the columns for that project
        .then(function(projectID){
          return getProjectColumns(context, projectID);
        })
        // then get the columnID for the desired column
        .then(function(projectColumns){
          return getID(projectColumns, content.column);
        })
        // then create the card
        .then(function(columnID){
          context.github.projects.createProjectCard({
            column_id: columnID,
            content_id: context.payload.issue.id,
            content_type: "Issue"
          });
        });
      return;
    });
  }

};

// Helper functions below

// function to get all repository projects
function getRepoProjects(context) {
  return context.github.projects.getRepoProjects({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name
  });
}

// function to return an ID based on a name
// looks through objects to find the object whose value for the 'name' key
// matches the 'name' parameter passed to the function and returns the ID of the object
function getID(objs, name) {
  for(var i = 0; i < objs.length; i++) {
    if(objs[i].name === name){
      return objs[i].id;
    }
  }
}

// function to get all columns in a project
function getProjectColumns(context, project_id) {
  return context.github.projects.getProjectColumns({
    project_id: project_id
  });
}
