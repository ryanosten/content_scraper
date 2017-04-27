'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const json2csv = require('json2csv');
const async = require('async');

//function to make request to shirt pages
const getShirts = function(item, callback){
  //grab the list item href and make request to this path
  const url = `http://www.shirts4mike.com/${item.attribs.href}`;

  //make get request to shirt pages
  request(url, (err, res, body) => {
    //handle error
    if (err) {
      logError(err, `Couldn't connect to server`);
      return;
    }
    //handle bad response
    if (res.statusCode !== 200) {
      logError(res.statusCode, res.statusMessage);
      return;
    }
    //load parse body of response with cheerio
    const $ = cheerio.load(body, {
      ignoreWhitespace: true
    });

    //grab title, price, imageURL from page
    const Title = $('.shirt-picture span img').attr('alt');
    const Price = $('span.price').text();
    const ImageUrl = `http://shirts4mike.com/${$('.shirt-picture span img').attr('src')}`;
    //get date/time
    const date = new Date();
    const Time = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    //create object with shirt properties
    callback(null, {
      Title,
      Price,
      ImageUrl,
      URL: url,
      Time
    });
  });
};

//function to generate CSV
const csvMagic = function(shirtData){
  const shirtFields = ['title', 'price', 'image', 'URL'];
  const csv = json2csv({data: shirtData, field: shirtFields})
  const date = new Date();
  const current_date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;

  //if 'data' folder doesn't exist, create it
  if(!fs.existsSync('./data')){
    fs.mkdirSync('./data');
  }

  //create a csv file in 'data' folder
  fs.writeFile(`data/${current_date}.csv`, csv, function(err){
    if (err) throw err;
    console.log('file saved');
  })
}

//function for logging errors to console and logs/scraper-error.log
const logError = function(error, message){
  const time = new Date();
  console.error(`There's been an error. ${message} ${error}.`);
  fs.writeFile('logs/scraper-error.log', `${time.toUTCString()} | ${error} ${message}\n`, {flag: "a"}, (err) => {
    if (err){
      console.error(`There's been an error logging the file. ${err}`);
    }
  });
}

//make get request to http://www.shirts4mike.com/shirts.php entry point
request('http://www.shirts4mike.com/shirts.php', (err, res, body) => {
  //handle error
  if(err) {
    logError(err, `Couldn't connect to server`);
    return;
  }
  //handle bad response
  if(res.statusCode !== 200) {
    logError(res.statusCode, res.statusMessage);
    return;
  }
  //load cheerio for scraping html
  const $ = cheerio.load(body, {
    ignoreWhitespace: true
  });

  //store anchor elements
  const shirtAnchors = $('.products li a');

  //iterator over all shirt anchors, run getShirts on each anchor element, return results
  async.map(shirtAnchors, getShirts, function(err, results){
    //generate CSV
    csvMagic(results);
  });
});
