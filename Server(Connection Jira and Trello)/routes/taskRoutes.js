const express = require('express');
const router = express.Router();
const taskExtractor = require('../services/taskExtractor');
const jiraService = require('../services/jiraService');
const trelloService = require('../services/trelloService');

/**
 * POST /api/tasks/extract
 * Extract tasks from meeting transcript
 */
router.post('/extract', async (req, res) => {
  try {
    const { transcriptText, useAI = true } = req.body;

    if (!transcriptText) {
      return res.status(400).json({ 
        error: 'Transcript text is required',
        field: 'transcriptText'
      });
    }

    const tasks = await taskExtractor.extract(transcriptText, useAI);

    res.json({
      success: true,
      message: 'Tasks extracted successfully',
      count: tasks.length,
      tasks: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/jira
 * Create task in Jira
 */
router.post('/jira', async (req, res) => {
  try {
    const taskData = req.body;

    if (!taskData.task) {
      return res.status(400).json({ 
        error: 'Task title is required',
        field: 'task'
      });
    }

    const result = await jiraService.createIssue(taskData);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/jira/bulk
 * Create multiple tasks in Jira
 */
router.post('/jira/bulk', async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ 
        error: 'Tasks array is required',
        field: 'tasks'
      });
    }

    const results = await jiraService.createMultipleIssues(tasks);

    res.json({
      success: true,
      message: 'Bulk Jira issues creation completed',
      results: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/trello
 * Create card in Trello
 */
router.post('/trello', async (req, res) => {
  try {
    const taskData = req.body;

    if (!taskData.task) {
      return res.status(400).json({ 
        error: 'Task title is required',
        field: 'task'
      });
    }

    const result = await trelloService.createCard(taskData);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/trello/bulk
 * Create multiple cards in Trello
 */
router.post('/trello/bulk', async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ 
        error: 'Tasks array is required',
        field: 'tasks'
      });
    }

    const results = await trelloService.createMultipleCards(tasks);

    res.json({
      success: true,
      message: 'Bulk Trello cards creation completed',
      results: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/create-all
 * Extract tasks and create in both Jira and Trello
 */
router.post('/create-all', async (req, res) => {
  try {
    const { transcriptText, useAI = true, target = 'both' } = req.body;

    if (!transcriptText) {
      return res.status(400).json({ 
        error: 'Transcript text is required',
        field: 'transcriptText'
      });
    }

    // Step 1: Extract tasks
    console.log('📝 Step 1: Extracting tasks...');
    const tasks = await taskExtractor.extract(transcriptText, useAI);

    const results = {
      extractedTasks: tasks,
      jiraResults: null,
      trelloResults: null
    };

    // Step 2: Create in Jira
    if (target === 'both' || target === 'jira') {
      console.log('📤 Step 2: Creating Jira issues...');
      results.jiraResults = await jiraService.createMultipleIssues(tasks);
    }

    // Step 3: Create in Trello
    if (target === 'both' || target === 'trello') {
      console.log('📤 Step 3: Creating Trello cards...');
      results.trelloResults = await trelloService.createMultipleCards(tasks);
    }

    res.json({
      success: true,
      message: 'Tasks extracted and created successfully',
      taskCount: tasks.length,
      results: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/manual-create
 * Manually create task in Jira and/or Trello
 */
router.post('/manual-create', async (req, res) => {
  try {
    const { task, assignee, deadline, priority, description, target = 'both' } = req.body;

    if (!task) {
      return res.status(400).json({ 
        error: 'Task title is required',
        field: 'task'
      });
    }

    const taskData = { task, assignee, deadline, priority, description };
    const results = {};

    // Create in Jira
    if (target === 'both' || target === 'jira') {
      console.log('📤 Creating in Jira...');
      results.jira = await jiraService.createIssue(taskData);
    }

    // Create in Trello
    if (target === 'both' || target === 'trello') {
      console.log('📤 Creating in Trello...');
      results.trello = await trelloService.createCard(taskData);
    }

    res.json({
      success: true,
      message: 'Task created successfully',
      results: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/test-connections
 * Test Jira and Trello connections
 */
router.get('/test-connections', async (req, res) => {
  try {
    const jiraTest = await jiraService.testConnection();
    const trelloTest = await trelloService.testConnection();

    res.json({
      jira: jiraTest,
      trello: trelloTest,
      overall: jiraTest.success && trelloTest.success
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/trello/lists
 * Get all Trello lists
 */
router.get('/trello/lists', async (req, res) => {
  try {
    const result = await trelloService.getLists();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
