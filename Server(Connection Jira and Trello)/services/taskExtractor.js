const OpenAI = require('openai');
const config = require('../config/config');

class TaskExtractor {
  constructor() {
    // Initialize OpenAI if API key is provided
    this.openai = config.openai.apiKey ? new OpenAI({ apiKey: config.openai.apiKey }) : null;
  }

  /**
   * Extract tasks from meeting transcript text using AI
   */
  async extractWithAI(transcriptText) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const prompt = `Extract all tasks from this meeting transcript. For each task, identify:
- task: clear task title
- assignee: person assigned (or "Unassigned" if not mentioned)
- deadline: deadline or date (or null if not mentioned)
- priority: High/Medium/Low (or "Medium" as default)

Meeting Transcript:
"${transcriptText}"

Return ONLY valid JSON array format. Example:
[
  {
    "task": "Integrate Jira API",
    "assignee": "Sir",
    "deadline": "Tomorrow",
    "priority": "High"
  }
]`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a task extraction assistant. Extract tasks from meeting transcripts and return them as JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      });

      const content = completion.choices[0].message.content.trim();
      // Remove markdown code blocks if present
      const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('AI extraction error:', error);
      throw new Error(`AI extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract tasks using simple rule-based logic (fallback)
   */
  extractWithRules(transcriptText) {
    const tasks = [];
    
    // Split text into sentences
    const sentences = transcriptText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Keywords that indicate task assignment
    const taskKeywords = ['will', 'should', 'need to', 'must', 'has to', 'responsible for', 'handle', 'integrate', 'implement', 'create', 'develop'];
    const timeKeywords = ['tomorrow', 'today', 'next week', 'by', 'before', 'deadline', 'due'];

    sentences.forEach(sentence => {
      // Check if sentence contains task indicators
      const hasTaskKeyword = taskKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );

      if (hasTaskKeyword) {
        const task = this.parseTask(sentence, timeKeywords);
        if (task) {
          tasks.push(task);
        }
      }
    });

    return tasks.length > 0 ? tasks : this.createDefaultTask(transcriptText);
  }

  parseTask(sentence, timeKeywords) {
    // Extract assignee (name before "will" or similar keywords)
    const willMatch = sentence.match(/(\w+)\s+(will|should|must|has to|need to)/i);
    const assignee = willMatch ? willMatch[1] : 'Unassigned';

    // Extract deadline
    let deadline = null;
    for (const keyword of timeKeywords) {
      if (sentence.toLowerCase().includes(keyword)) {
        const deadlineMatch = sentence.match(new RegExp(`(${keyword}[^,.]*)`, 'i'));
        if (deadlineMatch) {
          deadline = deadlineMatch[1].trim();
          break;
        }
      }
    }

    // Extract task description (simplified)
    let taskDescription = sentence
      .replace(/(\w+)\s+(will|should|must|has to|need to)\s+/i, '')
      .split(/\s+(by|before|tomorrow|today|next week)/i)[0]
      .trim();

    if (taskDescription.length > 100) {
      taskDescription = taskDescription.substring(0, 97) + '...';
    }

    return {
      task: taskDescription || sentence.substring(0, 100),
      assignee: assignee,
      deadline: deadline,
      priority: 'Medium'
    };
  }

  createDefaultTask(text) {
    return [{
      task: text.substring(0, 100),
      assignee: 'Unassigned',
      deadline: null,
      priority: 'Medium'
    }];
  }

  /**
   * Main extraction method with fallback
   */
  async extract(transcriptText, useAI = true) {
    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error('Transcript text cannot be empty');
    }

    try {
      if (useAI && this.openai) {
        console.log('📝 Extracting tasks using AI...');
        return await this.extractWithAI(transcriptText);
      } else {
        console.log('📝 Extracting tasks using rule-based logic...');
        return this.extractWithRules(transcriptText);
      }
    } catch (error) {
      console.log('⚠️ AI extraction failed, falling back to rule-based extraction');
      return this.extractWithRules(transcriptText);
    }
  }
}

module.exports = new TaskExtractor();
