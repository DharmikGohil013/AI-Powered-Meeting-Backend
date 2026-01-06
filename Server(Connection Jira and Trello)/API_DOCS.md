## 📖 API Documentation - Quick Reference

### Base URL
```
http://localhost:5000
```

---

## Endpoints

### 1. Extract Tasks
**Endpoint:** `POST /api/tasks/extract`

**Description:** Extract tasks from meeting transcript using AI or rule-based logic

**Request Body:**
```json
{
  "transcriptText": "Meeting text here...",
  "useAI": true
}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "tasks": [
    {
      "task": "Task description",
      "assignee": "Name",
      "deadline": "Tomorrow",
      "priority": "Medium"
    }
  ]
}
```

---

### 2. Create in Jira
**Endpoint:** `POST /api/tasks/jira`

**Request Body:**
```json
{
  "task": "Task title",
  "assignee": "Person name",
  "deadline": "2026-01-10",
  "priority": "High",
  "description": "Optional description"
}
```

---

### 3. Create in Trello
**Endpoint:** `POST /api/tasks/trello`

**Request Body:**
```json
{
  "task": "Task title",
  "assignee": "Person name",
  "deadline": "Tomorrow",
  "priority": "High"
}
```

---

### 4. Manual Create (Jira + Trello)
**Endpoint:** `POST /api/tasks/manual-create`

**Request Body:**
```json
{
  "task": "Task title",
  "assignee": "Person",
  "deadline": "2026-01-15",
  "priority": "High",
  "target": "both"
}
```

**target options:**
- `"both"` - Create in Jira & Trello
- `"jira"` - Only Jira
- `"trello"` - Only Trello

---

### 5. Extract & Auto-Create
**Endpoint:** `POST /api/tasks/create-all`

**Description:** Complete flow - extract and create in both platforms

**Request Body:**
```json
{
  "transcriptText": "Meeting notes...",
  "useAI": true,
  "target": "both"
}
```

---

### 6. Test Connections
**Endpoint:** `GET /api/tasks/test-connections`

**Description:** Check if Jira and Trello are configured correctly

---

### 7. Get Trello Lists
**Endpoint:** `GET /api/tasks/trello/lists`

**Description:** Get all lists from your Trello board to find list IDs

---

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| task | string | Yes | Task title/description |
| assignee | string | No | Person assigned to task |
| deadline | string | No | Deadline (natural language or date) |
| priority | string | No | High/Medium/Low |
| description | string | No | Detailed description |
| transcriptText | string | Yes* | Meeting transcript text |
| useAI | boolean | No | Use AI extraction (default: true) |
| target | string | No | "both"/"jira"/"trello" |

---

## Date Formats

Supported deadline formats:
- `"Today"`
- `"Tomorrow"`
- `"Next week"`
- `"2026-01-15"` (YYYY-MM-DD)
- Any standard date format

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Task title is required",
  "field": "task"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## cURL Examples

### Extract tasks:
```bash
curl -X POST http://localhost:5000/api/tasks/extract \
  -H "Content-Type: application/json" \
  -d "{\"transcriptText\":\"John will fix bug by tomorrow\",\"useAI\":true}"
```

### Create manual task:
```bash
curl -X POST http://localhost:5000/api/tasks/manual-create \
  -H "Content-Type: application/json" \
  -d "{\"task\":\"Fix login\",\"assignee\":\"Dev Team\",\"target\":\"both\"}"
```

### Test connections:
```bash
curl http://localhost:5000/api/tasks/test-connections
```
