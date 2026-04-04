import express from "express";
import crypto from "crypto"
import { getProjectCommands } from "./utlis/config.js";
import { runPipeline } from "./utlis/pipeline.js";

const app = express();
const PORT = 3000;

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Check hogaya");
});
app.post("/webhook", async (req, res) => {
    if (!req.headers['x-hub-signature-256']) { return res.status(403).json({ error: "Invalid Signature" }); }
    const signature = "sha256=" + crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex')
    if (signature !== req.headers['x-hub-signature-256']) { return res.status(403).json({ error: "Invalid Signature" }); }
    res.sendStatus(200)
    const owner = "DewashishTikas";
    const repo = ["Storage-App-Frontend", "Storage-App-Backend"];
    const ref = "main"; // commit SHA, branch, or tag

    const url = `https://api.github.com/repos/${owner}/${repo[1]}/statuses/${ref}`;
    const res2 = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_ACCESS_Token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            state: "pending",
            target_url: "http://cicd.myfilespace.xyz/logs",
            description: "Pipeline started",
            context: "CI/CD Pipeline"
        })
    })
    const data = await res2.json()
    console.log(data);
    const isPackageJsonModified = req.body.commits.some(({ modified }) => modified.includes("package.json"))
    const commands = getProjectCommands(req.body.repository.name, isPackageJsonModified, req.body.ref.includes("develop")).filter((command) => command)
    let fullCommand = 'set -e\n';
    for (const command of commands) {
        console.log(command);
        fullCommand += `${command}\n`
    }
    try {
        await runPipeline({ project: `${req.body.repository.name}${req.body.ref.includes("develop") ? "-Test" : ""}`, command: fullCommand })
    } catch (err) {
        console.log(err);
    }
});

app.get("/logs", (req, res) => {
    res.json({ headers: req.headers, body: req.body })
})

app.get("/status", async (req, res) => {
    const owner = "DewashishTikas";
    const repo = ["Storage-App-Frontend", "Storage-App-Backend"];
    const ref = "main"; // commit SHA, branch, or tag

    const url = `https://api.github.com/repos/${owner}/${repo[1]}/statuses/${ref}`;
    await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_ACCESS_Token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            state: "pending",
            target_url: "http://localhost:3000/logs",
            description: "Pipeline started",
            context: "CI/CD Pipeline"
        })
    })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});