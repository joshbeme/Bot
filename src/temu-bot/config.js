const redditPassword = process.env.REDDIT_PASSWORD;
const redditUsername = process.env.REDDIT_USERNAME;
const redditClientId = process.env.REDDIT_CLIENT_ID;
const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
const redditUserAgent = `windows:${process.env.REDDIT_CLIENT_ID}:v2.1.5 (by /u/${process.env.REDDIT_USERNAME})`;
const redditRefreshToken = process.env.REDDIT_REFRESH_TOKEN;
const redditAccessToken = process.env.REDDIT_ACCESS_TOKEN;
const redditSubreddit = "temu";
const redditSearch = "temu";
const openaiApiKey = process.env.OPENAI_API_KEY;
const referalLink = "https://temu.com/s/VKbPngjCRqUkeA";
const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const TEN_MINUTES = ONE_MINUTE * 10;
const ONE_HOUR = ONE_MINUTE * 60;

module.exports = {
  redditUsername,
  redditPassword,
  redditClientId,
  redditClientSecret,
  redditUserAgent,
  redditRefreshToken,
  redditAccessToken,
  redditSubreddit,
  redditSearch,
  openaiApiKey,
  referalLink,
  ONE_SECOND,
  ONE_MINUTE,
  TEN_MINUTES,
  ONE_HOUR,
};
