var axios = require('axios');
var cheerio = require('cheerio');
var fs = require('fs');
const iconv = require('iconv-lite');
var iconv1 = require('iconv');
var request = require('request');
var rp = require('request-promise');

function toUTF8(body) {
  // convert from iso-8859-1 to utf-8
  var ic = new iconv1.Iconv('iso-8859-1', 'utf-8');
  var buf = ic.convert(body).toString('binary');
  return buf;
}

fs.writeFile(__dirname+'/../db/json/courseInfosTest.json','',(err) => {
    if (err) throw err;
    console.log('The file has been saved as courseInfosTest.json!');
});


// var courses = [];
// var category;
// var urlFront = 'https://iasext.wesleyan.edu/regprod/';
// var urlMiddle = 'crse_list';
// var urlBack = '&offered=Y';

// fs.writeFile(__dirname+'/../db/json/courses.json','',(err) => {
//     if (err) throw err;
//     console.log('The file has been saved as courses.json!');
// });

// axios.get('https://iasext.wesleyan.edu/regprod/!wesmaps_page.html?term=1179').then((res) => {

//     $ = cheerio.load(res.data);
//     console.log('HEHRRHHR')
//     var categoryQuery = $('td[valign="top"]').children();

//     categoryQuery.each(function (i,elem) {
//         if (i < 185) {
//             if (elem.name === 'b') {
//                 category = $(this).text().trim();
//                 return;
//             } else if (elem.name === 'a') {
//                 courses.push({
//                     name: $(this).text().trim(),
//                     acronym: ($(this).attr().href.slice(-14,-13) === '=') ? $(this).attr().href.slice(-13,-10) : $(this).attr().href.slice(-14,-10),
//                     category,
//                     fieldUrl: urlFront+$(this).attr().href.replace('subj_page',urlMiddle)+urlBack,
//                     term: $(this).attr().href.slice(-4)
//                 });
//                 return;
//             };    
//         };
//     });

//     console.log(courses.length);
//     return Promise.resolve(courses);
// }).then((res) => {
//     fs.appendFileSync(__dirname+'/../db/json/courses.json',JSON.stringify(res));
//     console.log('Categories All Crawled!');
// });



var courseInfos = [];
fs.readFile(__dirname+'/../db/json/coursesTest.json','utf-8',(err,data) => {
    console.log(JSON.parse(data).length);
    data = JSON.parse(data);
    // console.log(data[0]);
    for (var j=0; j < data.length; j++) {
        // console.log(data[j].fieldUrl);
        rp({
            uri: data[j].fieldUrl,
            encoding: null
        }).then(
        (body) => {
            var bodyWithCorrectEncoding = iconv.decode(body, 'iso-8859-1');
            
            $ = cheerio.load(bodyWithCorrectEncoding);
            tmpField = [];
            
            $('td .header').children().each((i,elem) => {
                if (elem.attribs.href.includes('subj_page')) {
                    tmpField.push(elem.children[0].data);
                };
            });
            // console.log(tmpField[0]);




            query = $('td[width="5%"]');
            query1 = $('td[width="55%"]');
            query2 = $('td[width="40%"]');
            query3_length = $('body > table').children().children().children()['1'].children[1].children[1].children.length/2;
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
                    field_acronym: tmpField[0],
                    cross_list: (String(parseInt(query.slice(0).eq(0).text()[3])) !== 'NaN') ? query.slice(0).eq(0).text().slice(0,3) : ((query.slice(0).eq(0).text().slice(0,4).indexOf('&') === -1) ? query.slice(0).eq(0).text().slice(0,4) : query.slice(0).eq(0).text().slice(0,4).replace('&',''))
                })
                
                
            }
            // console.log(courseInfos);

            return Promise.resolve(courseInfos);


        }).then((result) => {
            fs.writeFileSync(__dirname+'/../db/json/courseInfosTest.json',JSON.stringify(courseInfos));
            // console.log(courseInfos);
            // console.log('Courses All Crawled!');
        });

    }
});


// axios.interceptors.response.use(function (response) {
//   var ctype = response.headers["content-type"]; 
//   if (ctype.includes("charset=ISO-8859-1")) {
//     //   originalData = new Buffer(response.data,"base64");
//     //   response.data = iconv.decode(originalData,"ISO-8859-1");  

//     //   response.data = iconv.decode(response.data, "ISO-8859-1")
//     response.data = toUTF8(response.data);
//   } else {
//       response.data = iconv.decode(response.data, 'utf-8');
//   } 
//   return response;
// })




// readFile(__dirname+'/../db/json/courses.json','utf-8',(err,data) => {
//     let courses = JSON.parse(data).slice(0,2);
//     courses.forEach((obj,i) => {



    
    //     axios.get('https://iasext.wesleyan.edu/regprod/!wesmaps_page.html?crse_list=PHYS&term=1179&offered=Y').then((res) => {
    //             $ = cheerio.load(res.data);
    //             tmpField = [];
                
    //             $('td .header').children().each((i,elem) => {
    //                 if (elem.attribs.href.includes('subj_page')) {
    //                     tmpField.push(elem.children[0].data);
    //                 };
    //             });
    //             console.log(tmpField[0]);




    //             query = $('td[width="5%"]');
    //             query1 = $('td[width="55%"]');
    //             query2 = $('td[width="40%"]');
    //             query3_length = $('body > table').children().children().children()['1'].children[1].children[1].children.length/2;
    //             query4 = parseInt(query.slice(0).eq(0)['0'].children[0].attribs.href.slice(-4));

    //             for (var i=0;i < query.length;i++) {
    //                 courseInfos.push({
    //                     course_name: query1.slice(i).eq(0).text(),
    //                     section: parseInt(query.slice(i).eq(0).text().slice(-2)),
    //                     professors: query2.slice(i).eq(0).text().trim().split('   ').slice(0,-1).join(';'),
    //                     course_acronym: query.slice(i).eq(0).text(),
    //                     class_date: query2.slice(i).eq(0).text().trim().split('   ').slice(-1)[0],
    //                     term: parseInt(query.slice(i).eq(0)['0'].children[0].attribs.href.slice(-4)),
    //                     term_name: (i < query3_length) ? 'fall' : 'spring',
    //                     field_acronym: tmpField[0],
    //                     cross_list: (String(parseInt(query.slice(0).eq(0).text()[3])) !== 'NaN') ? query.slice(0).eq(0).text().slice(0,3) : ((query.slice(0).eq(0).text().slice(0,4).indexOf('&') === -1) ? query.slice(0).eq(0).text().slice(0,4) : query.slice(0).eq(0).text().slice(0,4).replace('&',''))
    //                 })
                    
    //                 console.log(courseInfos);
    //             }

    //             return Promise.resolve(courseInfos);


    //         // }).then((result) => {
    //         //     fs.writeFileSync(__dirname+'/../db/json/courseInfosTest.json',JSON.stringify(courseInfos));
    //         //     console.log('Courses All Crawled!');
    //         // });




    // });



// });





// for (var j=0;j < res.length;j++) {
        
        
    // };








