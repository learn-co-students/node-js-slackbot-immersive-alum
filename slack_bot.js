"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: true }))
//
//
// app.use(bodyParser.json({ type: 'application/*+json' }))
//
// // parse some custom thing into a Buffer
// app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
//
// // parse an HTML body into a string
// app.use(bodyParser.text({ type: 'text/html' }))

const TOKEN = process.env.TOKEN

// Just an example request to get you started..
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const fetchGitHubUser = (username) => {
  const options = {
    uri: `https://api.github.com/users/${username}`,
    headers: {
        'User-Agent': 'Flatiron-Slackbot-Lab'
    },
    json: true
};

  return rp(options)
}

const prepareSlackResponse = (response, requestedInfo) => {

  let text = `Username: ${response.login}\nURL: ${response.url}`
  requestedInfo.forEach(req => {
    if (response[req]) {
      text += `\n${req}: ${response[req]}`
    }
  })
  return { text }
}

const checkToken = (token) => {
  return token === TOKEN
}

app.post('/', (request, response) => {

  const token = request.body.token

  response.setHeader("Content-Type", "application/json; charset=utf-8")

  if (!checkToken(token)) {
    response.sendStatus(400)
  }

  if (!request.body.text) {
    response.send({
      text: "Please enter a username and try again"
    })
    return
  }

  let requestedInfo = request.body.text.split(' ')

  const username = requestedInfo.shift()

  fetchGitHubUser(username)
    .then(response => prepareSlackResponse(response, requestedInfo))
    .then(slackResponse => response.send(slackResponse))
    .catch(error => response.send({text: "Unable to find that user. Please enter a valid username and try again."}))
})

// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};

// fetchGitHubUser('jaredianmills')

// const args = process.argv.slice(2)
//
// console.log(args);
