# Script to find your Jira projects and their keys

$jiraBaseUrl = "https://dharmikgohil395003.atlassian.net"
$jiraEmail = "dharmikgohil395003@gmail.com"
$jiraToken = "ATATT3xFfGF0bNAyiMB9pBhITRQ1bJHk8i_c5YB8yQpX0h7xbQnK0HQ8e-V9EaNhz67W7V8cxS-8T8kfpNXS0GKHiIDthzfqBWY7H5f39kxnCHzZZQhLh5O6wQsrnr8s22TKYSlR3o1ypKDp6TtJU1QXTAYqM_-TJ6SKG-6Y_0kH0hxUXZ0kO8I=BF0FF6B5"

# Create authentication header
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${jiraEmail}:${jiraToken}"))
$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Content-Type" = "application/json"
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Fetching Your Jira Projects..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$jiraBaseUrl/rest/api/3/project" -Method Get -Headers $headers
    
    Write-Host "Found $($response.Count) projects:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($project in $response) {
        Write-Host "Project Name: $($project.name)" -ForegroundColor White
        Write-Host "Project Key:  $($project.key)" -ForegroundColor Yellow -BackgroundColor DarkGreen
        Write-Host "Project ID:   $($project.id)" -ForegroundColor Gray
        Write-Host "-----------------------------------" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "Copy the Project Key and update .env file" -ForegroundColor Yellow
    Write-Host "Change: JIRA_PROJECT_KEY=PROJ" -ForegroundColor Red
    Write-Host "To:     JIRA_PROJECT_KEY=YOUR_KEY" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
