## 🔑 Setup Guide - Getting Your API Keys

### 1. Jira Configuration

#### Get Jira API Token:
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **"Create API token"**
3. Give it a name (e.g., "Meeting Task Automation")
4. Copy the token
5. Paste in `.env` as `JIRA_API_TOKEN`

#### Get Jira Details:
- **JIRA_BASE_URL**: Your Jira URL (e.g., `https://yourcompany.atlassian.net`)
- **JIRA_EMAIL**: Your Jira account email
- **JIRA_PROJECT_KEY**: 
  - Go to your Jira project
  - Look at the URL or issue keys (e.g., `PROJ-123` → key is `PROJ`)

---

### 2. Trello Configuration

#### Get Trello API Key:
1. Go to: https://trello.com/power-ups/admin
2. Click **"New"** or select existing Power-Up
3. Copy your **API Key**
4. Paste in `.env` as `TRELLO_API_KEY`

#### Get Trello Token:
1. Use this URL (replace YOUR_API_KEY):
```
https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=Meeting%20Task%20Automation&key=YOUR_API_KEY
```
2. Click **"Allow"**
3. Copy the token
4. Paste in `.env` as `TRELLO_TOKEN`

#### Get Board ID & List ID:
1. Open your Trello board
2. Add `.json` to the URL:
   - Original: `https://trello.com/b/ABC123/board-name`
   - JSON: `https://trello.com/b/ABC123/board-name.json`
3. Find `"id"` (this is your Board ID)
4. Find `"lists"` array → copy the `"id"` of your target list

**OR** use the API endpoint after setup:
```
GET http://localhost:5000/api/tasks/trello/lists
```

---

### 3. OpenAI API Key (Optional)

#### Get OpenAI Key:
1. Go to: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Give it a name
4. Copy the key (starts with `sk-...`)
5. Paste in `.env` as `OPENAI_API_KEY`

**Note:** If not provided, system will use rule-based extraction (no AI).

---

### 4. Complete .env Example

```env
# Server
PORT=5000

# OpenAI (Optional - for AI extraction)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Jira
JIRA_BASE_URL=https://mycompany.atlassian.net
JIRA_EMAIL=user@example.com
JIRA_API_TOKEN=ATATT3xFfGF0xxxxxxxxxxxxx
JIRA_PROJECT_KEY=MEET

# Trello
TRELLO_API_KEY=a1b2c3d4e5f6g7h8i9j0
TRELLO_TOKEN=ATTA1234567890abcdef
TRELLO_BOARD_ID=5f8a7b6c5d4e3f2g1h0i
TRELLO_LIST_ID=5f8a7b6c5d4e3f2g1h0j
```

---

### 5. Verify Setup

Run this after starting the server:
```bash
curl http://localhost:5000/api/tasks/test-connections
```

Expected response:
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
    "username": "yourusername"
  },
  "overall": true
}
```

---

### Troubleshooting

#### Jira Issues:
- ❌ "Unauthorized" → Check email and API token
- ❌ "Project not found" → Verify project key is correct
- ❌ "No permission" → Ensure you have project access

#### Trello Issues:
- ❌ "Invalid key" → Regenerate API key
- ❌ "Invalid token" → Reauthorize with correct API key
- ❌ "Board not found" → Check board ID from JSON URL
- ❌ "List not found" → Use `/api/tasks/trello/lists` to get correct ID

#### OpenAI Issues:
- ❌ "Invalid API key" → Check key starts with `sk-`
- ❌ "Rate limit" → You may need to add credits to OpenAI account
- ✅ **System will auto-fallback to rule-based extraction**

---

### Security Best Practices

1. ✅ Never commit `.env` to Git (already in `.gitignore`)
2. ✅ Use different API tokens for development/production
3. ✅ Rotate API tokens regularly
4. ✅ Limit API token permissions to what's needed
5. ✅ Keep backup of working configuration

---

### Quick Start Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Get Jira API token
- [ ] Get Jira project key
- [ ] Get Trello API key & token
- [ ] Get Trello board & list IDs
- [ ] (Optional) Get OpenAI API key
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Test: `GET /api/tasks/test-connections`
- [ ] ✅ Ready to use!
