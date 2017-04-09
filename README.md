# Probot: Workflow

> a GitHub Integration built with [probot](https://github.com/probot/probot) that enables workflow automation via `.probot.js` file in your repository.

## Installing

_**Heads up!** The [demo integration](https://github.com/integration/probot-demo) is for demo purposes only. It is very likely to go away at some point, so please don't use it for production purposes._

0. Go to the **[demo integration](https://github.com/integration/probot-demo)**, click **Install**, and then select an organization.
0. Create a `.probot.js` file in your repository with the following contents. See [Configuration](docs/configuration.md) for more information on what behaviors can be built.

        on('issues.opened').comment(`
          Hello @{{ sender.login }}. Thanks for inviting me to your project.
          Read more about [all the things I can help you with][config]. I can't
          wait to get started!

          [config]: https://github.com/bkeepers/PRobot/blob/master/docs/configuration.md
        `);

        include("probot/workflow:docs/demo.js");

0. Open a new issue. @probot should post a comment (you may need to refresh to see it).

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.
