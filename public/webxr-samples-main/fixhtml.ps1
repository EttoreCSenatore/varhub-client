# Script to fix HTML accessibility issues
# 1. Remove user-scalable=no from viewport meta tags
# 2. Add lang="en" attribute to html tags

$files = Get-ChildItem -Path . -Filter "*.html" -Recurse

foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)"
    $content = Get-Content -Path $file.FullName -Raw
    
    # Fix 1: Remove user-scalable=no from viewport meta tags
    $content = $content -replace "content='width=device-width, initial-scale=1, user-scalable=no'", "content='width=device-width, initial-scale=1'"
    
    # Fix 2: Add lang attribute to html tag if missing
    $content = $content -replace "<html>", "<html lang=`"en`">"
    
    # Write changes back to file
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Fixed $($file.Name)"
}

Write-Host "All HTML files fixed successfully!" 