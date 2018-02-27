"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const TOKEN = 'akQOqJmbSNvcYnALX3frMNp8';

app.use(bodyParser.urlencoded({ extended: true }));

const validateToken = (token) => {
  return TOKEN === token;
};

const getUser = (username) => {
  const url = 'https://api.github.com/users/' + username;
  return rp({
    uri: url,
    headers: {
      'User-Agent': 'wbdana'
    }
  });
};

// Just an example request to get you started..
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {
  if (!validateToken(req.body.token)) {
    res.status(400).end('Bad Request');
  };
});

app.post('/:username', (req, res) => {
  if (!validateToken(req.body.token)) {
    res.status(400).end('Bad Request');
  };

  console.log("req.body", req.body);

  const username = req.body.text.split(' ')[0];
  var githubResponse;
  console.log("username:", username);
  getUser(username)
    .then((resp) => { 
      githubResponse = JSON.parse(resp);
    })
    .then(() => {
      res.end(`Name: ${githubResponse.name}; Link: ${githubResponse.url}`)
    });
});

// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
