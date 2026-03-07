function getConfig(isPackageJsonModified) {
    return {
        "Storage-App-Backend": [
            `mkdir release_${Date.now()}`,
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "pm2 reload myFileSpace"
        ],
        "Storage-App-Backend-Test": [
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "pm2 reload myFileSpace-test"
        ],
        "Storage-App-Frontend": [
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "npm run build",
            "aws s3 sync ./dist s3://myfilespace-frontend/production",
            'aws cloudfront create-invalidation   --distribution-id E2UFBMZJ9YXU5V   --paths "/index.html"'
        ],
        "Storage-App-Frontend-Test": [
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "npm run build",
            "aws s3 sync ./dist s3://myfilespace-frontend/test",
            'aws cloudfront create-invalidation   --distribution-id E3SAXF3LV0LF04   --paths "/index.html"'
        ],
         "custom-CI-CD-Server": [
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "pm2 reload CI-CD-Server"
        ]
    }
}

// gives the list of commands to be executed 
export function getProjectCommands(projectName, isPackageJsonModified,test) {
    return getConfig(isPackageJsonModified)[`${projectName}${test ? "-Test" : ""}`] || null
}