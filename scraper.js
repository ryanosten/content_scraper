'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const http = require('http');
const request = require('request');
const json2csv = require('json2csv');

/*
1. create scraper.js with command line app
  a.check for a folder called 'data', if not exist then create one, if exists do nothing
  */

if(!fs.existsSync('data')){
  fs.mkdirSync('data');
} else {
  console.log('data folder already exists');
}

//create an array to store all of the shirt objects
var shirtsObj = [];
//b. should visit shirts4mike.com and uses /shirt.php as entry point to scrape information for 8 tee-shirts
//Do not use hard coded URL like /shirts.php?id=101
request('http://shirts4mike.com/shirt.php', function(error, response, html){
  if(!error && response.statusCode == 200){
    const $ = cheerio.load(html, {
      ignoreWhitespace: true
    });
    const shirtObj = [];
    //loop through unrdered list with class ".products", get list items and get <a href> value for each
    $('.products li a').each(function(){
      //grab the list item href and make request to this path
      const requestURL = `http://shirts4mike.com/${$(this).attr('href')}`
      request(requestURL, function(error, response, html){
        const $ = cheerio.load(html, {
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
      })
    })
    console.log(shirtsObj);
  }
})
