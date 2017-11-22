const server = require('./slack_bot')

server.listen(3000, () => {
  console.log("server is up and listening on http://localhost:3000");
})
