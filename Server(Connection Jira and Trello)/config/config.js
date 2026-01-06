module.exports = {
  server: {
    port: process.env.PORT || 5000
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  jira: {
    baseUrl: process.env.JIRA_BASE_URL,
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    projectKey: process.env.JIRA_PROJECT_KEY
  },
  trello: {
    apiKey: process.env.TRELLO_API_KEY,
    token: process.env.TRELLO_TOKEN,
    boardId: process.env.TRELLO_BOARD_ID,
    listId: process.env.TRELLO_LIST_ID
  }
};
