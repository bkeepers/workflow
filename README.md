# Probot: Workflow

> A GitHub App built with [probot](https://github.com/probot/probot) that enables complete workflow automation.

## Installing

_**Heads up!** The [demo app](hhttps://github.com/apps/probot-demo) is for demo purposes only.
It is very likely to go away at some point, so please don't use it for production purposes._

1. Go to the **[demo app](https://github.com/apps/probot-demo)**, click **Install**, and then select an organization.
2. Create a `.github/.probot.js` file in your repository with the following contents.
   See [Configuration](docs/configuration.md) for more information on what behaviors can be built.
   ```javascript
   on('issues.opened')
     .comment(`
       Hello @{{ sender.login }}. Thanks for inviting me to your project.
       Read more about [all the things I can help you with][config]. I can't
       wait to get started!

       [config]: https://github.com/bkeepers/PRobot/blob/master/docs/configuration.md
     `);
   ```

3. Open a new issue. @probot should post a comment (you may need to refresh to see it).

## Setup

* Install dependencies
  ```
  npm install
  ```
  
* Run the bot
  ```
  npm start
  ```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
