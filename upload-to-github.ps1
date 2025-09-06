# Script to upload the project to GitHub
$repoUrl = "https://github.com/moisesmissias/wjs5praiseshot.git"

Write-Host "Adding all files to Git..."
git add .

Write-Host "Committing changes..."
git commit -m "Initial commit: PraiseShot project upload"

Write-Host "Setting remote repository URL..."
git remote add origin $repoUrl
# In case the remote already exists, try setting the URL
git remote set-url origin $repoUrl

Write-Host "Pushing to GitHub..."
git push -u origin master

Write-Host "Done! Check your GitHub repository."
