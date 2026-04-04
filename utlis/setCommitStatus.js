export async function setCommitStatus({ status, owner, repo, ref, description }) {
    const url = `https://api.github.com/repos/${owner}/${repo}/statuses/${ref}`;
    const res2 = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            state: status,
            target_url: "http://cicd.myfilespace.xyz/logs",
            description: description,
            context: "CI/CD Pipeline"
        })
    })
    const object = await res2.json()
    console.log({object});
    console.log('running commit status', status);
}