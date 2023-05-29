const fs = require("fs");
const TikTokApi = require("tiktok-api");

const tiktok = new TikTokApi({
  accessToken: "your-tiktok-access-token",
});

async function uploadToTiktok(videoPath) {
  const videoBuffer = fs.readFileSync(videoPath);
  const result = await tiktok.videos.create({ video: videoBuffer });
  console.log(`Uploaded video with ID: ${result.video_id}`);
}

module.exports = {
  uploadToTiktok,
};

// gatsby-transformer-remark custom plugin parser
/**
 * @param {Object} options
 * @param {Object<string, string>} options.customInlineTokens
 * @returns {Object}
 */
module.exports.setParser = ({ customInlineTokens }) => {
  const inlineTokenizers = Object.keys(customInlineTokens);
  const inlineMethods = inlineTokenizers.map((tokenizer) => tokenizer);

  return [
    setParser,
    {
      inlineTokenizers,
      inlineMethods,
    },
  ];
};
