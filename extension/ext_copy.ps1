# Get the current script's path
$scriptPath = $MyInvocation.MyCommand.Path

# Get the directory of the current script
$directoryPath = [System.IO.Path]::GetDirectoryName($scriptPath)

# Get the directory name
$folderName = (Get-Item -Path $directoryPath).Name

# Initialize a variable to store the content for the clipboard
$clipboardContent = "these are all the files in $folderName :-`r`n`r`n"

# Print the initial message
Write-Host $clipboardContent

# Iterate through each file in the script's directory
Get-ChildItem -Path $directoryPath -File | ForEach-Object {
    # Skip the current script file
    if ($_.FullName -ne $scriptPath) {
        # Print the file name
        $fileContent = "this is $($_.Name):`r`n`r`n"
        Write-Host $fileContent

        # Print the content of the file
        $fileContent += Get-Content -Path $_.FullName -Raw
        Write-Host $fileContent

        # Add two new lines between files
        $fileContent += "`r`n`r`n"

        # Append the content to the clipboard variable
        $clipboardContent += $fileContent
    }
}

# Copy the content to the clipboard
$clipboardContent | Set-Clipboard
