const urlToSearch = process.argv.length > 0 && process.argv[2] ? process.argv[2] : false,
  urlPattern = /^https?:\/\//i,
  divider = new Array(process.stdout.columns + 1).join('-');

let count = { okay: 0, error: 0 };

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
        linksList = $('a[href]'),
        linksArray = Array.from(linksList);
        color = statusCode === 200 ? '\x1b[32m' : '\x1b[31m';

      console.log(`Requested URL -> ${urlToSearch} -- status:`,color,`${statusCode}`,'\x1b[0m',`\nChecking links, wait a sec...\n`);

      getLinks({ res, linksList, linksArray }).then(() => {
        console.log(divider);

        console.log('>>>  Count:', '\x1b[36m', linksArray.length, '\x1b[0m');
        console.log('>>>  Okay :', '\x1b[32m', count.okay, '\x1b[0m');
        console.log('>>>  Error:', '\x1b[31m', count.error, '\x1b[0m');

        console.log('\n');
      }).catch(err => console.error(err));
    }

    done();
  }
}).queue(urlToSearch);


// get links
function getLinks(params) {
  return new Promise((resolve, reject) => {
    const { $ } = params.res;

    setTimeout(() => {
      let cur = 0;

      params.linksArray.forEach(link => {
        if ($(link).attr('href') !== '' || $(link).attr('href') !== '#') {
          let attr = $(link).attr('href');

          if (!attr.includes('http')) attr = `${params.res.request.uri.protocol}//${params.res.request.uri.host}${attr}`;

          checkLink(attr).then(() => {
            cur++;

            if(cur === params.linksArray.length) return resolve();
          }).catch(err => console.error(err));
        }
      });
    }, 1350);
  })
}


// check link
function checkLink(link) {
  return new Promise((resolve, reject) => {
    c({
      maxConnections: 1,
      callback: (error, res, done) => {
        if (error) console.log(error);
        else {
          const { statusCode } = res,
            color = statusCode === 200 ? '\x1b[32m' : '\x1b[31m';

          if(statusCode === 200) count.okay = count.okay + 1;
          else count.error = count.error + 1;

          console.log(divider);
          console.log(`${link} -- status:`,color,`${statusCode}`,'\x1b[0m');
        }

        done();
        return resolve();
      }
    }).queue(link);
  });
}
