'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const http = require('http');
const request = require('request');
const json2csv = require('json2csv');

const shirtsObj = [];

function getShirts(URL){
  //grab the list item href and make request to this path
  const requestURL = `http://www.shirts4mike.com/${URL.attr('href')}`;

  const req = http.get(requestURL, response => {
    console.log(response.statusCode);

    let body = "";
    //read data
    response.on('data', data => {
      body += data.toString();
    });

    response.on('end', () => {
      console.log('shirt page response end');
      const $ = cheerio.load(body, {
        ignoreWhitespace: true
      });

      const title = $('.shirt-picture span img').attr('alt');
      const price = $('span.price').text();
      const imageURL = `http://shirts4mike.com/${$('.shirt-picture span img').attr('src')}`;

      const shirt = {
        "title": title,
        "price": price,
        "image": imageURL,
        "URL": requestURL
      }
      shirtsObj.push(shirt);
      console.log(shirtsObj);
    });
  });
};

/*
1. create scraper.js with command line app
  a.check for a folder called 'data', if not exist then create one, if exists do nothing
  */

if(!fs.existsSync('data')){
  fs.mkdirSync('data');
} else {
  console.log('data folder already exists');
}

const req = http.get('http://www.shirts4mike.com/shirts.php', response => {
  console.log(response.statusCode);

  let body = "";
  //read the data
  response.on('data', data => {
    body += data.toString();
  });

  response.on('end', () => {
    console.log('shirts.php response end');
    const $ = cheerio.load(body, {
      ignoreWhitespace: true
  });

    $('.products li a').each(function(){
      console.log($(this).attr('href'));
      getShirts($(this));
    });
  });
});
