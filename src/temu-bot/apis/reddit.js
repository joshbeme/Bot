const snoowrap = require("snoowrap");
const puppeteer = require("puppeteer");
const { timeout, log, randomTimeout } = require("../util");
const { redditUsername: ruser, redditPassword: rpass } = require("../config");

// // Set up Reddit API credentials
const r = new snoowrap({
  userAgent: `windows:${process.env.REDDIT_CLIENT_ID}:v2.1.1 (by /u/${process.env.REDDIT_USERNAME})`,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,

  //   refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});

// Function to fetch a post from Reddit
async function fetchPost(searchPhrase, limit = 500, options = {}) {
  const posts = await r.search({
    query: searchPhrase,
    sort: "new",
    time: "all",
    limit,
    ...options,
  });
  return posts;
}

// Function to post a comment on Reddit
async function postComment(post, comment) {
  await post.reply(comment);
}

async function postCommentWithPuppeteer(
  postUrl,
  commentText,
  { headless = true, redditUsername = ruser, redditPassword = rpass }
) {
  // Launch a new browser
  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();
  log(`Starting Browser to respond to post with URL ${postUrl}`);

  try {
    // Navigate to Reddit's login page
    await page.goto("https://www.reddit.com/login", {
      waitUntil: "networkidle2",
    });

    // await timeout(10000);
    // Log in to Reddit
    await page.type("#loginUsername", redditUsername);
    await page.type("#loginPassword", redditPassword);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // Navigate to the post
    await page.goto(postUrl, { waitUntil: "networkidle2" });
    // await timeout(100000);

    // Post a comment
    // if close button is present, click it
    await timeout(1000);
    const closeButton = await page.$("button[aria-label='Close']");
    if (closeButton) await page.click("button[aria-label='Close']");

    await page.click('div[role="textbox"]');
    // wait random time between 1 and 8 seconds
    await timeout(Math.floor(Math.random() * 7000) + 1000);

    await page.type('div[role="textbox"]', commentText);

    await timeout(Math.floor(Math.random() * 7000) + 1000);
    await page.click('button[type="submit"]');

    console.log(`Posted a comment on the post at URL: ${postUrl}`);
  } catch (error) {
    console.error(
      `Error posting a comment on the post at URL: ${postUrl}`,
      error
    );
    console.log("Hi this is the error talking");
    throw new Error(error);
  } finally {
    log(`Responded to post with URL ${postUrl}`);
    log("Closing the browser");
    // Close the browser
    await browser.close();
  }
}
module.exports = {
  fetchPost,
  postComment,
  postCommentWithPuppeteer,
  r,
};
