const jiraService = require('./jiraService');
const trelloService = require('./trelloService');

/**
 * User Configuration Service
 * Manages user-specific settings for Jira and Trello
 */

class UserConfigService {
  /**
   * Get user's Jira configuration
   */
  getUserJiraConfig(user) {
    // Check if user has custom Jira config
    if (user.jiraConfig && this.validateJiraConfig(user.jiraConfig)) {
      return user.jiraConfig;
    }

    // Fallback to environment variables
    return {
      domain: process.env.JIRA_DOMAIN,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_API_TOKEN,
      projectKey: process.env.JIRA_PROJECT_KEY
    };
  }

  /**
   * Get user's Trello configuration
   */
  getUserTrelloConfig(user) {
    // Check if user has custom Trello config
    if (user.trelloConfig && this.validateTrelloConfig(user.trelloConfig)) {
      return user.trelloConfig;
    }

    // Fallback to environment variables
    return {
      apiKey: process.env.TRELLO_API_KEY,
      apiToken: process.env.TRELLO_API_TOKEN,
      boardId: process.env.TRELLO_BOARD_ID,
      listId: process.env.TRELLO_LIST_ID
    };
  }

  /**
   * Validate Jira configuration
   */
  validateJiraConfig(config) {
    return config && 
           config.domain && 
           config.email && 
           config.apiToken && 
           config.projectKey;
  }

  /**
   * Validate Trello configuration
   */
  validateTrelloConfig(config) {
    return config && 
           config.apiKey && 
           config.apiToken && 
           config.boardId;
  }

  /**
   * Create Jira issue using user's configuration
   */
  async createJiraIssueForUser(user, taskData) {
    const config = this.getUserJiraConfig(user);
    
    if (!this.validateJiraConfig(config)) {
      return {
        success: false,
        error: 'Jira configuration not set',
        message: 'Please configure your Jira settings in your profile'
      };
    }

    // Use user-specific config
    return await jiraService.createIssueWithConfig(taskData, config);
  }

  /**
   * Create Trello card using user's configuration
   */
  async createTrelloCardForUser(user, taskData) {
    const config = this.getUserTrelloConfig(user);
    
    if (!this.validateTrelloConfig(config)) {
      return {
        success: false,
        error: 'Trello configuration not set',
        message: 'Please configure your Trello settings in your profile'
      };
    }

    // Use user-specific config
    return await trelloService.createCardWithConfig(taskData, config);
  }

  /**
   * Create multiple Jira issues using user's configuration
   */
  async createMultipleJiraIssuesForUser(user, tasks) {
    const config = this.getUserJiraConfig(user);
    
    if (!this.validateJiraConfig(config)) {
      return {
        success: false,
        error: 'Jira configuration not set',
        message: 'Please configure your Jira settings in your profile'
      };
    }

    return await jiraService.createMultipleIssuesWithConfig(tasks, config);
  }

  /**
   * Test user's Jira connection
   */
  async testJiraConnection(config) {
    try {
      return await jiraService.testConnection(config);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test user's Trello connection
   */
  async testTrelloConnection(config) {
    try {
      return await trelloService.testConnection(config);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's configuration status
   */
  getUserConfigStatus(user) {
    const jiraConfig = this.getUserJiraConfig(user);
    const trelloConfig = this.getUserTrelloConfig(user);

    return {
      jira: {
        configured: this.validateJiraConfig(jiraConfig),
        isCustom: !!user.jiraConfig,
        domain: jiraConfig.domain || null,
        projectKey: jiraConfig.projectKey || null
      },
      trello: {
        configured: this.validateTrelloConfig(trelloConfig),
        isCustom: !!user.trelloConfig,
        boardId: trelloConfig.boardId || null
      }
    };
  }
}

module.exports = new UserConfigService();
