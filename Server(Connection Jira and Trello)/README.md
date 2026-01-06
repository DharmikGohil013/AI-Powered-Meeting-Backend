# Meeting Task Automation Backend 🚀

> **🎯 Quick Start:** Read [START_HERE.md](START_HERE.md) | Server running at http://localhost:5000 ✅

Complete backend system for automated meeting task extraction with Jira & Trello integration.

---

## 📚 Documentation Navigation

**New to this project?** → [START_HERE.md](START_HERE.md)  
**Quick Setup (5 min)?** → [QUICKSTART.md](QUICKSTART.md)  
**Need credentials?** → [SETUP_GUIDE.md](SETUP_GUIDE.md)  
**API reference?** → [API_DOCS.md](API_DOCS.md)  
**Testing?** → [TEST_CASES.md](TEST_CASES.md)  
**Demo prep?** → [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)  
**Cheat sheet?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## 📋 Features

- ✅ **Task Extraction** - AI-powered (OpenAI) + Rule-based fallback
- ✅ **Jira Integration** - Create issues automatically
- ✅ **Trello Integration** - Create cards automatically
- ✅ **Bulk Operations** - Process multiple tasks at once
- ✅ **Manual Task Creation** - Direct API for adding tasks
- ✅ **Enterprise-Ready** - Error handling & validation

---

## 🛠️ Tech Stack

- **Node.js** + **Express.js**
- **OpenAI API** (GPT-3.5) for intelligent task extraction
- **Jira REST API v3**
- **Trello REST API**
- **Axios** for HTTP requests

---

## 📂 Project Structure

```
DAIICT-Inno/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example            # Template for environment variables
├── config/
│   └── config.js           # Configuration management
├── services/
│   ├── taskExtractor.js    # Task extraction logic (AI + Rules)
│   ├── jiraService.js      # Jira API integration
│   └── trelloService.js    # Trello API integration
└── routes/
    └── taskRoutes.js       # API endpoints
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Then edit `.env` with your credentials:

```env
# Server
PORT=5000

# OpenAI (for AI-powered extraction)
OPENAI_API_KEY=sk-...

# Jira
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_PROJECT_KEY=PROJ

# Trello
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_BOARD_ID=your_board_id
TRELLO_LIST_ID=your_list_id
```

### 3. Get API Credentials

#### **Jira API Token:**
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token to `.env`

#### **Trello API Key & Token:**
1. Go to: https://trello.com/power-ups/admin
2. Create new Power-Up or use existing
3. Get API Key and Token
4. Get Board ID and List ID from Trello board URL

#### **OpenAI API Key (Optional):**
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy to `.env`

*(If not provided, system will use rule-based extraction)*

### 4. Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on: `http://localhost:5000`

---

## 📡 API Endpoints

### 1. **Extract Tasks from Meeting Transcript**

```http
POST /api/tasks/extract
Content-Type: application/json

{
  "transcriptText": "Sir will integrate Jira by tomorrow and Tushar will handle Trello sync.",
  "useAI": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tasks extracted successfully",
  "count": 2,
  "tasks": [
    {
      "task": "Integrate Jira",
      "assignee": "Sir",
      "deadline": "Tomorrow",
      "priority": "Medium"
    },
    {
      "task": "Handle Trello sync",
      "assignee": "Tushar",
      "deadline": null,
      "priority": "Medium"
    }
  ]
}
```

---

### 2. **Create Single Task in Jira**

```http
POST /api/tasks/jira
Content-Type: application/json

{
  "task": "Integrate Jira API",
  "assignee": "Sir",
  "deadline": "2026-01-10",
  "priority": "High",
  "description": "Complete Jira REST API integration"
}
```

---

### 3. **Create Single Task in Trello**

```http
POST /api/tasks/trello
Content-Type: application/json

{
  "task": "Design UI mockups",
  "assignee": "Designer",
  "deadline": "Tomorrow",
  "priority": "High"
}
```

---

### 4. **Create Tasks in Both (Jira + Trello)**

```http
POST /api/tasks/manual-create
Content-Type: application/json

{
  "task": "Setup database schema",
  "assignee": "Backend Team",
  "deadline": "2026-01-15",
  "priority": "High",
  "description": "Design and implement database",
  "target": "both"
}
```

**Options for `target`:**
- `"both"` - Create in Jira & Trello
- `"jira"` - Create only in Jira
- `"trello"` - Create only in Trello

---

### 5. **Extract & Auto-Create (Complete Flow)**

```http
POST /api/tasks/create-all
Content-Type: application/json

{
  "transcriptText": "Meeting notes: John will review code by Friday. Sarah will deploy to staging tomorrow.",
  "useAI": true,
  "target": "both"
}
```

This endpoint:
1. Extracts tasks from text
2. Creates Jira issues
3. Creates Trello cards
4. Returns all results

---

### 6. **Bulk Create in Jira**

```http
POST /api/tasks/jira/bulk
Content-Type: application/json

{
  "tasks": [
    {
      "task": "Task 1",
      "assignee": "Person A",
      "deadline": "Tomorrow"
    },
    {
      "task": "Task 2",
      "assignee": "Person B",
      "deadline": "Next week"
    }
  ]
}
```

---

### 7. **Bulk Create in Trello**

```http
POST /api/tasks/trello/bulk
Content-Type: application/json

{
  "tasks": [
    {
      "task": "Task 1",
      "assignee": "Person A"
    }
  ]
}
```

---

### 8. **Test Connections**

```http
GET /api/tasks/test-connections
```

Tests both Jira and Trello API connectivity.

---

### 9. **Get Trello Lists**

```http
GET /api/tasks/trello/lists
```

Returns all lists in your Trello board.

---

## 🧪 Testing with Postman/Thunder Client

### Example 1: Simple Manual Task

```json
POST http://localhost:5000/api/tasks/manual-create

{
  "task": "Fix login bug",
  "assignee": "Dev Team",
  "deadline": "Tomorrow",
  "priority": "High",
  "target": "both"
}
```

### Example 2: Meeting Transcript Extraction

```json
POST http://localhost:5000/api/tasks/extract

{
  "transcriptText": "In today's standup: Mike will fix the authentication bug by Wednesday. Lisa will create design mockups by tomorrow. The team needs to review the API documentation by next Monday.",
  "useAI": true
}
```

---

## 🎯 System Flow

```
Meeting Audio/Text
       ↓
   Transcription (External - Whisper/STT)
       ↓
   Task Extraction (taskExtractor.js)
   - AI-powered (OpenAI GPT-3.5)
   - Rule-based fallback
       ↓
   Task Approval (Optional - Frontend)
       ↓
   Parallel Creation
   ├── Jira Issue (jiraService.js)
   └── Trello Card (trelloService.js)
       ↓
   Success Response with URLs
```

---

## 🎨 For Hackathon Presentation

### Key Points to Explain:

1. **AI-Powered Intelligence**
   - Uses OpenAI to understand natural language
   - Automatically identifies tasks, assignees, deadlines
   - Falls back to rule-based logic if AI unavailable

2. **Enterprise Integration**
   - Real Jira REST API integration
   - Real Trello REST API integration
   - Production-ready error handling

3. **Practical Safety**
   - Manual approval flow (can be added in frontend)
   - Validation before task creation
   - Detailed error messages

4. **Scalable Architecture**
   - Modular service design
   - Easy to add more integrations (Slack, Teams, etc.)
   - RESTful API design

---

## 🔧 Troubleshooting

### Issue: Jira authentication failed
- Verify `JIRA_EMAIL` and `JIRA_API_TOKEN`
- Check if API token is still valid
- Ensure project key exists

### Issue: Trello card not created
- Verify `TRELLO_API_KEY` and `TRELLO_TOKEN`
- Check if `TRELLO_LIST_ID` is correct
- Get list ID from: `GET /api/tasks/trello/lists`

### Issue: AI extraction not working
- Check if `OPENAI_API_KEY` is valid
- System will automatically fallback to rule-based
- Check console logs for details

---

## 📝 Next Steps (Frontend Integration)

To complete the full system, create a simple frontend with:

1. **Meeting Input Page**
   - Textarea for meeting transcript
   - "Extract Tasks" button

2. **Task Review Page**
   - Show extracted tasks in a table
   - Edit/approve individual tasks
   - "Push to Jira" / "Push to Trello" buttons

3. **Dashboard**
   - Recent meetings
   - Tasks created
   - Quick stats

---

## 👥 Team Responsibilities

- **Backend (You)**: ✅ Complete
- **Frontend**: UI for task approval & display
- **Integration**: Connect transcription service
- **Testing**: E2E testing with real data

---

## 📄 License

MIT License - Free to use for hackathon and beyond!

---

## 🙋 Support

For issues or questions:
1. Check console logs
2. Test connections: `GET /api/tasks/test-connections`
3. Verify `.env` configuration

---

**Built for DAIICT Innovation Hackathon** 🎯
