# Quick Start Guide ⚡

## For Hackathon Demo - Fast Setup

### Step 1: Install Dependencies (30 seconds)
```bash
npm install
```

### Step 2: Setup Environment (2 minutes)
```bash
# Copy the example file
copy .env.example .env

# Edit .env with your credentials
notepad .env
```

**Minimum required for testing:**
- `PORT=5000`
- Leave others as placeholders for now

### Step 3: Start Server (5 seconds)
```bash
npm start
```

You should see:
```
🚀 Server running on port 5000
📝 API Documentation: http://localhost:5000
```

### Step 4: Test Basic Functionality (30 seconds)

Open browser or Postman:
```
http://localhost:5000
```

You should see the API welcome message!

---

## Quick Test Without Credentials

You can test task extraction **without** Jira/Trello setup:

```bash
# In new terminal
curl -X POST http://localhost:5000/api/tasks/extract ^
  -H "Content-Type: application/json" ^
  -d "{\"transcriptText\":\"John will fix bug tomorrow\",\"useAI\":false}"
```

This uses rule-based extraction (no OpenAI needed).

---

## For Full Demo (with Jira & Trello)

Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) to get:
1. Jira API token
2. Trello API key & token
3. (Optional) OpenAI API key

Then update `.env` and restart server.

---

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Start server (production) |
| `npm run dev` | Start with auto-reload |
| `node test.js` | Run test suite |

---

## Project Structure (What You Need to Know)

```
d:\DAIICT-Inno\
├── server.js              ← Main entry point
├── .env                   ← Your credentials (create this!)
├── package.json           ← Dependencies
│
├── config/
│   └── config.js         ← Configuration loader
│
├── services/
│   ├── taskExtractor.js  ← Task extraction logic
│   ├── jiraService.js    ← Jira integration
│   └── trelloService.js  ← Trello integration
│
└── routes/
    └── taskRoutes.js     ← API endpoints
```

---

## For Your Hackathon Presentation

### Architecture Flow:
```
Meeting Transcript
       ↓
  [Extract Tasks] ← AI or Rule-based
       ↓
  [Review Tasks] ← Optional approval
       ↓
  [Push to Tools]
   ├── Jira (Issues)
   └── Trello (Cards)
```

### Key Features to Highlight:
1. ✅ AI-powered extraction (OpenAI GPT-3.5)
2. ✅ Fallback to rule-based (works without AI)
3. ✅ Real Jira & Trello integration
4. ✅ Bulk operations
5. ✅ Enterprise-ready (error handling)

### Demo Script:
1. Show meeting transcript input
2. Call extract API → show JSON output
3. Call create-all API → tasks appear in Jira & Trello
4. Open Jira/Trello → show created items
5. Explain architecture diagram

---

## Common Issues & Quick Fixes

### Server won't start:
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Use different port in .env
PORT=3000
```

### "Cannot find module":
```bash
npm install
```

### "OpenAI API error":
- It's OK! System will use rule-based extraction
- Or add OpenAI key to `.env`

### "Jira/Trello failed":
- Check credentials in `.env`
- Run: `GET /api/tasks/test-connections`
- See SETUP_GUIDE.md for help

---

## Testing for Demo

Use these simple tests:

**Test 1: Extract tasks**
```
POST http://localhost:5000/api/tasks/extract

{
  "transcriptText": "Sir will integrate Jira by tomorrow. Tushar will handle Trello sync.",
  "useAI": false
}
```

**Test 2: Create manual task**
```
POST http://localhost:5000/api/tasks/manual-create

{
  "task": "Demo task",
  "assignee": "Team",
  "target": "both"
}
```

---

## Resources

- **Full Setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **All API Endpoints**: [API_DOCS.md](API_DOCS.md)
- **Test Cases**: [TEST_CASES.md](TEST_CASES.md)
- **Complete Documentation**: [README.md](README.md)

---

## Need Help?

1. Check console logs for errors
2. Test connections: `GET /api/tasks/test-connections`
3. Verify `.env` file exists and has correct values
4. Check TEST_CASES.md for working examples

---

**Ready in 5 minutes! 🚀**

Good luck with your hackathon! 🎯
