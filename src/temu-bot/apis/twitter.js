const puppeteer = require("puppeteer");
const fs = require("fs");
const { completionChat } = require("./chatGPT");
const {
  storeRepliedPost,
  hasReplied,
  repliedPosts,
  timeout,
} = require("../util");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const username = "5629687713";
const password = "!Ilovedota1";
const tweetContent = "your_tweet_content";

const csvWriter = createCsvWriter({
  path: "tweets.csv",
  header: [
    { id: "username", title: "USERNAME" },
    { id: "tweet_url", title: "TWEET_URL" },
    { id: "content", title: "CONTENT" },
    { id: "created_at", title: "CREATED_AT" },
  ],
});

const clickButton = async (page, buttonText) => {
  try {
    const [button] = await page.$x(
      `//div[@role='button']/div[contains(., '${buttonText}')]`
    );
    console.log(button);
    if (button) {
      await button.click();
    }
    return button;
  } catch (error) {
    console.log(error);
  }
};

async function fetchTweets(query, count = 20) {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const url = `https://twitter.com/search?q=${encodeURIComponent(
    query
  )}&src=typed_query&f=live`;
  console.log(`Navigating to ${url}`);
  await page.goto(url);

  let tweetData = [];

  try {
    console.log(`Fetching up to ${count} tweets...`);
    tweetData = await page.evaluate(
      async (count, repliedPosts) => {
        window.startTime = Date.now();
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const authors = new Set(repliedPosts);
        console.log("Extracting tweets...");
        // await sleep(10000000000);

        const extractTweets = async () => {
          await sleep(1000);
          const tweetElements = document.querySelectorAll(
            'article[data-testid="tweet"]'
          );
          let tweets = [];

          console.log(`Found ${tweetElements.length} tweets.`);
          for (const tweetElement of tweetElements) {
            const usernameElement = tweetElement.querySelector(
              'div:not([role="group"]):nth-child(2) > div:nth-child(2) > div > div > div > div > div > div:nth-child(2) > div > div'
            );

            if (usernameElement && !authors.has(usernameElement.textContent))
              authors.add(usernameElement.textContent);
            else continue;

            const contentElement = tweetElement.querySelector("div[lang]");
            const createdAtElement = tweetElement.querySelector(
              'a[href*="/status/"] > time'
            );

            if (usernameElement && contentElement && createdAtElement) {
              const username = usernameElement.textContent;
              const content = contentElement.textContent;
              const createdAt = createdAtElement.getAttribute("datetime");
              const tweetId = createdAtElement.parentNode.href.split("/").pop();
              const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;

              tweets.push({
                username,
                tweet_url: tweetUrl,
                content,
                created_at: createdAt,
              });
            }
          }
          console.log(`Extracted ${tweets.length} tweets.`);
          console.log(JSON.stringify(tweets, null, 2));

          return tweets;
        };

        let tweets = [];
        while (tweets.length < count) {
          tweets = tweets.concat(await extractTweets());
          // tweets = tweets.filter((tweet) => !authors.has(tweet.username));
          await sleep(1000);
          window.scrollBy(0, window.innerHeight);

          if (tweets.length) console.log("tweets", tweets);
          // Stop if time runs out
          if (Date.now() - window.startTime > 1000 * 20) break;
        }

        return tweets.slice();
      },
      count,
      repliedPosts
    );
    console.log(`Fetched ${tweetData.length} tweets.`);
  } catch (error) {
    console.error("Error fetching tweets:", error);
  } finally {
    console.log("Closing browser...");
    await browser.close();
  }

  console.log("Saving tweets to CSV file...");
  try {
    tweetData.forEach((data) => storeRepliedPost(data.username));
    await csvWriter.writeRecords(tweetData);

    const csv = await fs.promises.readFile("tweets.csv", "utf8");
    console.log("Tweets saved to CSV file!");
    const chat = await completionChat([
      {
        role: "user",
        content: `Current Time: ${new Date().toLocaleString()}
        Rewrite this csv data and add an extra column named SHOPPING_SENTIMENT to add a sentiment float value from 0 to 1 based off whether the text in the content is from someone likely to shop for inexpensive things online:
        ${csv}`,
      },
    ]);

    console.log("chat:", chat);
    await fs.promises.writeFile("tweets.csv", chat, "utf8");
  } catch (err) {
    console.error("Error writing CSV file:", err);
  }
}

async function login() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  console.log("Logging in...");
  await page.goto("https://twitter.com/login");
  await timeout(1000);

  await page.waitForSelector('input[autocomplete="username"]');
  await page.type('input[autocomplete="username"]', username);
  await clickButton(page, "Next");

  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', password);
  await clickButton(page, "Log in");

  //   await timeout(10000000);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    // page.click('div[data-testid="LoginForm_Login_Button"]'),
  ]);

  console.log("Logged in successfully.");
  return page;
}

async function tweet(page, content, tweetUrl) {
  console.log("Replying to the tweet...");
  await page.goto(tweetUrl);

  await page.waitForSelector('div[data-testid="reply"]');
  await page.click('div[data-testid="reply"]');

  await page.waitForSelector('div[aria-label="Tweet text"]');
  await page.type('div[aria-label="Tweet text"]', content);

  await page.click('div[data-testid="tweetButtonInline"]');

  console.log("Tweet reply posted successfully.");
}

module.exports = { fetchTweets, login, tweet };
