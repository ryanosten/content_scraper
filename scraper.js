'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const json2csv = require('json2csv');

const shirtsObj = [];

function getShirts(anchor){
  //grab the list item href and make request to this path
  const url = `http://www.shirts4mike.com/${anchor.attr('href')}`;

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
    //console.log(shirtsObj)
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

  //const anchors = $('.products li a')

  $('.products li a').each(function(){
    //console.log($(this).attr('href'));
    getShirts($(this));
  });
  console.log(shirtsObj);
});

/*'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const http = require('http');
const request = require('request');
const json2csv = require('json2csv');

const shirtsObj = [];

function getShirts(anchor){
  //grab the list item href and make request to this path
  const requestURL = `http://www.shirts4mike.com/${anchor.attr('href')}`;

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
*/
