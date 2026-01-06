const axios = require('axios');
const config = require('../config/config');

class JiraService {
  constructor() {
    this.baseUrl = config.jira.baseUrl;
    this.auth = {
      username: config.jira.email,
      password: config.jira.apiToken
    };
    this.projectKey = config.jira.projectKey;
  }

  /**
   * Convert plain text to Atlassian Document Format (ADF)
   */
  convertToADF(text) {
    if (!text) return null;
    
    return {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: text
            }
          ]
        }
      ]
    };
  }

  /**
   * Sanitize summary to remove newlines and limit length
   */
  sanitizeSummary(text) {
    if (!text) return 'Untitled Task';
    
    // Remove newlines and extra spaces, limit to 255 characters
    return text
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 255);
  }

  /**
   * Create Jira issue from task object
   */
  async createIssue(taskData) {
    try {
      const { task, assignee, deadline, priority, description } = taskData;

      // Build the issue payload
      const issuePayload = {
        fields: {
          project: {
            key: this.projectKey
          },
          summary: this.sanitizeSummary(task),
          description: this.convertToADF(description || task),
          issuetype: {
            name: 'Task' // Can be 'Task', 'Story', 'Bug', etc.
          }
        }
      };

      // Add assignee if provided and not "Unassigned"
      if (assignee && assignee.toLowerCase() !== 'unassigned') {
        // For Jira Cloud, you need account ID. This is a simplified version.
        // In production, you'd need to map names to Jira account IDs
        issuePayload.fields.assignee = {
          name: assignee // For Jira Server
          // accountId: assignee // For Jira Cloud
        };
      }

      // Add due date if provided
      if (deadline) {
        const dueDate = this.parseDateString(deadline);
        if (dueDate) {
          issuePayload.fields.duedate = dueDate; // Format: YYYY-MM-DD
        }
      }

      // Add priority if provided
      if (priority) {
        issuePayload.fields.priority = {
          name: priority // 'Highest', 'High', 'Medium', 'Low', 'Lowest'
        };
      }

      console.log('📤 Creating Jira issue...', issuePayload);

      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        issuePayload,
        {
          auth: this.auth,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        issueKey: response.data.key,
        issueId: response.data.id,
        url: `${this.baseUrl}/browse/${response.data.key}`,
        message: 'Jira issue created successfully'
      };
    } catch (error) {
      console.error('❌ Jira API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
        message: 'Failed to create Jira issue'
      };
    }
  }

  /**
   * Create multiple Jira issues from array of tasks
   */
  async createMultipleIssues(tasks) {
    const results = [];
    
    for (const task of tasks) {
      const result = await this.createIssue(task);
      results.push({
        task: task.task,
        ...result
      });
    }

    return results;
  }

  /**
   * Parse natural language date to YYYY-MM-DD format
   */
  parseDateString(dateString) {
    if (!dateString) return null;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lowerDate = dateString.toLowerCase();

    if (lowerDate.includes('today')) {
      return this.formatDate(today);
    } else if (lowerDate.includes('tomorrow')) {
      return this.formatDate(tomorrow);
    } else if (lowerDate.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return this.formatDate(nextWeek);
    }

    // Try to parse as regular date
    try {
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return this.formatDate(parsedDate);
      }
    } catch (e) {
      console.log('Could not parse date:', dateString);
    }

    return null;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Create issue with custom configuration (for user-specific settings)
   */
  async createIssueWithConfig(taskData, customConfig) {
    const baseUrl = `https://${customConfig.domain}`;
    const auth = {
      username: customConfig.email,
      password: customConfig.apiToken
    };
    const projectKey = customConfig.projectKey;

    try {
      const { task, assignee, deadline, priority, description } = taskData;

      const issuePayload = {
        fields: {
          project: { key: projectKey },
          summary: this.sanitizeSummary(task),
          description: this.convertToADF(description || task),
          issuetype: { name: 'Task' }
        }
      };

      if (assignee && assignee.toLowerCase() !== 'unassigned') {
        issuePayload.fields.assignee = { name: assignee };
      }

      if (deadline) {
        const dueDate = this.parseDateString(deadline);
        if (dueDate) {
          issuePayload.fields.duedate = dueDate;
        }
      }

      if (priority) {
        issuePayload.fields.priority = { name: priority };
      }

      const response = await axios.post(
        `${baseUrl}/rest/api/3/issue`,
        issuePayload,
        {
          auth: auth,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return {
        success: true,
        issueKey: response.data.key,
        issueId: response.data.id,
        url: `${baseUrl}/browse/${response.data.key}`,
        message: 'Jira issue created successfully'
      };
    } catch (error) {
      console.error('❌ Jira API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
        message: 'Failed to create Jira issue'
      };
    }
  }

  /**
   * Create multiple issues with custom configuration
   */
  async createMultipleIssuesWithConfig(tasks, customConfig) {
    const results = [];
    
    for (const task of tasks) {
      const result = await this.createIssueWithConfig(task, customConfig);
      results.push({
        task: task.task,
        ...result
      });
    }

    return results;
  }

  /**
   * Test Jira connection with custom config
   */
  async testConnection(customConfig = null) {
    const config = customConfig || {
      domain: this.baseUrl.replace('https://', ''),
      email: this.auth.username,
      apiToken: this.auth.password
    };

    try {
      const baseUrl = customConfig ? `https://${customConfig.domain}` : this.baseUrl;
      const auth = customConfig ? {
        username: customConfig.email,
        password: customConfig.apiToken
      } : this.auth;

      const response = await axios.get(
        `${baseUrl}/rest/api/3/myself`,
        { auth: auth }
      );
      return {
        success: true,
        user: response.data.displayName,
        email: response.data.emailAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new JiraService();
