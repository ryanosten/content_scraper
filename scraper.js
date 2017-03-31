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

    const Title = $('.shirt-picture span img').attr('alt');
    const Price = $('span.price').text();
    const ImageUrl = `http://shirts4mike.com/${$('.shirt-picture span img').attr('src')}`;

    const date = new Date();
    const Time = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    callback(null, {
      Title,
      Price,
      ImageUrl,
      URL: url,
      Time
    });
  });
};

const csvMagic = function(shirtData){
  const shirtFields = ['title', 'price', 'image', 'URL'];
  const csv = json2csv({data: shirtData, field: shirtFields})
  const date = new Date();
  const current_date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;

  if(!fs.existsSync('./data')){
    fs.mkdirSync('./data');
  }

  fs.writeFile(`data/${current_date}.csv`, csv, function(err){
    if (err) throw err;
    console.log('file saved');
  })
}

const logError = function(error, err){
  const time = new Date();
  fs.writeFile('logs/scraper-error.log', `${time.toUTCString()} | ${error} `, {flag: "a"}, (err) => {
    if (err){
      console.error(`There's been an ${err} error.`);
    } else {
      console.log('error logged to log file');
      console.error(new Error(`There's been a ${error} error. Cannot connect to http://www.shirts4mike.com/shirts.php`))
      process.exit();
    }
  });
}

request('http://www.shirts4mike.com/shirts.ph', (err, res, body) => {
  if (err) {
    console.error(new Error(`There's been an ${err} error. Cannot connect to http://www.shirts4mike.com/shirts.php`));
    logError(err, null);
  } else if (res.statusCode !== 200) {
    logError(res.statusCode, err);
  } else {

    const $ = cheerio.load(body, {
      ignoreWhitespace: true
    });

    const shirtAnchors = $('.products li a');

    async.map(shirtAnchors, getShirts, function(err, results){
      if(err){
        console.error(`The following error occured: ${err}`);
      } else {
        csvMagic(results);
      }
    });
  }
});
