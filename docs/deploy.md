# Deploying

If you would like to run your own instance of this app, see the
[docs for deployment](https://probot.github.io/docs/deployment/).

The **Permissions & webhooks** that your bot needs access to will depend on what you use it for.

* The Single file read-only permission for `.github/probot.js` is the only explicit one, to allow your app to fetch at
  least the configuration file.
* Every event your `.github/probot.js` covers have to be subscribed.
  If an event subscription is missing, Probot will not be able to handle the event.
