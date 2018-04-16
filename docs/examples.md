# Examples

_**Heads up!** these examples include configuration options that are aspirational and not implemented yet._

Here are some examples of interesting things you can do by combining these components.

### Require use of issue template

```js
// .github/MISSING_ISSUE_TEMPLATE_AUTOREPLY.md
//
// Hey @{{ sender.login }}, thanks for opening an issue. Unfortunately, you
// are missing information from the issue template. Please open a new issue with
// all the information from the template and it will make it easier for us to
// help you.

on('issues.opened')
  .filter(context => !context.payload.issue.body.match(/### Steps to Reproduce/)
       || context.payload.issue.body.includes('- [ ]'))
  .comment(contents('.github/MISSING_ISSUE_TEMPLATE_AUTOREPLY.md'))
  .label('insufficient-info')
  .close();
```

### Mention a team when a label is applied

```js
on('issues.labeled')
  .filter(context => context.payload.label.name === 'plugins')
  .comment('Hey @jekyll/plugins, the `plugins` label was added');
```

### Post welcome message for new contributors

```js
on('issues.opened', 'pull_request.opened')
  .ifFirstTimeContributor() // TODO: plugins could implement conditions like this
  .comment(contents('.github/NEW_CONTRIBUTOR_TEMPLATE.md'));
```

### Auto-close new pull requests

```js
on('pull_request.opened')
  .comment('Sorry @{{ user.login }}, pull requests are not accepted on this repository.')
  .close();
```

### Close issues with no body

```js
on('issues.opened')
  .filter(context => context.payload.issue.body.match(/^$/))
  .comment("Hey @{{ user.login }}, you didn't include a description of the problem, so we're closing this issue.");
```

### @mention watchers when label added

```js
on('*.labeled')
  // TODO: figure out syntax for loading watchers from file
  .comment('Hey {{ mentions }}, you wanted to know when the `{{ payload.label.name }}` label was added.');
```

### Assign a reviewer for new bugs

```js
on('pull_request.labeled')
  .filter(context => context.payload.label.name === 'bug')
  .assign(random(contents('CODEOWNERS'))); // TODO: parser for CODEOWNERS
```

### Perform actions based on content of comments

```js
on('issue_comment.opened')
  .filter(context => context.payload.issue.body.match(/^@probot assign @(\w+)$/))
  .assign(matches[0]);

on('issue_comment.opened')
  .filter(context => context.payload.issue.body.match(/^@probot label @(\w+)$/))
  .label($1);
```

### Close stale issues and pull requests

```js
every('day') // TODO
  .find.issues({state: 'open', label: 'needs-work'})
  .filter.lastActive(7, 'days')
  .close();
```

### Tweet when a new release is created

```js
on('release.published')
  // TODO
  .tweet("Get it while it's hot! {{ repository.name }} {{ release.name }} was just released! {{ release.html_url }}");
```

### Assign a reviewer issues or pull requests with a label

```js
on('issues.opened', 'pull_request.opened', 'issues.labeled', 'pull_request.labeled')
  .filter.labeled('security') // TODO
  .assign(team('security-first-responders').random());
```

### Create a new project card in a project when an Issue is created

```js
on('issues.opened')
  .createCard({project:'myProject', column:'myColumn'});
```
