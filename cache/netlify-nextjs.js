const compat = require("next-aws-lambda")

exports.handler = (event, context, callback) => {
  const page = require("./pages/index")
  console.log("[render] ", event.path)
  event.requestContext = {}
  compat(page)(event, context, callback)
}
