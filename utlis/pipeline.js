import { spawn } from 'child_process'

export function runPipeline({ project, command }) {
   return new Promise((resolve, reject) => {
      const bashChildProcess = spawn("bash", ["-c", command],{
         cwd: `/home/ubuntu/${project}`
      })
      bashChildProcess.stdout.on('data', (data) => {
         process.stdout.write(data)
         resolve({ project,data : data.toString() })
      })
      bashChildProcess.stderr.on('data', (data) => {
         process.stderr.write(data)
         reject({ project, data: data.toString() })
      })
      bashChildProcess.on("error", (err) => {
         console.log(err);
         reject({ project, err: err.toString() })
      })
      bashChildProcess.on("exit", async (code, signal, err) => {
         if (code === 0) {
            console.log(`Script Ended with Code ${code}`)
            resolve({ project, code, signal, err })
         } else {
            console.log('Script failed ', code);
            console.log(signal);
            console.log(err);
            reject({ project, code, signal, err })
         }
      })
   })
}