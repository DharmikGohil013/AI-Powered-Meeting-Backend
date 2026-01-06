# 🎯 Personal Configuration Guide - Multi-User System

## Overview

Now **each user can have their own Jira and Trello settings**! When you log in, you can:
- Set your personal Jira credentials
- Set your personal Trello credentials  
- Create tasks using YOUR accounts
- Keep your settings separate from other users

## ✨ What's New

### Personal Configurations
- ✅ Each user has their own Jira settings
- ✅ Each user has their own Trello settings
- ✅ Settings are private and secure
- ✅ Easy configuration via Settings page
- ✅ Automatic validation when you save

### How It Works
1. **Login** → You have your account
2. **Go to Settings** → Configure Jira/Trello
3. **Create Tasks** → Uses YOUR settings automatically
4. **Other Users** → They use THEIR settings

## 🚀 Quick Start

### 1. Access Settings
```
1. Login to your account
2. Go to: http://localhost:5000/settings.html
3. Or click "Settings" in dashboard
```

### 2. Configure Jira (Your Personal Account)
```
Fill in:
- Domain: mycompany.atlassian.net
- Email: your-email@company.com
- API Token: [Get from Atlassian]
- Project Key: MYPROJ

Click "Save Jira Config"
→ System tests connection automatically
→ Shows success message with your name
```

### 3. Configure Trello (Your Personal Account)
```
Fill in:
- API Key: [Get from Trello]
- API Token: [Get from Trello]
- Board ID: [From your board URL]
- List ID: (Optional)

Click "Save Trello Config"
→ System tests connection automatically
→ Shows success message with your name
```

### 4. Create Tasks
```
Now when you create tasks:
- Jira issues → Created in YOUR Jira project
- Trello cards → Created in YOUR Trello board
- Other users → See THEIR tasks in THEIR accounts
```

## 📚 API Endpoints

### Configuration Management

#### Get Config Status
```http
GET /api/auth/config/status
Authorization: Bearer <your-token>

Response:
{
  "success": true,
  "data": {
    "jira": {
      "configured": true,
      "isCustom": true,
      "domain": "mycompany.atlassian.net",
      "projectKey": "MYPROJ"
    },
    "trello": {
      "configured": true,
      "isCustom": true,
      "boardId": "abc123"
    }
  }
}
```

#### Save Jira Configuration
```http
POST /api/auth/config/jira
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "domain": "mycompany.atlassian.net",
  "email": "your-email@company.com",
  "apiToken": "your-jira-token",
  "projectKey": "MYPROJ"
}

Response:
{
  "success": true,
  "message": "Jira configuration updated successfully",
  "data": {
    "user": {...},
    "testResult": {
      "success": true,
      "user": "Your Name",
      "email": "your-email@company.com"
    }
  }
}
```

#### Save Trello Configuration
```http
POST /api/auth/config/trello
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "apiKey": "your-trello-api-key",
  "apiToken": "your-trello-token",
  "boardId": "board-id",
  "listId": "list-id" // optional
}

Response:
{
  "success": true,
  "message": "Trello configuration updated successfully",
  "data": {
    "user": {...},
    "testResult": {
      "success": true,
      "user": "Your Name",
      "username": "yourtrellousername"
    }
  }
}
```

#### Remove Jira Configuration
```http
DELETE /api/auth/config/jira
Authorization: Bearer <your-token>

Response:
{
  "success": true,
  "message": "Jira configuration removed",
  "data": { "user": {...} }
}
```

#### Remove Trello Configuration
```http
DELETE /api/auth/config/trello
Authorization: Bearer <your-token>

Response:
{
  "success": true,
  "message": "Trello configuration removed",
  "data": { "user": {...} }
}
```

## 🎯 How Tasks Use Your Settings

### When Creating Jira Issues:
```javascript
// If user is logged in:
POST /api/tasks/jira
Headers: { Authorization: "Bearer <token>" }
Body: { task: "Fix bug", priority: "High" }

→ System uses YOUR Jira settings
→ Issue created in YOUR project
→ Response includes your user info
```

### When Creating Trello Cards:
```javascript
// If user is logged in:
POST /api/tasks/trello
Headers: { Authorization: "Bearer <token>" }
Body: { task: "Design mockup", deadline: "tomorrow" }

→ System uses YOUR Trello settings
→ Card created in YOUR board
→ Response includes your user info
```

### Fallback Behavior:
```
If you're logged in but haven't configured Jira/Trello:
→ System uses default environment settings
→ Or returns error asking you to configure

If you're not logged in:
→ System uses default environment settings
```

## 🔐 Security & Privacy

### Your Settings Are:
- ✅ **Private** - Only you can see/edit them
- ✅ **Secure** - Stored with your account
- ✅ **Encrypted** - Passwords/tokens are hashed
- ✅ **Validated** - Tested before saving

### What's Stored:
```javascript
{
  jiraConfig: {
    domain: "mycompany.atlassian.net",
    email: "your-email@company.com",
    apiToken: "encrypted-token",
    projectKey: "PROJ"
  },
  trelloConfig: {
    apiKey: "your-api-key",
    apiToken: "encrypted-token",
    boardId: "board-id",
    listId: "list-id"
  }
}
```

### What's NOT Stored:
- ❌ Plaintext passwords
- ❌ Other users' settings
- ❌ Task content (only created in Jira/Trello)

## 👥 Multi-User Scenarios

### Scenario 1: Team Members
```
User A (John):
- Configured his personal Jira
- Creates task "Review code"
- → Created in John's Jira project

User B (Sarah):
- Configured her personal Jira
- Creates task "Write tests"
- → Created in Sarah's Jira project

Result: Each user's tasks go to their own project!
```

### Scenario 2: Different Trello Boards
```
User A: Marketing team
- Board: "Marketing Tasks"
- Creates card "Social media post"
- → Goes to Marketing board

User B: Development team
- Board: "Dev Sprint"
- Creates card "Fix login bug"
- → Goes to Dev board

Result: Each user's tasks go to their own board!
```

### Scenario 3: Guest Users
```
Guest (not logged in):
- Creates task
- → Uses default server settings
- → Limited features

Logged-in User:
- Creates task
- → Uses personal settings
- → Full features + tracking
```

## 🎨 Frontend Integration

### Check if User Has Config:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/auth/config/status', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await response.json();

if (!data.jira.configured) {
  // Show message: "Configure Jira in Settings"
  showConfigWarning('jira');
}

if (!data.trello.configured) {
  // Show message: "Configure Trello in Settings"
  showConfigWarning('trello');
}
```

### Display Config Status:
```html
<!-- Show in UI -->
<div class="config-status">
  <span class="badge">
    ✅ Jira: Connected to mycompany.atlassian.net
  </span>
  <span class="badge">
    ✅ Trello: Connected to Marketing Board
  </span>
  <a href="/settings.html">Change Settings</a>
</div>
```

### Handle Config Errors:
```javascript
const response = await fetch('/api/tasks/jira', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ task: 'New task' })
});

const data = await response.json();

if (!data.success && data.error === 'Jira configuration not set') {
  // Redirect to settings
  alert('Please configure your Jira settings first');
  window.location.href = '/settings.html';
}
```

## 📝 Getting Your Credentials

### Jira:
1. **Domain**: Your Jira URL
   - Example: `mycompany.atlassian.net`
   - Don't include `https://`

2. **Email**: Your Jira account email

3. **API Token**: Generate at
   - https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Copy and save it

4. **Project Key**: From your project
   - Open your Jira project
   - Key is shown next to project name
   - Example: "PROJ", "DEV", "MKTG"

### Trello:
1. **API Key**: Get at
   - https://trello.com/app-key
   - Copy "Key" value

2. **API Token**: From same page
   - Click "Token" link
   - Authorize and copy token

3. **Board ID**: From board URL
   - Open your Trello board
   - URL: `trello.com/b/[BOARD_ID]/board-name`
   - Copy the BOARD_ID part

4. **List ID** (Optional):
   - Open board
   - Click on a list
   - Add `.json` to URL
   - Find `"id"` in JSON

## 🧪 Testing Your Configuration

### Test Jira:
```bash
# When you save config, system automatically:
1. Connects to your Jira
2. Verifies credentials
3. Gets your user info
4. Shows confirmation: "Connected as: Your Name"
```

### Test Trello:
```bash
# When you save config, system automatically:
1. Connects to your Trello
2. Verifies credentials
3. Gets your user info
4. Shows confirmation: "Connected as: Your Name"
```

### Create Test Task:
```bash
# After configuring:
1. Go to dashboard
2. Extract tasks from sample text
3. Create in Jira/Trello
4. Check YOUR Jira/Trello account
5. Task should appear there!
```

## ❓ FAQ

**Q: Can other users see my Jira/Trello settings?**  
A: No! Your settings are private and secure.

**Q: What if I don't configure Jira/Trello?**  
A: System will use default server settings (if available) or ask you to configure.

**Q: Can I change my settings later?**  
A: Yes! Go to Settings and update anytime.

**Q: What if my credentials are wrong?**  
A: System tests them when you save and shows error if invalid.

**Q: Can I use different Jira projects?**  
A: Yes! Just change your Project Key in Settings.

**Q: Does this work offline?**  
A: No, requires internet to connect to Jira/Trello.

**Q: Is this secure?**  
A: Yes! Credentials are stored securely with your account.

**Q: Can admin see my credentials?**  
A: No! Even admins can't see your API tokens.

## 🎉 Benefits

### For Users:
- ✅ Use your own accounts
- ✅ Keep tasks in your workspace
- ✅ No sharing credentials
- ✅ Independent from other users
- ✅ Easy to set up

### For Teams:
- ✅ Each member uses their account
- ✅ Tasks distributed properly
- ✅ Better security
- ✅ No conflicts
- ✅ Easy management

### For Developers:
- ✅ Clean API design
- ✅ User-specific data
- ✅ Easy to integrate
- ✅ Well documented
- ✅ Secure by default

---

**Ready to configure?** Visit: http://localhost:5000/settings.html 🚀
