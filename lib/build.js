const hasYarn = require("has-yarn")
const execa = require("execa")
const cpy = require("cpy")
const fs = require("fs")
const path = require("path")
const cmd = hasYarn() ? "yarn" : "npm"
const conf = require("./config")
const chalk = require("chalk")
const NL = require("netlify-lambda/lib/build")

module.exports.run = async (arg) => {
  const config = conf.load()
  const functionsDir = config.build.functions || config.build.Functions
  const publish__Dir = config.build.publish || config.build.Publish
  const publish_next = path.join(publish__Dir, "_next")
  const nextjsConfig = require(path.join(process.cwd(), "next.config.js"))
  const distDir = nextjsConfig.distDir

  validateNextConfig(nextjsConfig, distDir, publish_next, publish__Dir) // will exit if invalid

  // // distDir: "public/_next",
  // target: "serverless"
  console.log({ arg })
  const { stdout } = await execa(cmd, ["next", "build"])
  console.log(stdout)
  // build complete
  const fnsfolder = "functions" // todo: grab this from netlify.toml
  if (!fs.existsSync(`${distDir}/serverless`)) {
    console.error(`folder ${distDir}/serverless doesnt exist, please investigate`)
    process.exit(1)
  }
  const cachepath = path.join(__dirname, "../cache")
  await cpy([`${distDir}/serverless/pages/*`], cachepath)
  console.log("Files copied!")
  console.log({ cachepath })
  console.log(fs.readdirSync(cachepath))
  await NL.run(cachepath)
  // await cpy([`${distDir}/serverless/pages/*`], fnsfolder)
  //
}

// simple assertions
function validateNextConfig(nextConfig, distDir, publish_next, publish__Dir) {
  if (nextConfig.target !== "serverless") {
    console.error(
      `next.config.js's 'target' field must be set to ${chalk.yellow("serverless")} for netlify-nextjs to be used.`
    )
    process.exit(1)
  }
  console.log({ distDir, publish_next })
  if (distDir !== publish_next) {
    console.error(
      `next.config.js's distDir is ${chalk.yellow(distDir)} but your netlify.toml publish folder is ${chalk.yellow(
        publish__Dir
      )}. distDir should point to a _next folder inside your publish folder.`
    )
    process.exit(1)
  }
}
