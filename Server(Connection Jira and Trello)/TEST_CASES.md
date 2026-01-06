## 🧪 Test Cases - Postman/Thunder Client

Import these into Postman or use with Thunder Client in VS Code.

---

### Test 1: Health Check
```http
GET http://localhost:5000/
```

---

### Test 2: Extract Tasks (AI)
```http
POST http://localhost:5000/api/tasks/extract
Content-Type: application/json

{
  "transcriptText": "In today's standup meeting: Sir will integrate Jira API by tomorrow. Tushar is responsible for handling the Trello sync by next week. The team must review the authentication module by Friday.",
  "useAI": true
}
```

---

### Test 3: Extract Tasks (Rule-Based)
```http
POST http://localhost:5000/api/tasks/extract
Content-Type: application/json

{
  "transcriptText": "Mike will fix the login bug. Sarah should deploy to staging tomorrow. The database migration needs to be done by next Monday.",
  "useAI": false
}
```

---

### Test 4: Create Single Jira Issue
```http
POST http://localhost:5000/api/tasks/jira
Content-Type: application/json

{
  "task": "Setup CI/CD pipeline",
  "assignee": "DevOps Team",
  "deadline": "2026-01-15",
  "priority": "High",
  "description": "Configure GitHub Actions for automated deployment"
}
```

---

### Test 5: Create Single Trello Card
```http
POST http://localhost:5000/api/tasks/trello
Content-Type: application/json

{
  "task": "Design landing page mockup",
  "assignee": "Design Team",
  "deadline": "Tomorrow",
  "priority": "Medium"
}
```

---

### Test 6: Create in Both (Manual)
```http
POST http://localhost:5000/api/tasks/manual-create
Content-Type: application/json

{
  "task": "Implement user authentication",
  "assignee": "Backend Developer",
  "deadline": "2026-01-12",
  "priority": "High",
  "description": "JWT-based authentication with refresh tokens",
  "target": "both"
}
```

---

### Test 7: Create Only in Jira
```http
POST http://localhost:5000/api/tasks/manual-create
Content-Type: application/json

{
  "task": "Code review for PR #123",
  "assignee": "Senior Dev",
  "deadline": "Today",
  "priority": "High",
  "target": "jira"
}
```

---

### Test 8: Create Only in Trello
```http
POST http://localhost:5000/api/tasks/manual-create
Content-Type: application/json

{
  "task": "Update documentation",
  "assignee": "Tech Writer",
  "deadline": "Next week",
  "priority": "Low",
  "target": "trello"
}
```

---

### Test 9: Extract & Auto-Create (Complete Flow)
```http
POST http://localhost:5000/api/tasks/create-all
Content-Type: application/json

{
  "transcriptText": "Project meeting summary: John will complete the API integration by Wednesday. Lisa should prepare the presentation slides by tomorrow. The team needs to test the staging environment by Friday.",
  "useAI": true,
  "target": "both"
}
```

---

### Test 10: Bulk Create Jira Issues
```http
POST http://localhost:5000/api/tasks/jira/bulk
Content-Type: application/json

{
  "tasks": [
    {
      "task": "Setup database schema",
      "assignee": "Backend Team",
      "deadline": "2026-01-10",
      "priority": "High"
    },
    {
      "task": "Create REST API endpoints",
      "assignee": "API Team",
      "deadline": "2026-01-12",
      "priority": "High"
    },
    {
      "task": "Write unit tests",
      "assignee": "QA Team",
      "deadline": "2026-01-15",
      "priority": "Medium"
    }
  ]
}
```

---

### Test 11: Bulk Create Trello Cards
```http
POST http://localhost:5000/api/tasks/trello/bulk
Content-Type: application/json

{
  "tasks": [
    {
      "task": "Research competitor features",
      "assignee": "Product Manager",
      "deadline": "Next week"
    },
    {
      "task": "User feedback analysis",
      "assignee": "UX Team",
      "deadline": "Tomorrow"
    }
  ]
}
```

---

### Test 12: Test Connections
```http
GET http://localhost:5000/api/tasks/test-connections
```

**Expected Success Response:**
```json
{
  "jira": {
    "success": true,
    "user": "Your Name",
    "email": "your@email.com"
  },
  "trello": {
    "success": true,
    "user": "Your Name",
    "username": "username"
  },
  "overall": true
}
```

---

### Test 13: Get Trello Lists
```http
GET http://localhost:5000/api/tasks/trello/lists
```

**Expected Response:**
```json
{
  "success": true,
  "lists": [
    {
      "id": "abc123",
      "name": "To Do"
    },
    {
      "id": "def456",
      "name": "In Progress"
    },
    {
      "id": "ghi789",
      "name": "Done"
    }
  ]
}
```

---

## 🎯 Test Scenarios for Hackathon Demo

### Scenario 1: Daily Standup
```json
{
  "transcriptText": "Daily standup 6th Jan: Alex will fix the payment gateway bug by EOD. Maria will deploy the new feature to production tomorrow. Team should review the security audit by next Monday.",
  "useAI": true,
  "target": "both"
}
```

### Scenario 2: Sprint Planning
```json
{
  "transcriptText": "Sprint planning meeting: Backend team must complete the API development by Jan 15. Frontend team will integrate the new UI by Jan 20. QA team should finish testing by Jan 22.",
  "useAI": true,
  "target": "both"
}
```

### Scenario 3: Bug Triage
```json
{
  "transcriptText": "Bug triage session: Critical bug #456 needs immediate attention from senior dev. Medium priority bug #789 should be fixed by next week. Low priority issues can wait until next sprint.",
  "useAI": true,
  "target": "jira"
}
```

---

## 📊 Expected Results

### Successful Task Extraction:
- Properly identified task titles
- Correct assignee extraction
- Accurate deadline parsing
- Appropriate priority assignment

### Successful Jira Creation:
- Issue created in Jira
- Issue key returned (e.g., PROJ-123)
- Issue URL provided
- All fields properly populated

### Successful Trello Creation:
- Card created in specified list
- Priority label added
- Due date set correctly
- Card URL returned

---

## ⚠️ Error Test Cases

### Test with Empty Transcript:
```http
POST http://localhost:5000/api/tasks/extract
Content-Type: application/json

{
  "transcriptText": "",
  "useAI": true
}
```

**Expected:** 400 error with message

---

### Test with Missing Task Field:
```http
POST http://localhost:5000/api/tasks/jira
Content-Type: application/json

{
  "assignee": "Someone"
}
```

**Expected:** 400 error "Task title is required"

---

### Test with Invalid Target:
```http
POST http://localhost:5000/api/tasks/manual-create
Content-Type: application/json

{
  "task": "Test task",
  "target": "invalid"
}
```

**Expected:** Should still work (defaults to "both")

---

## 🔍 Verification Checklist

After each test:
- [ ] Check server console logs
- [ ] Verify response status code
- [ ] Check response JSON structure
- [ ] Verify Jira issue created (check Jira UI)
- [ ] Verify Trello card created (check Trello board)
- [ ] Confirm URLs in response are accessible

---

## 💡 Tips for Testing

1. **Start Simple:** Test connection endpoint first
2. **Use Small Data:** Start with 1-2 tasks, then scale up
3. **Check Both Platforms:** Verify in actual Jira/Trello UI
4. **Test Fallback:** Try with and without OpenAI key
5. **Error Cases:** Test invalid inputs to verify error handling
6. **Performance:** Note response times for bulk operations

---

## 📝 Testing Notes Template

Use this format to document your tests:

```
Test: [Test Name]
Date: [Date/Time]
Input: [Request payload]
Expected: [Expected result]
Actual: [Actual result]
Status: ✅ Pass / ❌ Fail
Notes: [Any observations]
```
