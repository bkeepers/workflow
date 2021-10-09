const handlebars = require('handlebars')
const Plugin = require('../plugin')

module.exports = class Issues extends Plugin {
  comment (context, content) {
    const template = handlebars.compile(content)(context.payload)
    return context.octokit.issues.createComment(context.issue({body: template}))
  }

  assign (context, ...assignees) {
    return context.octokit.issues.addAssigneesToIssue(context.issue({assignees}))
  }

  unassign (context, ...assignees) {
    return context.octokit.issues.removeAssigneesFromIssue(context.issue({body: {assignees}}))
  }

  label (context, ...labels) {
    return context.octokit.issues.addLabels(context.issue({labels}))
  }

  unlabel (context, ...labels) {
    return labels.map(label => {
      return context.octokit.issues.removeLabel(
        context.issue({name: label})
      )
    })
  }

  lock (context) {
    return context.octokit.issues.lock(context.issue({}))
  }

  unlock (context) {
    return context.octokit.issues.unlock(context.issue({}))
  }

  open (context) {
    return context.octokit.issues.update(context.issue({state: 'open'}))
  }

  close (context) {
    return context.octokit.issues.update(context.issue({state: 'closed'}))
  }

  deleteComment (context) {
    const comment = context.payload.comment
    const github = context.octokit

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

      return context.octokit.issues.create(context.repo({
        title: titleTemplate,
        body: bodyTemplate,
        assignees: content.assignees,
        labels: content.labels
      }))
    })
  }
}
