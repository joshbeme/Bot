const fs = require("fs");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");

const textToSpeechClient = new TextToSpeechClient({
  keyFilename: "path/to/your/google-cloud-keyfile.json",
});

async function textToSpeech(text) {
  const request = {
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await textToSpeechClient.synthesizeSpeech(request);
  fs.writeFileSync("output.mp3", response.audioContent, "binary");
  console.log("Audio file created");
}

module.exports = { textToSpeech };
