1. create scraper.js with command line app
  a.check for a folder called 'data', if not exist then create one, if exists do nothing
  b. should visit shirts4mike.com and uses /shirt.php as entry point to scrape information for 8 tee-shirts
  c. Do not use hard coded URL like /shirts.php?id=101
  d. google node scapers
  e. scraper should:
    1. get price, title, url and image url and save to CSV
    2. show error if firts4mike is down
2. create package.json with dependancies
  a. should run when npm start command is run
  log errors to file named scraper-error.log
3. Choose two npm packages - (must have >1000 downloads + updated in last 6 months)
  a. one should scrape content from site
  b. second package should create csv
