"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//added: makes available use of req.body
app.use(express.json());// to support JSON-encoded bodies
app.use(express.urlencoded());// to support URL-encoded bodies

const fetch = function(url){//to mimic fetch instead of request-promise
  return rp({
    uri: url,
    headers: {
        'User-Agent': 'Flatiron-Slackbot-Lab'
    }
  })
}

function selectData(apiResponse, status, id) {
  if(status){
    return {text: apiResponse.error.split('"')[3]};
  } else{
    return id.length > 0 ? {text: apiResponse.html_url + `/${apiResponse.id}`} : {text: apiResponse.html_url};
  }
}

const TOKEN = 'vIORtylsXi9M7ZGoNDzZK6ln';//added

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {
  let incomingToken = req.body.token
  if(incomingToken !== '8cVJhp6TA0fU1gEsFawEussX' || !req.body.text){//need to implement TOKEN
    res.status(400).send({text: 'Please specify a user to git'});
  } else{

    let text = req.body.text.split(' ');
    let username = text[0] || text;
    let id = text[1] || false;
    let url = 'https://api.github.com/users/' + username;
    let dataToSend;

    fetch(url).then(resp => {
      dataToSend = selectData(JSON.parse(resp), false, id);
      console.log(dataToSend);
      res.send(dataToSend);
    }).catch(err => {
      // console.log(err.statusCode)
      // console.log(err.error)
      dataToSend = selectData(err, true, false);
      res.status(err.statusCode).send(dataToSend);
    })
  }
});

// exports function 'listen` to be used to start server on specified port
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
