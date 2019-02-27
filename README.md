# IRC-Git-Bot

### About

This is an experimental IRC bot that receives webhooks from GitHub (and although untested/not implemented properly - GitLab) and posts event information to IRC channels.

Initially based on the work done in https://github.com/avail/irc-commit-bot, this project is still in dev.

### Features

* Parses approx 75% of all possible GitHub event types and payloads
* URLs automatically shortened using git.io

### Still TODO:

* Hashing stuff (so webhook origin can be verified by secret token before posting)


### Install

* Fork https://github.com/Asnivor/irc-git-bot
* Clone your fork locally
* `npm install`

Note: This has only been tested on Node v6.11.4 but uses babel to get async/await functionality.


### Setup
* `cp config.json-SAMPLE config.json`
* Edit `config.json` and fill out your settings
* `npm start`
* Setup a webhook (type: Application/json) in the GitHub repo you wish to monitor and point it to `http://{yourserver}:{your config defined port}/git.json`
* [Optional] Setup an 'auto-upgrade' webhook. In your fork, create a webhook (type: Application/json - 'just the push event') and point it to `http://{yourserver}:{your config defined port}/selfupdate.json`. Now whenever you make changes to the master branch of your fork (and provided you have nodemon running) the bot will automatically pull the latest changes and (if needed) restart
