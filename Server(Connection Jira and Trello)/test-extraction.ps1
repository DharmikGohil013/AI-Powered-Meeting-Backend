# Test Script for Task Extraction
# Run this to test the extract tasks endpoint

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Task Extraction" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Read the test transcript
$transcript = Get-Content -Path ".\test-transcript.txt" -Raw

# Prepare the request body
$body = @{
    transcript = $transcript
} | ConvertTo-Json

# Make the API request
Write-Host "Sending request to extract tasks..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/extract" `
                                  -Method Post `
                                  -Body $body `
                                  -ContentType "application/json"
    
    Write-Host "✅ SUCCESS! Tasks extracted:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Method Used: $($response.method)" -ForegroundColor Magenta
    Write-Host "Number of Tasks: $($response.tasks.Count)" -ForegroundColor Magenta
    Write-Host ""
    
    # Display each task
    $taskNumber = 1
    foreach ($task in $response.tasks) {
        Write-Host "Task #$taskNumber" -ForegroundColor White -BackgroundColor DarkBlue
        Write-Host "  Title: $($task.title)" -ForegroundColor White
        Write-Host "  Description: $($task.description)" -ForegroundColor Gray
        Write-Host "  Assignee: $($task.assignee)" -ForegroundColor Yellow
        Write-Host "  Deadline: $($task.deadline)" -ForegroundColor Cyan
        Write-Host "  Priority: $($task.priority)" -ForegroundColor $(if($task.priority -eq "High") {"Red"} elseif($task.priority -eq "Medium") {"Yellow"} else {"Green"})
        Write-Host ""
        $taskNumber++
    }
    
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Test completed successfully! ✅" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the server is running: npm start" -ForegroundColor Yellow
}
