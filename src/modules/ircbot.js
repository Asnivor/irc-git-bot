import irc from 'irc';
import logger from './logger';
import config from './configuration';
import ghapi from './github_api_parser';
import repoinfo from 'git-repo-info';
var info = repoinfo();

var channels_conf = config.get('channels');
let botJoined = false;
let joinCallbacks = [];
const channels = [];

if (!Array.isArray(channels_conf)) {
    channels_conf = [ channels_conf ];
}

for (var channel of channels_conf) {
    channels.push(channel[0] != '#' ? ('#' + channel) : channel);
}

logger.info("Instantiating IRC client");
let client = new irc.Client(config.get('server'), config.get('bot_name'), {
    userName: config.get('bot_user'),
    realName: config.get('bot_real'),
    encoding: "utf-8"
});

// ----------------------------------
// LISTENERS
// ----------------------------------

// error listener
client.addListener("error", function(message) {
    logger.info("irc died: ", message);

    // try and rejoin all channels
    for (channel of channels) {
        client.join(channel);
    }

    doJoin();
});

// kicked listener
client.addListener("kick", function(channel, person, by, message) {
    if (person == config.get('bot_name')) {
        // bot has been kicked
        logger.warn(person + " was kicked from " + channel + " by " + by);
        logger.warn("Attempting to rejoin...");

        client.join(channel, function(cback) {
            logger.info(cback + " rejoined " + channel);
            client.say(channel, "Owwww!");
        });
    }
});

// message listener
client.addListener("message", function(nick, target, text, message) {

    if (target.startsWith("#")) {
        // message was sent to a channel
        for (channel of channels) {
            if (channel == target) {
                // message sent to this channel
                MessageHandler(target, nick, text, message);
                return;
            }
        }
    }
    else {
        // it is a private message from a user
        MessageHandler(null, nick, text, message);
    }
});

const MessageHandler = async function(destination, fromNick, text, message) {

    var commandString = text;
    var prefix = message["prefix"];
    var isChannel = false;

    // default to sending back as PM
    var actualDestination = fromNick;

    if (destination) {
        // original message was sent to channel rather than directly to the bot via PRIVMSG
        actualDestination = destination;
        isChannel = true;
    }

    if (text.toUpperCase().startsWith("!GITBOT ")) {
        // strip !gitbot
        commandString = text.substring(8);
    }

    // get initial command
    var command = commandString.split(" ")[0];
    // remove command from commandString
    commandString = commandString.substring(command.length + 1);

    if (isChannel && !text.toUpperCase().startsWith("!GITBOT ")){

        // message to channel was not prepended with !gitbot
        // ignore (overrides may come in future)
        return;
    }

    //console.log(actualDestination);
    //console.log(prefix);
    //console.log(command);
    //console.log(commandString);

    switch (command.toUpperCase()) {

        // Help interface
        case "HELP":

            logger.info("Command rcvd from " + fromNick + " - " + command + " " + commandString);

            // always send in PM
            actualDestination = fromNick;

            if (commandString.toUpperCase().startsWith("VERSION")){
                client.say(actualDestination, "VERSION: Displays irc bot version info");
            }
            else if (commandString.toUpperCase().startsWith("SEARCHHASH")) {
                client.say(actualDestination, "SEARCHHASH: Returns a GitHub search page based on the supplied hash");
            }
            else {
                client.say(actualDestination, "VERSION: Displays irc bot version info");
                client.say(actualDestination, "SEARCHHASH: Returns a GitHub search page based on the supplied hash");
            }

            break;

        // prints bot version info
        case "VERSION":

            logger.info("Command rcvd from " + fromNick + " - " + command + " " + commandString);

            var gioRoot = await ghapi.GitioLookup("https://github.com/Asnivor/irc-git-bot");
            var gio = await ghapi.GitioLookup("https://github.com/Asnivor/irc-git-bot/commit/" + info.sha);
            var vTitle = "irc-git-bot (by Asnivor) " + gioRoot;

            if (info.Tag) {
                // tag exists for current commit
                var tag = info.Tag;
                var version = tag;
            }
            else if (info.lastTag) {
                // a previous tag exists
                var tag = info.lastTag;
                var commitsSince = info.commitsSinceLastTag;
                var version = tag + " (+" + commitsSince + " commits)";
            }
            else {
                var version = "v:" + info.abbreviatedSha;
            }

            if (isChannel) {
                // it is a channel
                var outString = vTitle + " - " + version + " - commit: " + gio;
                client.say(actualDestination, outString);
            }
            else {
                // it is a user (private message)
                client.say(actualDestination, "irc-git-bot (by Asnivor)");
                client.say(actualDestination, "https://github.com/Asnivor/irc-git-bot");
                client.say(actualDestination, "Version: " + version);
                client.say(actualDestination, "Commit: " + gio);
            }

            break;

        // link to github search page
        case "SEARCHHASH":

            logger.info("Command rcvd from " + fromNick + " - " + command + " " + commandString);

            var searchPage = await ghapi.GitioLookup("https://github.com/search?q=hash%3A+" + commandString + "&type=Commits");
            client.say(actualDestination, searchPage);

            break;
    }

}

// registered join
if (config.get('bot_registered') == true) {

    client.addListener('raw', function(message) {

        raw = message;
        if (raw["nick"] == "NickServ") {

            if (raw["args"][1].toLowerCase().indexOf("identify") > -1) {

                client.say("nickserv", "identify " + config.get('bot_pass'));
                logger.info("Nickserv: identify *pass*");

            }

            if (raw["args"][1].indexOf("incorrect") > -1) {

                logger.info("NickServ: Incorrect password :(");
                process.exit();

            }

            if (raw["args"][1].toLowerCase().indexOf("identified") > -1 || raw["args"][1].toLowerCase().indexOf("recognized") > -1) {

                if (config.get('bot_vhost') == true) {

                    client.say("hostserv", "on");
                    logger.info("HostServ: on");

                } else {

                    for (channel of channels) {
                        client.join(channel, function (cback) {
                            logger.info("Channel " + channel + " joined");
                        });
                    }

                    doJoin();
                }

            }

        }

        if (raw["nick"] == "HostServ") {

            if (raw["args"][1].indexOf("activated") > -1) {

                for (channel of channels) {
                    client.join(channel, function(cback){
                        logger.info("Channel " + channel + " joined");
                    });
                }

                doJoin();
            }

        }

    });

}
// guest join
else {

    client.addListener('registered', function() {
        for (channel of channels) {
            client.join(channel, function() {
                logger.info("Channel " + channel + " joined");
            });
        }

        doJoin();
    });

}

// main channel join callbacks
var doJoin = function() {
    botJoined = true;
    logger.info("Starting channel join callbacks");
    for (var cb of joinCallbacks) {
        cb();
    }

    joinCallbacks = [];
}

module.exports = {
    /*
        doJoin : function() {
           doJoin();
        },
        */
    BotStatus : function() {
        return botJoined;
    },

    Channels : function() {
        return channels;
    },

    joinCallbacks: joinCallbacks,

    say : function(channel, text) {
        client.say(channel, text);
    }
}