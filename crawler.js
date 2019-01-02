const urlToSearch = process.argv.length > 0 && process.argv[2] ? process.argv[2] : false,
  urlPattern = /^https?:\/\//i;

if (!urlToSearch) {
  console.error('Please, tell me - which URL you want to check? \n-> example: "node crawler.js https://google.com"');

  return false;
}

const Crawler = require('crawler'),
  c = options => new Crawler(options);


// queue selected URL
c({
  maxConnections: 10,
  timeout: 20000,
  callback: (error, res, done) => {
    if (error) console.log(error);
    else {
      const { $, statusCode } = res,
        links = $('a[href]');

      console.log(`Requested URL -> ${urlToSearch} \nstatus: ${statusCode} \nChecking links, wait a sec...`);

      setTimeout(() => {
        Array.from(links).forEach(link => {
          if ($(link).attr('href') !== '' || $(link).attr('href') !== '#') {
            let attr = $(link).attr('href');

            if (!attr.includes('http')) attr = `${res.request.uri.protocol}//${res.request.uri.host}${attr}`;

            checkLinks(attr).then(done => {
              done();
            });
          }
        });
      }, 1350);
    }
  }
}).queue(urlToSearch);


// check links
function checkLinks(link) {
  return new Promise((resolve, reject) => {
    c({
      maxConnections: 1,
      callback: (error, res, done) => {
        if (error) console.log(error);
        else {
          const { statusCode } = res;

          console.log(`${link} -- status: ${statusCode}`);
        }

        done();
      }
    }).queue(link);
  });
}
