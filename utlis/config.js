function getConfig(isPackageJsonModified) {
    const date = Date.now()
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 5;
    return {
        "Storage-App-Backend": [
            `cd /home/ubuntu/Storage-App-Backend`,
            `mkdir release_${date}`,
            `cd release_${date}`,
            "git clone https://github.com/DewashishTikas/Storage-App-Backend.git .",
            "npm ci",
            `ln -sfn "$(pwd)" /home/ubuntu/Storage-App-Backend/current`,
            'echo "Waiting for app to start..."',
            "pm2 reload myFileSpace",
            "sleep 5",
            `COUNT=1
while [ $COUNT -le ${MAX_RETRIES} ]; do
    echo "Health check attempt $COUNT..."
    if curl -f https://api.myfilespace.xyz/health; then
        echo "Deployment successful"
        exit 0
    fi
    echo "Health check failed. Retrying in ${RETRY_DELAY} seconds..."
    sleep ${RETRY_DELAY}
    COUNT=$((COUNT + 1))
done

echo "Health check failed after ${MAX_RETRIES} attempts"
echo "Rolling back..."

CURRENT=$(readlink current)
PREVIOUS=$(ls -dt release_* | grep -A1 "$CURRENT" | tail -n1)
ln -sfn $PREVIOUS current
pm2 reload myFileSpace

echo "Rollback complete"
`
        ],
        "Storage-App-Backend-Test": [
            `cd /home/ubuntu/Storage-App-Backend-Test`,
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "pm2 reload myFileSpace-test"
        ],
        "Storage-App-Frontend": [
            `cd /home/ubuntu/Storage-App-Frontend`,
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "npm run build",
            "aws s3 sync ./dist s3://myfilespace-frontend/production",
            'aws cloudfront create-invalidation   --distribution-id E2UFBMZJ9YXU5V   --paths "/index.html"'
        ],
        "Storage-App-Frontend-Test": [
            `cd /home/ubuntu/Storage-App-Frontend-Test`,
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "npm run build",
            "aws s3 sync ./dist s3://myfilespace-frontend/test",
            'aws cloudfront create-invalidation   --distribution-id E3SAXF3LV0LF04   --paths "/index.html"'
        ],
        "custom-CI-CD-Server": [
            `cd /home/ubuntu/custom-CI-CD-Server`,
            "git pull",
            isPackageJsonModified ? "npm ci" : "",
            "pm2 reload CI-CD-Server"
        ]
    }
}

// gives the list of commands to be executed 
export function getProjectCommands(projectName, isPackageJsonModified, test) {
    return getConfig(isPackageJsonModified)[`${projectName}${test ? "-Test" : ""}`] || null
}