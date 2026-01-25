# Script to kill process on port 3001
$port = 3001
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $processes) {
        if ($processId -gt 0) {
            Write-Host "Killing process $processId on port $port"
            taskkill /PID $processId /F 2>&1 | Out-Null
        }
    }
    Write-Host "Port $port should now be free"
} else {
    Write-Host "No process found on port $port"
}
