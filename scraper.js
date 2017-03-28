'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const json2csv = require('json2csv');
const async = require('async');

const shirtsObj = [];

const getShirts = function(item){
  //grab the list item href and make request to this path
  const url = `http://www.shirts4mike.com/${item.attribs.href}`;

  request(url, (err, res, body) => {
    if (err) {
      console.error(new Error(err));
      process.exit(1);
    }

    if (res.statusCode !== 200) {
      console.error(new Error(`Received code: ${res.statusCode}`));
      process.exit(2);
    }

    const $ = cheerio.load(body, {
      ignoreWhitespace: true
    });

    const title = $('.shirt-picture span img').attr('alt');
    const price = $('span.price').text();
    const image = `http://shirts4mike.com/${$('.shirt-picture span img').attr('src')}`;

    shirtsObj.push({
      title,
      price,
      image,
      URL: url
    });
  });
};

if(!fs.existsSync('./data')){
  fs.mkdirSync('./data');
}

request('http://www.shirts4mike.com/shirts.php', (err, res, body) => {
  if (err) {
    console.error(new Error(err));
    process.exit(1);
  }

  if (res.statusCode !== 200) {
    console.error(new Error(`Received code: ${res.statusCode}`));
    process.exit(2);
  }

  const $ = cheerio.load(body, {
    ignoreWhitespace: true
  });

  const shirtAnchors = $('.products li a');

  async.each(shirtAnchors, function(item, callback){
    getShirts(item);
  }, function(err){
      if(err){
      console.log('theres an error');
      } else {
        console.log('theres no error');
      }
  });
});
