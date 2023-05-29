const { parentPort, workerData } = require("worker_threads");
const dotenv = require("dotenv");
dotenv.config();

const { fetchPost, postCommentWithPuppeteer } = require("./apis/reddit");
const { hasReplied, storeRepliedPost, randomTimeout, log } = require("./util");
const config = require("./config");
const { ONE_SECOND } = config;

const { generateResponse, completionChat } = require("./apis/chatGPT");

parentPort.postMessage(
  `Hello, I received your data: ${JSON.stringify(workerData)}`
);
// Do your CPU-intensive work here

// Create a worker that looks at the schema in uiConfig
// and configures the bot with the appropriate API responses

(async () => {
  const {
    // Reddit
    redditSearch,
    subredditSearchLimit,
    subredditIncludes, // String formatted like a|b|c
    subredditExcludes, // String formatted like a|b|c
    redditPassword,
    redditUsername,
    sortSubredditsBy,

    // Bot Settings
    hasRepliedBy,
    retryOnFailure,
    botResponseInterval,
    botPrompt,
    botResponse,
    useChatGPT,
    chatGPTSystemRole,
    chatGPTModel,
    notHeadless,
  } = workerData;

  let posts = await fetchPost(redditSearch, subredditSearchLimit, {
    sort: sortSubredditsBy,
  });

  const subredditIncludesArray = subredditIncludes.split("|");
  const subredditExcludesArray = subredditExcludes.split("|");

  // Only show subreddits that have temu in the name and they cant say canada either
  posts = posts.filter((post) => {
    const subredditName = post.subreddit_name_prefixed.toLowerCase();

    const subredditNameIncludes = subredditIncludesArray.some((subreddit) =>
      subredditName.includes(subreddit)
    );
    const subredditNameExcludes = subredditExcludesArray.some((subreddit) =>
      subredditName.includes(subreddit)
    );

    return subredditNameIncludes && !subredditNameExcludes;
  });

  const runnMeBitch = async () => {
    try {
      for (const post of posts) {
        log("********* NEW POST START **********");

        const cacheByValue = (() => {
          if (hasRepliedBy === "id") return post.id;
          if (hasRepliedBy === "author") return post.author.name;
          return post.id;
        })();

        log(`Cached by ${hasRepliedBy} with value ${cacheByValue}`);
        if (!hasReplied(cacheByValue)) {
          log(`Replying to post: ${post.id}
          Author: ${post.author.name}`);
          storeRepliedPost(cacheByValue);
          log(`POST TITLE: ${post.title}`);
          log(`POST BODY: ${post.selftext}`);
          let response = "";
          if (useChatGPT) {
            response = await completionChat(
              [
                {
                  role: "system",
                  content: chatGPTSystemRole,
                },

                {
                  role: "user",
                  content: botPrompt
                    .replace("$1", post.title)
                    .replace("$2", post.selftext),
                },
              ],
              chatGPTModel
            );
          } else {
            response = botResponse; // Client set response
          }

          log("response generated for " + post.author.name);
          log(`Response: ${response}`);

          // await postComment(post, response);
          log(`Initiating response`);
          await postCommentWithPuppeteer(
            `https://reddit.com${post.permalink}`,
            response,
            { headless: !notHeadless, redditUsername, redditPassword }
          );
          log("Comment posted for " + post.author.name);

          await randomTimeout(ONE_SECOND * 15, botResponseInterval);
        } else {
          log("Already replied to post by " + post.author.name);
        }
        log("********* POST ENDED **********");
        log(" ");
      }
    } catch (error) {
      log("Error!!!: " + error.message);
      if (retryOnFailure) await runnMeBitch();
    }
  };

  try {
    log("Bot started...");
    await runnMeBitch();
    log("Bot finished...");
  } catch (error) {
    log("Error: " + error.message);
    log("Bot finished...");
    console.error("Error:", JSON.stringify(error, null, 2));
    console.error("Error:", error.message);
  }
  process.exit(0);
})();