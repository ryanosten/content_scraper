'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const json2csv = require('json2csv');
const async = require('async');

const getShirts = function(item, callback){
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

    callback(null, {
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

  async.map(shirtAnchors, getShirts, function(err, results){
    if(err){
      console.log('error occured');
    } else {
      csvMagic(results);
    }
  });
});


var csvMagic = function(shirtData){
  const shirtFields = ['title', 'price', 'image', 'URL'];
  const csv = json2csv({data: shirtData, field: shirtFields})

  fs.writeFile('data/data.csv', csv, function(err){
    if (err) throw err;
    console.log('file saved');
  })
}
