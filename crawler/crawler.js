var Crawler = require('node-webcrawler');
var url = require('url');

// {Mathematics: MATH}
var courses = {};
var courseInfos = [];


// Wesmap main page crawler
var mainPageCrawler = new Crawler({
    maxConnections: 10,
    callback: (err,res,$) => {
        if (err) throw err;

        var tmp = $('td[valign="top"]:nth-child(1)').text();
        // var tmp2 = $('td[valign="top"] > a:nth-child(1)')['0'].children[0].data;

        console.log(tmp);
        // console.log(tmp2);
    }
});

mainPageCrawler.queue('https://iasext.wesleyan.edu/regprod/!wesmaps_page.html');




// Wesmap course page crawler
// var coursePageCrawler = new Crawler({});


