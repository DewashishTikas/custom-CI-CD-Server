function getConfig(isPackageJsonModified){
    return {
        "Storage-App-Backend": [
            "ls",
            "cd /home/ubuntu/Storage-App-Backend",
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "npm run test",
            "pm2 reload myFileSpace"
        ],
        "Storage-App-Frontend": [
            "cd /home/ubuntu/Storage-App-Frontend",
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "npm run test",
            "npm run build",
            "aws s3 sync ./dist s3://myfilespace-frontend",
            'aws cloudfront create-invalidation   --distribution-id E2UFBMZJ9YXU5V   --paths "/index.html"'
        ]
    }
}

// gives the list of commands to be executed 
export function getProjectCommands(projectName, isPackageJsonModified) {
    return getConfig(isPackageJsonModified)[projectName] || null
}