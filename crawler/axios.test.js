var axios = require('axios');
var cheerio = require('cheerio');
var fs = require('fs');

var courses = [];
var category;
var urlFront = 'https://iasext.wesleyan.edu/regprod/';
var urlMiddle = 'crse_list';
var urlBack = '&offered=Y';

fs.writeFile(__dirname+'/../db/json/courses.json','',(err) => {
    if (err) throw err;
    console.log('The file has been saved as courses.json!');
});

axios.get('https://iasext.wesleyan.edu/regprod/!wesmaps_page.html?term=1179').then((res) => {

    $ = cheerio.load(res.data);
    console.log('HEHRRHHR')
    var categoryQuery = $('td[valign="top"]').children();

    categoryQuery.each(function (i,elem) {
        if (i < 185) {
            if (elem.name === 'b') {
                category = $(this).text().trim();
                return;
            } else if (elem.name === 'a') {
                courses.push({
                    name: $(this).text().trim(),
                    acronym: ($(this).attr().href.slice(-14,-13) === '=') ? $(this).attr().href.slice(-13,-10) : $(this).attr().href.slice(-14,-10),
                    category,
                    fieldUrl: urlFront+$(this).attr().href.replace('subj_page',urlMiddle)+urlBack,
                    term: $(this).attr().href.slice(-4)
                });
                return;
            };    
        };
    });

    console.log(courses.length);
    return Promise.resolve(courses);
}).then((res) => {
    fs.appendFileSync(__dirname+'/../db/json/courses.json',JSON.stringify(res));
    console.log('Categories All Crawled!');
});