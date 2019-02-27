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
client.addListener("message", function(nick, to, text, message) {
    console.log(nick);
    console.log(to);
    console.log(text);
    console.log(message);

    for (channel of channels) {
        if (channel == to) {
            // message sent to this channel
            ParseMsg(channel, text);
            return;
        }
    }

    // if we get this far, it is a private message from a user
    ParseMsg(nick, text);

});

// message parsing
const ParseMsg = async function(channel, msg) {
    if (msg.toUpperCase().startsWith("!GITBOT ") || !channel.startsWith("#")) {

        var cmd = msg.toUpperCase().replace("!GITBOT ", ""); // msg.substring(8);
        logger.info("Received channel command: " + cmd);

        switch (cmd.toUpperCase()) {

            case "VERSION":

                var gioRoot = await ghapi.GitioLookup("https://github.com/Asnivor/irc-git-bot");
                var gio = await ghapi.GitioLookup("https://github.com/Asnivor/irc-git-bot/commit/" + info.sha);
                var vTitle = "irc-git-bot (by Asnivor) " + gioRoot;

                if (info.Tag) {
                    // tag exists for current commit
                    var tag = info.Tag;
                    var version = "v:" + tag;
                }
                else if (info.lastTag) {
                    // a previous tag exists
                    var tag = info.lastTag;
                    var commitsSince = info.commitsSinceLastTag;
                    var version = "v:" + tag + " (+" + commitsSince + " commits)";
                }
                else {
                    var version = "v:" + info.abbreviatedSha;
                }

                if (channel.startsWith("#")) {
                    // it is a channel
                    var outString = vTitle + " - " + version + " - commit: " + gio;
                    client.say(channel, outString);
                }
                else {
                    // it is a user (private message)
                    client.say(channel, "irc-git-bot (by Asnivor)");
                    client.say(channel, "https://github.com/Asnivor/irc-git-bot");
                    client.say(channel, "Version: " + version);
                    client.say(channel, "Commit: " + gio);
                }

                break;

        }
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