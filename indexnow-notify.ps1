param(
  [Parameter(Mandatory = $true)]
  [string]$Domain,

  [Parameter(Mandatory = $true)]
  [string]$Key,

  [string[]]$Urls = @("/", "/about.html")
)
$body = @{
  host       = $Domain
  key        = $Key
  keyLocation = "https://$Domain/$Key.txt"
  urlList    = $Urls | ForEach-Object { "https://$Domain$_" }
} | ConvertTo-Json -Depth 3

Write-Host "Отправка IndexNow для $Domain ..." -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri "https://api.indexnow.org/IndexNow" -ContentType "application/json; charset=utf-8" -Body $body -HttpVersion 2.0
Write-Host "Готово." -ForegroundColor Green