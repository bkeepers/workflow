const handlebars = require('handlebars')
const Plugin = require('../plugin')

module.exports = class Issues extends Plugin {
  comment (context, content) {
    const template = handlebars.compile(content)(context.payload)
    return context.github.issues.createComment(context.issue({body: template}))
  }

  assign (context, ...assignees) {
    return context.github.issues.addAssigneesToIssue(context.issue({assignees}))
  }

  unassign (context, ...assignees) {
    return context.github.issues.removeAssigneesFromIssue(context.issue({body: {assignees}}))
  }

  label (context, ...labels) {
    return context.github.issues.addLabels(context.issue({body: labels}))
  }

  unlabel (context, ...labels) {
    return labels.map(label => {
      return context.github.issues.removeLabel(
        context.issue({name: label})
      )
    })
  }

  lock (context) {
    return context.github.issues.lock(context.issue({}))
  }

  unlock (context) {
    return context.github.issues.unlock(context.issue({}))
  }

  open (context) {
    return context.github.issues.edit(context.issue({state: 'open'}))
  }

  close (context) {
    return context.github.issues.edit(context.issue({state: 'closed'}))
  }

  deleteComment (context) {
    const comment = context.payload.comment
    const github = context.github

    const deleteFunction =
      (comment.pull_request_review_id && github.pullRequests.deleteComment) ||
      (comment.commit_id && github.repos.deleteCommitComment) ||
      github.issues.deleteComment

    return deleteFunction(context.repo({id: comment.id}))
  }

  createIssue (context, content) {
    return Promise.resolve(content.body).then(body => {
      const titleTemplate = handlebars.compile(content.title)(context.payload)
      const bodyTemplate = handlebars.compile(body)(context.payload)

      return context.github.issues.create(context.repo({
        title: titleTemplate,
        body: bodyTemplate,
        assignees: content.assignees,
        labels: content.labels
      }))
    })
  }
}
