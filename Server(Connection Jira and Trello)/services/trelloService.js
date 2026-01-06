const axios = require('axios');
const config = require('../config/config');

class TrelloService {
  constructor() {
    this.apiKey = config.trello.apiKey;
    this.token = config.trello.token;
    this.boardId = config.trello.boardId;
    this.listId = config.trello.listId;
    this.baseUrl = 'https://api.trello.com/1';
  }

  /**
   * Create Trello card from task object
   */
  async createCard(taskData) {
    try {
      const { task, assignee, deadline, description, priority } = taskData;

      // Build card name with priority indicator
      const cardName = priority ? `[${priority}] ${task}` : task;

      // Build the card payload
      const cardPayload = {
        key: this.apiKey,
        token: this.token,
        idList: this.listId,
        name: cardName,
        desc: description || `Task: ${task}\nAssigned to: ${assignee || 'Unassigned'}`
      };

      // Add due date if provided
      if (deadline) {
        const dueDate = this.parseDateString(deadline);
        if (dueDate) {
          cardPayload.due = dueDate; // ISO 8601 format
        }
      }

      console.log('📤 Creating Trello card...', { name: cardName });

      const response = await axios.post(
        `${this.baseUrl}/cards`,
        null,
        { params: cardPayload }
      );

      // Add labels for priority if needed
      if (priority) {
        await this.addPriorityLabel(response.data.id, priority);
      }

      return {
        success: true,
        cardId: response.data.id,
        cardName: response.data.name,
        url: response.data.url,
        shortUrl: response.data.shortUrl,
        message: 'Trello card created successfully'
      };
    } catch (error) {
      console.error('❌ Trello API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create Trello card'
      };
    }
  }

  /**
   * Create multiple Trello cards from array of tasks
   */
  async createMultipleCards(tasks) {
    const results = [];
    
    for (const task of tasks) {
      const result = await this.createCard(task);
      results.push({
        task: task.task,
        ...result
      });
    }

    return results;
  }

  /**
   * Add priority label to card
   */
  async addPriorityLabel(cardId, priority) {
    try {
      // Get board labels
      const labelsResponse = await axios.get(
        `${this.baseUrl}/boards/${this.boardId}/labels`,
        {
          params: {
            key: this.apiKey,
            token: this.token
          }
        }
      );

      // Find matching priority label
      const priorityLabel = labelsResponse.data.find(label => 
        label.name.toLowerCase().includes(priority.toLowerCase())
      );

      if (priorityLabel) {
        await axios.post(
          `${this.baseUrl}/cards/${cardId}/idLabels`,
          null,
          {
            params: {
              key: this.apiKey,
              token: this.token,
              value: priorityLabel.id
            }
          }
        );
      }
    } catch (error) {
      console.log('⚠️ Could not add priority label:', error.message);
    }
  }

  /**
   * Parse natural language date to ISO format
   */
  parseDateString(dateString) {
    if (!dateString) return null;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lowerDate = dateString.toLowerCase();

    if (lowerDate.includes('today')) {
      return today.toISOString();
    } else if (lowerDate.includes('tomorrow')) {
      return tomorrow.toISOString();
    } else if (lowerDate.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString();
    }

    // Try to parse as regular date
    try {
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    } catch (e) {
      console.log('Could not parse date:', dateString);
    }

    return null;
  }

  /**
   * Get all lists in the board
   */
  async getLists() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/boards/${this.boardId}/lists`,
        {
          params: {
            key: this.apiKey,
            token: this.token
          }
        }
      );

      return {
        success: true,
        lists: response.data.map(list => ({
          id: list.id,
          name: list.name
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create card with custom configuration (for user-specific settings)
   */
  async createCardWithConfig(taskData, customConfig) {
    try {
      const { task, assignee, deadline, description, priority } = taskData;
      const cardName = priority ? `[${priority}] ${task}` : task;

      const cardPayload = {
        key: customConfig.apiKey,
        token: customConfig.apiToken,
        idList: customConfig.listId,
        name: cardName,
        desc: description || `Task: ${task}\nAssigned to: ${assignee || 'Unassigned'}`
      };

      if (deadline) {
        const dueDate = this.parseDateString(deadline);
        if (dueDate) {
          cardPayload.due = dueDate;
        }
      }

      const response = await axios.post(
        `${this.baseUrl}/cards`,
        null,
        { params: cardPayload }
      );

      if (priority) {
        await this.addPriorityLabelWithConfig(response.data.id, priority, customConfig);
      }

      return {
        success: true,
        cardId: response.data.id,
        cardName: response.data.name,
        url: response.data.url,
        shortUrl: response.data.shortUrl,
        message: 'Trello card created successfully'
      };
    } catch (error) {
      console.error('❌ Trello API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to create Trello card'
      };
    }
  }

  /**
   * Add priority label with custom config
   */
  async addPriorityLabelWithConfig(cardId, priority, customConfig) {
    try {
      const labelsResponse = await axios.get(
        `${this.baseUrl}/boards/${customConfig.boardId}/labels`,
        {
          params: {
            key: customConfig.apiKey,
            token: customConfig.apiToken
          }
        }
      );

      const priorityColors = {
        'Highest': 'red',
        'High': 'orange',
        'Medium': 'yellow',
        'Low': 'green',
        'Lowest': 'blue'
      };

      const color = priorityColors[priority] || 'yellow';
      let label = labelsResponse.data.find(l => 
        l.name.toLowerCase() === priority.toLowerCase()
      );

      if (!label) {
        label = labelsResponse.data.find(l => l.color === color);
      }

      if (label) {
        await axios.post(
          `${this.baseUrl}/cards/${cardId}/idLabels`,
          null,
          {
            params: {
              key: customConfig.apiKey,
              token: customConfig.apiToken,
              value: label.id
            }
          }
        );
      }
    } catch (error) {
      console.log('Could not add priority label:', error.message);
    }
  }

  /**
   * Test Trello connection with custom config
   */
  async testConnection(customConfig = null) {
    try {
      const params = customConfig ? {
        key: customConfig.apiKey,
        token: customConfig.apiToken
      } : {
        key: this.apiKey,
        token: this.token
      };

      const response = await axios.get(
        `${this.baseUrl}/members/me`,
        { params: params }
      );
      
      return {
        success: true,
        user: response.data.fullName,
        username: response.data.username
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new TrelloService();
