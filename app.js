import express from "express";
import crypto from "crypto"
import { getProjectCommands } from "./utlis/config.js";
import { runPipeline } from "./utlis/pipeline.js";

const app = express();
const PORT = 3000;

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Hello World 🚀");
});
app.post("/webhook", async (req, res) => {
    if (!req.headers['x-hub-signature-256']) { return res.status(403).json({ error: "Invalid Signature" }); }
    console.log(req.body);
    const signature = "sha256=" + crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex')
    if (signature !== req.headers['x-hub-signature-256']) { return res.status(403).json({ error: "Invalid Signature" }); }
    res.sendStatus(200)
    const isPackageJsonModified = req.body.commits.some(({ modified }) => modified.includes("package.json"))
    const commands = getProjectCommands(req.body.repository.name, isPackageJsonModified).filter((command) => command)
    for (const command of commands) {
        try {
            await runPipeline({ project: req.body.repository.name, command })
        } catch (err) {
            console.log(err);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});