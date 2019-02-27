import 'dotenv/config';
import logger from './modules/logger';
logger.info("INIT express");
import express from 'express';
logger.info("INIT config");
import config from './modules/configuration';
logger.info("INIT ircbot");
import bot from './modules/ircbot';
logger.info("INIT body_parser");
import body_parser from 'body-parser';
logger.info("INIT gitlab parser");
import gitlab_api_parser from './modules/gitlab_api_parser';
logger.info("INIT github parser");
import github_api_parser from './modules/github_api_parser';
logger.info("INIT api handler");
import api from './modules/api_handler';
logger.info("INIT simple-git");
import simpleGit from 'simple-git';

import path from 'path';



const app = express();

// handle 3rd party port services
if (process.env.PORT) {
    config.set('port', process.env.PORT);
    logger.info(config.get('port'));
}

const jp = body_parser.json();

// ----------------------------------
// ROUTES
// ----------------------------------

// default GET route
app.get("/", function(req, res){
    res.send("Nothing to see here....");
});

// github/gitlap API endpoint route
app.post("/git.json", jp, function (req, res) {

    var status = api.DoPost(req, res);

    if (status) {
        res.end();
    }
    else {
        res.sendStatus(200);
        res.end();
    }
});

// half-assed self updater
app.post("/selfupdate.json", jp, function (req, res) {

    if (req.headers["x-github-event"]) {
        if (req.body["ref"] == "refs/heads/master") {
            if (req.body["repository"]["name"] == "irc-git-bot") {

                for (var channel of bot.Channels()) {
                    bot.say(channel, "*** Auto-upgrade starting - pulling: " + req.body["compare"]);
                }

                var p = path.normalize(__dirname + "/../");
                logger.info("Pulling changes from repo: " + req.body["compare"]);
                simpleGit(p).pull();
            }
        }
    }

    res.sendStatus(200);
    res.end();
});

function handleAPI(req, res) {
    logger.info("API Handler Running");

    // debug
    for (var channel of bot.Channels()) {
        //bot.say(channel, "DEBUG: " + req.headers["x-github-event"] + " : " + req.body["action"] + " : " + req.body["ref_type"] + " : " + req.body["ref"]);
    }

    if (req.headers["x-gitlab-event"] != null) {
        gitlab_api_parser(req, res);
    }
    else if (req.headers["x-github-event"]) {
        var resArr = github_api_parser.handle_github(req);
        if (resArr) {
            for (var channel of bot.Channels()) {
                for (var r of resArr) {
                    bot.say(channel, r);
                }
            }

            for (var r of resArr) {
                logger.info(r);
            }
        }
    }
};

app.listen(config.get('port'), () =>
    logger.info(config.get('bot_name') + " is listening on port " + config.get('port')),
);
