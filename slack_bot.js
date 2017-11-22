"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fetch = require('isomorphic-fetch')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// const TOKEN = 'Sal9TM62fHNoyGoS1zOAVZRl';
const TOKEN = '8cVJhp6TA0fU1gEsFawEussX';


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

let makeResponse = (info, queryParameter) => {
  let result = {
    response_type: "ephemeral",
    mrkdwn: true
  }
  result.text = `*Github User: @${info.login} ${info.name}*\n`
  if (!queryParameter) {
    result.text += `>Company: ${info.company}\n`
    result.text += `>Location: ${info.location}\n`
    result.text += `>Hireable: ${info.hireable}\n`
    result.text += `>Github Profile: ${info.html_url}\n`
  } else {
    result.text += `> ${queryParameter}: ${info[queryParameter]}`
  }
  return result
}


let fetchGitInfo = (username, res, queryParameter = null) => {
  fetch(`https://api.github.com/users/${username}`)
    .then( apiResponse => {
      if (apiResponse.status == 404) {
        let errMsg = { response_type: 'ephemeral' }
        errMsg.text = "Sorry, we could not find the user."
        res.status(404).send(errMsg)
        return
      } else {
        return apiResponse.json()
      }
    })
    .then( info => {
      let responseObject = makeResponse(info, queryParameter)
      res.send(responseObject)
      // console.log("---> info:", info);
      // if (queryParameter) {
      //   res.send(`The ${queryParameter} of ${username} is: *${info[queryParameter]}*`);
      // }
      // res.send(`Username: *${username}*.\nGithub-Url: ${info.html_url}\nLocation: ${info.location}\n:smile:`);
    })
    .catch( err => {
      // console.log("---> error in catch", err);
      let errMsg = { response_type: 'ephemeral' }
      // if (err.status == 404) {
      //   errMsg.text = "Sorry, we could not find the user."
      //   res.status(404).send(errMsg)
      // } else {
        const status = err.status ? err.status : 500
        errMsg.text = "Oops! Something went wrong. Please try again."
        res.status(status).send(errMsg)
      // }
    })
}

app.post('/', (req, res) => {
  // console.log("---> req.body:", req.body);
  let token = req.body.token
  if (token !== TOKEN) {
    res.status(400).send("Token not valid")
  } else if (!req.body.text) {
    let errMsg = {
      response_type: 'ephemeral',
      text: "Please specify a user."
    }
    res.status(400).send(errMsg)
  } else {
    let username = req.body.text.split(" ")[0]
    let queryParameter = req.body.text.split(" ")[1]

    fetchGitInfo(username, res, queryParameter)
  }

})



// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
