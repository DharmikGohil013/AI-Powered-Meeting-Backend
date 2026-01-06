# Script to create a new Jira project

$jiraBaseUrl = "https://dharmikgohil395003.atlassian.net"
$jiraEmail = "dharmikgohil395003@gmail.com"
$jiraToken = "ATATT3xFfGF0bNAyiMB9pBhITRQ1bJHk8i_c5YB8yQpX0h7xbQnK0HQ8e-V9EaNhz67W7V8cxS-8T8kfpNXS0GKHiIDthzfqBWY7H5f39kxnCHzZZQhLh5O6wQsrnr8s22TKYSlR3o1ypKDp6TtJU1QXTAYqM_-TJ6SKG-6Y_0kH0hxUXZ0kO8I=BF0FF6B5"

$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${jiraEmail}:${jiraToken}"))
$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Content-Type" = "application/json"
}

$projectData = @{
    key = "HACK"
    name = "Hackathon Tasks"
    projectTypeKey = "software"
    projectTemplateKey = "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban"
    description = "Project for managing hackathon tasks"
    leadAccountId = ""
} | ConvertTo-Json

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Creating Jira Project..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

try {
    # First, get your account ID
    Write-Host "Getting your account ID..." -ForegroundColor Yellow
    $myself = Invoke-RestMethod -Uri "$jiraBaseUrl/rest/api/3/myself" -Method Get -Headers $headers
    Write-Host "Account ID: $($myself.accountId)" -ForegroundColor Green
    
    # Update project data with account ID
    $projectObj = @{
        key = "HACK"
        name = "Hackathon Tasks"
        projectTypeKey = "software"
        projectTemplateKey = "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban"
        description = "Project for managing hackathon tasks"
        leadAccountId = $myself.accountId
    } | ConvertTo-Json
    
    Write-Host "Creating project..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$jiraBaseUrl/rest/api/3/project" -Method Post -Headers $headers -Body $projectObj
    
    Write-Host ""
    Write-Host "SUCCESS! Project created:" -ForegroundColor Green
    Write-Host "Project Key: $($response.key)" -ForegroundColor Yellow -BackgroundColor DarkGreen
    Write-Host "Project ID:  $($response.id)" -ForegroundColor Gray
    Write-Host "Project URL: $($response.self)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Now update your .env file:" -ForegroundColor Yellow
    Write-Host "JIRA_PROJECT_KEY=$($response.key)" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Details: $($errorObj.errors)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Alternative: Create project manually at:" -ForegroundColor Yellow
    Write-Host "https://dharmikgohil395003.atlassian.net/jira/projects" -ForegroundColor Cyan
}
