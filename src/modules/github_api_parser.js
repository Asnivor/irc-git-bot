import util from 'util';
import gitio from 'node-gitio';
import config from './configuration';

// functions that parse webhook payloads return the necessary output array of strings
async function handle_github(req) {

    switch (req.headers["x-github-event"]) {

        // https://developer.github.com/v3/activity/events/types/#checkrunevent
        // TODO: for completeness we should have this event - skipping for now
        case "check_run":
            break;

        // https://developer.github.com/v3/activity/events/types/#checksuiteevent
        // TODO: for completeness we should have this event - skipping for now
        case "check_suite":
            break;

        // https://developer.github.com/v3/activity/events/types/#commitcommentevent
        case "commit_comment":
            var ret = await gh_commit_comment(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#contentreferenceevent
        // TODO: for completeness we should have this event - skipping for now
        case "content_reference":
            break;

        // https://developer.github.com/v3/activity/events/types/#createevent
        case "create":
            var ret = await gh_create(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#deleteevent
        case "delete":
            var ret = await gh_delete(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#deploymentevent
        // TODO: for completeness we should have this event - skipping for now
        case "deployment":
            break;

        // https://developer.github.com/v3/activity/events/types/#deploymentstatusevent
        // TODO: for completeness we should have this event - skipping for now
        case "deployment_status":
            break;

        // https://developer.github.com/v3/activity/events/types/#forkevent
        case "fork":
            var ret = await gh_fork(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#githubappauthorizationevent
        // TODO: for completeness we should have this event - skipping for now
        case "github_app_authorization":
            break;

        // https://developer.github.com/v3/activity/events/types/#gollumevent
        // TODO: for completeness we should have this event - skipping for now
        case "gollum":
            break;

        // https://developer.github.com/v3/activity/events/types/#installationevent
        // TODO: for completeness we should have this event - skipping for now
        case "installation":
            break;

        // https://developer.github.com/v3/activity/events/types/#installationrepositoriesevent
        // TODO: for completeness we should have this event - skipping for now
        case "installation_repositories":
            break;

        // https://developer.github.com/v3/activity/events/types/#issuecommentevent
        case "issue_comment":
            var ret = await gh_issue_comment(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#issuesevent
        case "issues":
            var ret = await gh_issues(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#labelevent
        // TODO: for completeness we should have this event - skipping for now
        case "label":
            break;

        // https://developer.github.com/v3/activity/events/types/#marketplacepurchaseevent
        // TODO: for completeness we should have this event - skipping for now
        case "marketplace_purchase":
            break;

        // https://developer.github.com/v3/activity/events/types/#memberevent
        case "member":
            var ret = await gh_member(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#membershipevent
        // TODO: for completeness we should have this event - skipping for now
        case "membership":
            break;

        // https://developer.github.com/v3/activity/events/types/#milestoneevent
        case "milestone":
            var ret = await gh_milestone(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#organizationevent
        // TODO: for completeness we should have this event - skipping for now
        case "organization":
            break;

        // https://developer.github.com/v3/activity/events/types/#orgblockevent
        // TODO: for completeness we should have this event - skipping for now
        case "org_block":
            break;

        // https://developer.github.com/v3/activity/events/types/#pagebuildevent
        // TODO: for completeness we should have this event - skipping for now
        case "page_build":
            break;

        // https://developer.github.com/v3/activity/events/types/#projectcardevent
        // TODO: for completeness we should have this event - skipping for now
        case "project_card":
            break;

        // https://developer.github.com/v3/activity/events/types/#projectcolumnevent
        // TODO: for completeness we should have this event - skipping for now
        case "project_column":
            break;

        // https://developer.github.com/v3/activity/events/types/#projectevent
        // TODO: for completeness we should have this event - skipping for now
        case "project":
            break;

        // https://developer.github.com/v3/activity/events/types/#publicevent
        // TODO: for completeness we should have this event - skipping for now
        case "public":
            break;

        // https://developer.github.com/v3/activity/events/types/#pullrequestreviewcommentevent
        // URLs to shorten: 1
        case "pull_request_review_comment":
            var ret = await gh_pr_review_comment(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#pullrequestevents
        case "pull_request":
            var ret = await gh_pull_request(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#pullrequestreviewevent
        case "pull_request_review":
            var ret = await gh_pull_request_review(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#pushevent
        case "push":
            var ret = await gh_push(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#releaseevent
        case "release":
            var ret = await gh_release(req);
            return ret;

        // https://developer.github.com/v3/activity/events/types/#repositoryevent
        // TODO: for completeness we should have this event - skipping for now
        case "repository":
            break;

        // https://developer.github.com/v3/activity/events/types/#repositoryimportevent
        // TODO: for completeness we should have this event - skipping for now
        case "repository_import":
            break;

        // https://developer.github.com/v3/activity/events/types/#repositoryvulnerabilityalertevent
        // TODO: for completeness we should have this event - skipping for now
        case "repository_vulnerability_alert":
            break;

        // https://developer.github.com/v3/activity/events/types/#securityadvisoryevent
        // TODO: for completeness we should have this event - skipping for now
        case "security_advisory":
            break;

        // https://developer.github.com/v3/activity/events/types/#statusevent
        case "status":
            break;

        // https://developer.github.com/v3/activity/events/types/#teamevent
        // TODO: for completeness we should have this event - skipping for now
        case "team":
            break;

        // https://developer.github.com/v3/activity/events/types/#teamaddevent
        // TODO: for completeness we should have this event - skipping for now
        case "team_add":
            break;

        // https://developer.github.com/v3/activity/events/types/#watchevent
        // URLS to shorten: 1
        case "watch":
            //linkArr.push(await gitioLookup(req.body["sender"]["html_url"]));
            var ret = await gh_watch(req);
            return ret;

        default:
    }
}
module.exports.handle_github = handle_github;

// https://developer.github.com/v3/activity/events/types/#commitcommentevent
var gh_commit_comment = async (req) => {

    var res = new Array();

    var action = req.body["action"];
    var comment_html_url = await gitioLookup(req.body["comment"]["html_url"]);
    var comment_type = "commented on";
    if (action == "edited") {
        comment_type = "edited a comment on"

        if (config.get('ignore_edits') == true) return;
    }
    else if (action == "deleted") {
        comment_type = "deleted a comment on"
    }

    var res01 = util.format("\x02\x0306%s\x03\x02: %s %s \x02commit\x02 %s - %s",
        req.body["repository"]["full_name"],
        req.body["comment"]["user"]["login"],
        comment_type,
        "\x02\x0303" + req.body["comment"]["commit_id"].substring(0, 7) + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
        comment_html_url);

    if (res01) {
        res.push(res01);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#issuecommentevent
var gh_issue_comment = async (req) => {

    var res = new Array();

    var action = req.body["action"];
    var comment_html_url = await gitioLookup(req.body["comment"]["html_url"]);
    var comment_type = "commented on";
    if (action == "edited") {
        if (config.get('ignore_edits') == true) return;

        comment_type = "edited a comment on"
    }
    else if (action == "deleted") {
        comment_type = "deleted a comment on"
    }

    var split_url = req.body["issue"]["html_url"].split('/');

    if (split_url[split_url.length - 2] == "issues") {
        // issue
        var res01 = util.format("\x02\x0306%s\x03\x02: %s %s \x02issue (#%s)\x02 %s - %s",
            req.body["repository"]["full_name"],
            req.body["comment"]["user"]["login"],
            comment_type,
            req.body["issue"]["number"],
            "\x02\x0303" + req.body["issue"]["title"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
            comment_html_url);
    }
    else {
        // pull request
        var res01 = util.format("\x02\x0306%s\x03\x02: %s %s \x02PR (#%s)\x02 %s - %s",
            req.body["repository"]["full_name"],
            req.body["comment"]["user"]["login"],
            comment_type,
            req.body["issue"]["number"],
            "\x02\x0303" + req.body["issue"]["title"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
            comment_html_url);
    }

    if (res01) {
        res.push(res01);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#pullrequestreviewcommentevent
var gh_pr_review_comment = async (req) => {

    var res = new Array();

    var action = req.body["action"];
    var comment_html_url = await gitioLookup(req.body["comment"]["html_url"]);
    var comment_type = "commented on";
    if (action == "edited") {
        comment_type = "edited a comment on"

        if (config.get('ignore_edits') == true) return;
    }
    else if (action == "deleted") {
        comment_type = "deleted a comment on"
    }

    var res01 = util.format("\x02\x0306%s\x03\x02: %s %s \x02PR (#%s) review\x02 %s - %s",
        req.body["repository"]["full_name"],
        req.body["comment"]["user"]["login"],
        comment_type,
        req.body["pull_request"]["number"],
        "\x02\x0303" + req.body["pull_request"]["title"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
        comment_html_url);

    if (res01) {
        res.push(res01);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#createevent
var gh_create = async (req) => {

    var res = new Array();

    var create_type = req.body["ref_type"];
    var ref = req.body["ref"];
    var html_url = req.body["repository"]["html_url"];

    if (create_type == "branch") {
        var res01 = util.format("\x02\x0306%s\x03\x02: %s created new \x02branch\x02 %s - %s",
            req.body["repository"]["full_name"],
            req.body["sender"]["login"],
            "\x02\x0303" + ref + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
            await gitioLookup(html_url + "/tree/" + ref));
    }
    else if (create_type == "tag") {
        var res01 = util.format("\x02\x0306%s\x03\x02: %s created new \x02tag\x02 %s - %s",
            req.body["repository"]["full_name"],
            req.body["sender"]["login"],
            "\x02\x0303" + ref + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
            await gitioLookup(html_url + "/releases/tag/" + ref));
    }
    else if (create_type == "repository") {
        var res01 = util.format("\x02\x0306%s\x03\x02: %s created new \x02repo\x02 %s - %s",
            req.body["repository"]["full_name"],
            req.body["sender"]["login"],
            "\x02\x0303" + ref + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
            await gitioLookup(html_url + "/tree/" + ref));
    }

    if (res01) {
        res.push(res01);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#deleteevent
var gh_delete = async (req) => {

    var res = new Array();

    var delete_type = req.body["ref_type"];
    var ref = req.body["ref"];

    if (delete_type == "branch") {
        var res01 = util.format("\x02\x0306%s\x03\x02: %s deleted \x02branch\x02 %s",
            req.body["repository"]["full_name"],
            req.body["sender"]["login"],
            "\x02\x0303" + ref + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "));
    }
    else if (delete_type == "tag") {
        var res01 = util.format("\x02\x0306%s\x03\x02: %s deleted \x02tag\x02 %s",
            req.body["repository"]["full_name"],
            req.body["sender"]["login"],
            "\x02\x0303" + ref + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "));
    }

    if (res01) {
        res.push(res01);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#issuesevent
var gh_issues = async (req) => {

    var res = new Array();
    var html_url = await gitioLookup(req.body["issue"]["html_url"]);

    var action = req.body["action"];

    var build01 = util.format("\x02\x0306%s\x03\x02: %s %s issue (#%s) %s",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        action,
        req.body["issue"]["number"],
        "\x02\x0303" + req.body["issue"]["title"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "));

    switch (action) {
        case "opened":
        case "edited":
        case "transferred":
        case "pinned":
        case "unpinned":
        case "closed":
        case "reopened":
        case "demilestoned":

            if (config.get('ignore_edits') == true && action == "edited") return;

            var build02 = util.format("%s - %s",
                build01,
                html_url);
            res.push(build02);
            break;
        case "deleted":
            res.push(build01);
            break;
        case "assigned":
            var build02 = util.format("%s to %s - %s",
                build01,
                req.body["assignee"]["login"],
                html_url);
            res.push(build02);
            break;
        case "unassigned":
            var build02 = util.format("%s from %s - %s",
                build01,
                req.body["assignee"]["login"],
                html_url);
            res.push(build02);
            break;
        case "labeled":
            var build02 = util.format("%s (+%s) - %s",
                build01,
                req.body["label"]["name"],
                html_url);
            res.push(build02);
            break;
        case "unlabeled":
            var build02 = util.format("%s (-%s) - %s",
                build01,
                req.body["label"]["name"],
                html_url);
            res.push(build02);
            break;
        case "milestoned":
            var build02 = util.format("%s (-%s) - %s",
                build01,
                req.body["issue"]["milestone"],
                html_url);
            res.push(build02);
            break;
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#memberevent
var gh_member = async (req) => {

    var res = new Array();
    var html_url = await gitioLookup(req.body["member"]["html_url"]);

    var action = req.body["action"];
    var member = req.body["member"]["login"];
    var adder = req.body["sender"]["login"];

    var build01 = util.format("\x02\x0306%s\x03\x02: Collaborator %s %s",
        req.body["repository"]["full_name"],
        member,
        action);

    switch (action) {
        case "added":
            var build02 = util.format("%s to the repo - %s",
                build01,
                html_url);
            break;
        case "deleted":
            var build02 = util.format("%s from the repo - %s",
                build01,
                html_url);
            break
        case "edited":
            if (config.get('ignore_edits') == true) return;

            var build02 = util.format("%s in the repo - %s",
                build01,
                html_url);
            break;
    }

    if (build02) {
        res.push(build02);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#milestoneevent
var gh_milestone = async (req) => {

    var res = new Array();

    var action = req.body["action"];

    var build01 = util.format("\x02\x0306%s\x03\x02: %s %s milestone (#%s) %s",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        action,
        req.body["milestone"]["number"],
        "\x02\x0303" + req.body["milestone"]["title"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "));

    switch (action) {
        case "opened":
        case "edited":
        case "created":
        case "closed":

            if (config.get('ignore_edits') == true && action == "edited") return;

            var build02 = util.format("%s - %s",
                build01,
                await gitioLookup(req.body["milestone"]["html_url"]));
            res.push(build02);
            break;
        case "deleted":
            res.push(build01);
            break;
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#forkevent
var gh_fork = async (req) => {

    var res = new Array();

    var build01 = util.format("\x02\x0306%s\x03\x02: %s forked the repo - %s",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        await gitioLookup(req.body["forkee"]["html_url"]));

    if (build01) {
        res.push(build01);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#pullrequestevents
var gh_pull_request = async(req) => {

    var res = new Array();
    var html_url = await gitioLookup(req.body["pull_request"]["html_url"]);

    var action = await req.body["action"];

    var build01 = util.format("\x02\x0306%s\x03\x02: %s %s PR (#%s) %s",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        action,
        req.body["number"],
        "\x02\x0303" + req.body["pull_request"]["title"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "));

    switch (action) {
        case "opened":
        case "edited":
        case "reopened":
            if (config.get('ignore_edits') == true && action == "edited") return;

            var build02 = util.format("%s - %s",
                build01,
                html_url);
            res.push(build02);
            break;
        case "closed":
            if (req.body["pull_request"]["merged_at"] != null) {
                var mergeState = "MERGED";
            }
            else {
                var mergeState = "NOT MERGED";
            }

            var build02 = util.format("%s (%s) - %s",
                build01,
                mergeState,
                html_url);
            res.push(build02);

            break;
        case "assigned":
            var build02 = util.format("%s to %s - %s",
                build01,
                req.body["assignee"]["login"],
                html_url);
            res.push(build02);
            break;
        case "unassigned":
            var build02 = util.format("%s from %s - %s",
                build01,
                req.body["assignee"]["login"],
                html_url);
            res.push(build02);
            break;
        case "labeled":
            var build02 = util.format("%s (+%s) - %s",
                build01,
                req.body["label"]["name"],
                html_url);
            res.push(build02);
            break;
        case "unlabeled":
            var build02 = util.format("%s (-%s) - %s",
                build01,
                req.body["label"]["name"],
                html_url);
            res.push(build02);
            break;
        case "review_requested":
            // TODO: review requested
            break;
        case "review_request_removed":
            // TODO: review request removed
            break;
        case "synchronize":
            var build03 = util.format("\x02\x0306%s\x03\x02: %s made changes to file(s) referenced in PR (#%s) %s - %s",
                req.body["repository"]["full_name"],
                req.body["sender"]["login"],
                req.body["number"],
                "\x02\x0303" + req.body["pull_request"]["title"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
                html_url);
            res.push(build03);
            break;
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#releaseevent
var gh_release = async (req) => {

    var res = new Array();

    var action = req.body["action"];

    var build01 = util.format("\x02\x0306%s\x03\x02: %s %s a release: %s -",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        action,
        "\x02\x0303" + req.body["release"]["tag_name"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
        await gitioLookup(req.body["release"]["html_url"]));

    res.push(build01);
    return res;
}

// https://developer.github.com/v3/activity/events/types/#forkevent
var gh_fork = async (req) => {

    var res = new Array();

    var build01 = util.format("\x02\x0306%s\x03\x02: %s forked the repo - %s",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        await gitioLookup(req.body["forkee"]["html_url"]));

    if (build01) {
        res.push(build01);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#pushevent
var gh_push = async (req) => {

    var res = new Array();

    var ref = req.body["ref"].replace("refs/heads/", "");
    console.log(ref);
    var numCommits = 0;
    var maxCommitsToShow = 3;

    for (var c of req.body["commits"]) {
        numCommits++;
    }

    // hide spurious 0 commit messages
    if (numCommits <= 0) {
        return;
    }

    //console.log(req.body);

    var line1 = util.format("\x02\x0306%s\x03\x02: %s pushed %s commits to %s - %s",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        numCommits,
        ref,
        await gitioLookup(req.body["compare"]));

    res.push(line1);

    // individual commit lines
    var leftOver = 0;
    if (numCommits > maxCommitsToShow) {
        leftOver = numCommits - maxCommitsToShow;
    }

    var cnt = 0;
    for (var commit of req.body["commits"]) {

        cnt++;

        if (cnt > maxCommitsToShow) {
            break;
        }

        var comStr = util.format(" - %s (%s) %s - %s",
            commit["id"].substring(0, 7),
            commit["author"]["username"],
            "\x02\x0303" + commit["message"] + "\x03\x02".replace(/[\r\n]/g, " - ").replace(/[\n]/g, " - "),
            await gitioLookup(commit["url"]));

        res.push(comStr);
    }

    if (leftOver > 0) {

        var last = util.format(" - ... and %s more",
            leftOver);

        res.push(last);
    }

    return res;
}

// https://developer.github.com/v3/activity/events/types/#watchevent
var gh_watch = async (req) => {

    var res = new Array();

    var build01 = util.format("\x02\x0306%s\x03\x02: %s starred the repo! - %s",
        req.body["repository"]["full_name"],
        req.body["sender"]["login"],
        await gitioLookup(req.body["sender"]["html_url"]));

    if (build01) {
        res.push(build01);
    }

    return res;
}



// awaitable function to do gitio shrink
const gitioLookup = (inUrl) => {
    return new Promise(resolve => {
        //setTimeout(() => resolve('I did something'), 3000)
        gitio.shrink({url: inUrl}, (err, result) => {
            if (!err) {
                // short link
                resolve(result);
            }
            else {
                console.log("gitio ERR: " + err);
                // try to resolve again (in case gitio-node has collided somehow
                resolve(gitioLookup(inUrl));
            }
        })
    })
}



