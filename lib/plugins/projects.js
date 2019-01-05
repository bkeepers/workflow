const Plugin = require('../plugin')

module.exports = class Projects extends Plugin {
  /**
   * Creates a card, based on an issue, and adds to a column
   *
   * @param context
   * @param content object in the format {project: 'ProjectName', column: 'ColumnName'}
   * @returns {Promise.<*>}
   */
  createCard (context, content) {
    return Promise.resolve().then(() => {
      // Get all projects for repo
      Projects.listForRepo(context)
      // Then get the projectID for desired project
        .then(response => Projects.getID(response, content.project))
        // Then get the columns for that project
        .then(projectID => Projects.getProjectColumns(context, projectID))
        // Then get the columnID for the desired column
        .then(projectColumns => Projects.getID(projectColumns, content.column))
        // Then create the card
        .then(columnID => {
          context.github.projects.createProjectCard({
            column_id: columnID,
            content_id: context.payload.issue.id,
            content_type: 'Issue'
          })
        })
    })
  }

  /**
   * Get all repository projects
   *
   * @param context
   * @returns {*}
   */
  static listForRepo (context) {
    return context.github.projects.listForRepo({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name
    })
  }

  /**
   * Get an ID based on a name
   *
   * looks through objects to find the object whose value for the 'name' key
   * matches the 'name' parameter passed to the function and returns the ID
   * of the object.
   *
   * @param objs
   * @param name
   */
  static getID (objs, name) {
    return objs.find(obj => obj.name === name)['id'] || 0
  }

  /**
   * Get all columns in a project
   *
   * @param context
   * @param projectId
   * @returns {*}
   */
  static getProjectColumns (context, projectId) {
    return context.github.projects.getProjectColumns({projectId})
  }
}
