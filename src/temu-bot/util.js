const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { parentPort } = require("worker_threads");

const logs = [];

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const repliedPosts = fs
  .readFileSync(path.join(__dirname, "replied_posts.txt"), "utf-8")
  .split("\n");

// Function to check if the post has already been replied to
function hasReplied(postId) {
  return repliedPosts.includes(postId);
}

// Function to store the replied post's ID
function storeRepliedPost(postId) {
  repliedPosts.push(postId);
}

async function combineAudioVideo(audioPath, videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(audioPath)
      .videoCodec("copy")
      .audioCodec("aac")
      .save(outputPath)
      .on("error", reject)
      .on("end", resolve);
  });
}

const log = (message) => {
  logs.push(message);
  parentPort.postMessage(JSON.stringify({ type: "log", message: logs }));
};

const randomTimeout = (rangeStart = 0, rangeEnd = 1000) => {
  const tmTime = Math.floor(Math.random() * rangeEnd) + rangeStart;

  log(`Waiting for ${tmTime}ms`);
  return timeout(tmTime);
};

// Before the process exits save replied posts to file
process.on("exit", () => {
  fs.writeFileSync(
    path.join(__dirname, "replied_posts.txt"),
    repliedPosts.join("\n")
  );
});

parentPort.on("message", async (message) => {
  if (message === "stop") {
    log("Stopping worker thread");
    process.exit();
  }
});

module.exports = {
  timeout,
  hasReplied,
  storeRepliedPost,
  combineAudioVideo,
  repliedPosts,
  randomTimeout,
  log,
};
