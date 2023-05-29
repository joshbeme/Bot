const fs = require("fs");
const csv = require("csv-parser");
const { fetchTweets, login, tweet } = require("./apis/twitter");

// Replace 'your_query' with the desired search query
// fetchTweets("cheap clothes");

const readCSV = async (csvFile = "tweets.csv") => {
  let results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on("data", async (row) => {
        results.push(row);
      })
      .on("end", async () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

(async () => {
  const tweets = await fetchTweets("cheap clothes", 15);
  const tweetData = (await readCSV()).filter(
    (tweet) => Number(tweet.SHOPPING_SENTIMENT) > 0.7
  );

  // const prompt = `You are desperate and broke, you really want people to click your specific Temu referral link to get money, your link is https://temu.com/s/VKbPngjCRqUkeA . Give a short entitled reply up to 20 words about your link. Make sure your link is always included. REDDIT POST:\n${post.title}}\n${post.selftext}\n\nResponse: `;
  // const response = await generateResponse(prompt);
  // const page = await login();

  const tweeting = await tweet(page, tweetData[0]);
  console.log(tweetData);
})();
