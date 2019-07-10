const compat = require("next-aws-lambda")
const fs = require("fs")

exports.handler = (event, context, callback) => {
  const renderpath = "./pages" + (event.path === "/" ? "/index " : event.path)
  console.log("[render] ", renderpath)
  let page
  if (fs.existsSync(renderpath)) page = require("./pages/index")
  else page = require("./pages/_error")
  event.requestContext = {}
  compat(page)(event, context, callback)
}
