const hasYarn = require("has-yarn")
const execa = require("execa")
const cpy = require("cpy")
const fs = require("fs")
const path = require("path")
const cmd = hasYarn() ? "yarn" : "npm"
;(async () => {
  const { stdout } = await execa(cmd, ["build"])
  console.log(stdout)
  // build complete
  const nextConfig = require(path.join(process.cwd(), "next.config.js"))
  let distDir = nextConfig.distDir || ".next/static"
  const fnsfolder = "functions" // todo: grab this from netlify.toml
  if (!fs.existsSync(`${distDir}/serverless`)) {
    console.error(`folder ${distDir}/serverless doesnt exist, please investigate`)
    process.exit(1)
  }
  await cpy([`${distDir}/serverless/pages/*`], fnsfolder)
  console.log("Files copied!")
  //
})()
