# List the directories to copy from
$sources = @(
    "D:\School\Misc\spoilers\models\spoiler.js",
    "D:\School\Misc\spoilers\routes\spoiler.js",
    "D:\School\Misc\spoilers\test\spoilers.test.js"
)

# Initialize a variable to store the content for the clipboard
$clipboardContent = "these are all the files related to media :-`r`n`r`n"

# Print the initial message
Write-Host $clipboardContent

# Iterate through each file in the list of sources
$sources | ForEach-Object {
    # Print the file name
    $fileContent = "this is $($_):`r`n`r`n"
    #Write-Host $fileContent

    # Print the content of the file
    $fileContent += Get-Content -Path $_ -Raw
    Write-Host $fileContent

    # Add two new lines between files
    $fileContent += "`r`n`r`n"

    # Append the content to the clipboard variable
    $clipboardContent += $fileContent
}

# Copy the content to the clipboard
$clipboardContent | Set-Clipboard

# Print "done" to the console
Write-Host "`r`n`r`ndone"