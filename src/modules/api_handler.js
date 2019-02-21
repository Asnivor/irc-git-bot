import gitlab_api_parser from './gitlab_api_parser';
import github_api_parser from './github_api_parser';
import logger from "./logger";
import bot from './ircbot';

// the main handler called when a POST is received
async function DoPost(req, res) {

    // test for invalid json body
    if (!req.body) return await res.sendStatus(400)

    // is github event?
    if (req.headers["x-github-event"]) {
        logger.info("Incoming WebHook from GitHub");
        var res = await github_api_parser.handle_github(req);
    }
    // is gitlab event?
    else if (req.headers["x-gitlab-event"]) {
        logger.info("Incoming WebHook from GitLab");
        var res = await gitlab_api_parser.handle_gitlab(req, res);
    }
    // unidentified
    else {
        logger.info("Unidentified POST received - dropping");
        return await res.sendStatus(400);
    }

    var channels = await bot.Channels();

    if (res) {
        console.log(res);
        for (var channel of channels) {
            for (var r of res) {
                logger.info("Sending " + channel + ": " + r);
                bot.say(channel, r);
            }
        }
    }
}
module.exports.DoPost = DoPost;

