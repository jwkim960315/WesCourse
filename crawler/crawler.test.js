var Crawler = require('node-web-crawler');
var url = require('url');
var axios = require('axios');
var cheerio = require('cheerio');
var cheerio1 = require('cheerio');
var fs = require('fs');
var $;
var categoryQuery;


var courses = [];
var categoryName;

var courseInfos = [];
var courseAcronym;
var courseName;
var professors = "";

var term;
var termName;

var urlFront = 'https://iasext.wesleyan.edu/regprod/';
var urlMiddle = 'crse_list';
var urlBack = '&offered=Y';

fs.writeFile(__dirname+'/../db/json/courseInfos.json','',(err) => {
    if (err) throw err;
    console.log('The file has been saved as courseInfos.json!');
});

fs.writeFile(__dirname+'/../db/json/courses.json','',(err) => {
    if (err) throw err;
    console.log('The file has been saved as courses.json!');
});



axios.get('https://iasext.wesleyan.edu/regprod/!wesmaps_page.html').then((res) => {
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

    courses.push({
        name: 'French, Italian, Spanish in Translation 2018-2018',
        acronym: 'FIST',
        category: 'N/A',
        fieldUrl: 'https://iasext.wesleyan.edu/regprod/!wesmaps_page.html?crse_list=FIST&term=1179&offered=Y',
        term: 1179
    });

    // console.log(courses.length);
    return Promise.resolve(courses);
}).then((res) => {
    fs.appendFileSync(__dirname+'/../db/json/courses.json',JSON.stringify(res));
    console.log('Categories All Crawled!');
    return Promise.resolve(res);
}).then((res) => {
    
    // console.log(res);
    for (var j=0;j < res.length;j++) {
        // console.log('HEREREER');
        axios.get(res[j].fieldUrl).then((res1) => {
            $ = cheerio1.load(res1.data);

            query = $('td[width="5%"]')
            query1 = $('td[width="55%"]');
            query2 = $('td[width="40%"]');
            query3_length = $('body > table').children().children().children()['1'].children[1].children[1].children.length/2
            query4 = parseInt(query.slice(0).eq(0)['0'].children[0].attribs.href.slice(-4));

            for (var i=0;i < query.length;i++) {
                courseInfos.push({
                    course_name: query1.slice(i).eq(0).text(),
                    section: parseInt(query.slice(i).eq(0).text().slice(-2)),
                    professors: query2.slice(i).eq(0).text().trim().split('   ').slice(0,-1).join(';'),
                    course_acronym: query.slice(i).eq(0).text(),
                    class_date: query2.slice(i).eq(0).text().trim().split('   ').slice(-1)[0],
                    term: parseInt(query.slice(i).eq(0)['0'].children[0].attribs.href.slice(-4)),
                    term_name: (i < query3_length) ? 'fall' : 'spring',
                    field_acronym: (String(parseInt(query.slice(0).eq(0).text()[3])) !== 'NaN') ? query.slice(0).eq(0).text().slice(0,3) : ((query.slice(0).eq(0).text().slice(0,4).indexOf('&') === -1) ? query.slice(0).eq(0).text().slice(0,4) : query.slice(0).eq(0).text().slice(0,4).replace('&',''))
                })
                
                console.log(courseInfos[i].field_acronym);
            }

            return Promise.resolve(courseInfos);
    

            // console.log(courseInfos);


        }).then((result) => {
            fs.writeFileSync(__dirname+'/../db/json/courseInfos.json',JSON.stringify(courseInfos));
            console.log('Courses All Crawled!');
        });

        
    };


});


// c.queue('https://iasext.wesleyan.edu/regprod/!wesmaps_page.html');