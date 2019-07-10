const hasYarn = require("has-yarn")
const execa = require("execa")
const cpy = require("cpy")
const fs = require("fs")
const path = require("path")
const cmd = hasYarn() ? "yarn" : "npm"
const conf = require("./config")
const chalk = require("chalk")
// const NL = require("netlify-lambda/lib/build")

module.exports.run = async (arg) => {
  const config = conf.load()
  const functionsDir = config.build.functions || config.build.Functions
  if (!functionsDir) {
    console.error("functionsDir is falsy")
    process.exit(1)
  }
  const publish__Dir = config.build.publish || config.build.Publish
  const publish_next = path.join(publish__Dir, "_next")
  const nextjsConfig = require(path.join(process.cwd(), "next.config.js"))
  const distDir = nextjsConfig.distDir

  validateNextConfig(nextjsConfig, distDir, publish_next, publish__Dir) // will exit if invalid

  const { stdout } = await execa(cmd, ["next", "build"])

  /**
   * check that the build worked as expected
   */
  if (!fs.existsSync(`${distDir}/serverless`)) {
    console.error(`folder ${distDir}/serverless doesnt exist, please investigate`)
    process.exit(1)
  }

  /**
   * start to copy over stuff
   */
  const outFolder = path.join(functionsDir, "/netlify-nextjs")
  const outFolderPages = path.join(outFolder, "/pages")
  fs.mkdirSync(outFolderPages, { recursive: true })

  await cpy([`${distDir}/serverless/pages/*`], outFolderPages)
  await cpy(["node_modules/netlify-nextjs/cache"], outFolder)

  // /**
  //  * odl code
  //  */
  // const cachepath = path.join(__dirname, "../cache/pages")
  // await cpy([`${distDir}/serverless/pages/*`], cachepath)
  // console.log("Files copied!")
  // console.log({ cachepath })
  // console.log(fs.readdirSync(cachepath))
  // await NL.run("node_modules/netlify-nextjs/cache")
  // // await cpy([`${distDir}/serverless/pages/*`], fnsfolder)
  // //
}

// simple assertions
function validateNextConfig(nextConfig, distDir, publish_next, publish__Dir) {
  if (nextConfig.target !== "serverless") {
    console.error(
      `next.config.js's 'target' field must be set to ${chalk.yellow("serverless")} for netlify-nextjs to be used.`
    )
    process.exit(1)
  }
  if (distDir !== publish_next) {
    console.error(
      `next.config.js's distDir is ${chalk.yellow(distDir)} but your netlify.toml publish folder is ${chalk.yellow(
        publish__Dir
      )}. distDir should point to ${chalk.pink(publish__Dir + "/_next")}.`
    )
    process.exit(1)
  }
}
