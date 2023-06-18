export const uiConfig = {
  // Reddit
  redditUsername: {
    type: "string",
    default: "Legal-Comb-4434",
    name: "Reddit Username",
    group: "Reddit",
  },
  redditPassword: {
    type: "password",
    default: "",
    name: "Reddit Password",
    group: "Reddit",
  },
  redditSearch: {
    type: "string",
    default: "temu",
    name: "Reddit Search",
    group: "Reddit",
  },
  sortSubredditsBy: {
    type: "pick-one",
    name: "Sort Reddit Search By",
    default: "hot",
    options: ["hot", "new", "rising", "controversial", "top", "gilded"],
    group: "Reddit",
  },
  subredditIncludes: {
    type: "string",
    name: "Subreddit Search Includes",
    default: "temu",
    group: "Reddit",
  },
  subredditExcludes: {
    type: "string",
    name: "Subreddit Search Excludes",
    default: "canada",
    group: "Reddit",
  },
  subredditSearchLimit: {
    type: "number",
    name: "Subreddit Search Limit",
    default: 10,
    group: "Reddit",
  },

  // Bot Settings
  retryOnFailure: {
    type: "boolean",
    name: "Retry on Failure",
    default: true,
    group: "Bot Settings",
  },
  botResponseInterval: {
    type: "time",
    name: "Bot reply interval (ms)",
    default: 1000 * 60 * 2, // 24 hours
    group: "Bot Settings",
  },

  useChatGPT: {
    type: "boolean",
    name: "Use Chat GPT for Bot Response",
    default: true,
    group: "Bot Settings",
  },
  hasRepliedBy: {
    type: "pick-one",
    name: "Only reply once to post by",
    default: "author",
    options: ["author", "id"],
    group: "Bot Settings",
  },
  notHeadless: {
    type: "boolean",
    name: "Display Browser when bot replies",
    default: true,
    group: "Bot Settings",
  },
  retryEvery: {
    type: "time",
    name: "Retry every (ms)",
    default: 1000 * 60 * 30, // 30 minutes
    group: "Bot Settings",
  },

  // Only show if this UI of the parent is true
  botPrompt: {
    type: "textarea",
    name: "Chat GPT Prompt",
    description:
      "Use $1 to insert the post title and $2 to insert the post body. \nExample: Respond to this post: $1 $2 Response:",
    default:
      "You want people to click your Temu referral link, your link is https://temu.com/s/VKbPngjCRqUkeA. Give a short response to the reddit post with your link. \nREDDIT POST:\n$1\n$2\n\nResponse: ",
    group: "Bot Settings",

    if: {
      useChatGPT: true,
    },
  },
  chatGPTSystemRole: {
    type: "string",
    name: "Chat GPT context",
    default: "You are broke and need extra money.",
    group: "Bot Settings",
    if: {
      useChatGPT: true,
    },
  },
  chatGPTModel: {
    type: "pick-one",
    name: "Chat GPT Model",
    default: "gpt-4",
    options: ["gpt-4", "gpt-3.5-turbo"],
    group: "Bot Settings",
    if: {
      useChatGPT: true,
    },
  },
  botResponse: {
    type: "textarea",
    name: "Bot Response",
    default: "CLICK FOR CLICK!!! https://temu.com/s/VKbPngjCRqUkeA",
    group: "Bot Settings",
    if: {
      useChatGPT: false,
    },
  },

  // Other
  referalLink: {
    type: "string",
    name: "Referal Link",
    default: "https://temu.com/s/VKbPngjCRqUkeA",
  },
};
// const time = {
//   ONE_SECOND: 1000,
//   ONE_MINUTE: ONE_SECOND * 60,
//   TEN_MINUTES: ONE_MINUTE * 10,
//   ONE_HOUR: ONE_MINUTE * 60,
// };
export default uiConfig;
