var Crawler = require('node-web-crawler');
var url = require('url');
var uniq = require('uniq');
var cb = require('callback');
const fs = require('fs');


var courses = [];
var courseInfoUrlFront = "https://iasext.wesleyan.edu/regprod/";
var courseInfoUrlBack = "&offered=Y";
var categoryName;


fs.writeFile(__dirname+'/../db/json/courses.json','',(err) => {
    if (err) throw err;
    console.log('The file has been saved as courses.json!');
});


// Wesmap main page crawler

var c = new Crawler({
    maxConnections: 10,
    callback: (err,res,$) => {
        if (err) throw err;
        console.log('fdsfadfdas');

        var categoryQuery = $('td[valign="top"]');

        for(var i=0;i < categoryQuery.length;i++) {
            categoryQuery[`${i}`].children.map((obj,index) => {
                if (obj.name === "b") {
                    categoryName = obj.children[0].data;
                    return;
                } else if (obj.name === "a") {
                    if (categoryName === "OTHER") {
                        return;
                    } else if (obj.attribs.href.slice(-14,-13) === "=") {

                        courses.push({
                            category: categoryName,
                            field: obj.children[0].data,
                            fieldUrl: courseInfoUrlFront+obj.attribs.href.replace("subj_page","crse_list")+courseInfoUrlBack,
                            acronym: obj.attribs.href.slice(-13,-10),
                            term: parseInt(obj.attribs.href.slice(-4))
                        });

                        return;

                    } else {

                        courses.push({
                            category: categoryName,
                            field: obj.children[0].data,
                            fieldUrl: courseInfoUrlFront+obj.attribs.href.replace("subj_page","crse_list")+courseInfoUrlBack,
                            acronym: obj.attribs.href.slice(-14,-10),
                            term: parseInt(obj.attribs.href.slice(-4))
                        });

                        return;
                    };


                }
            });

        };

        fs.appendFileSync(__dirname+'/../db/json/courses.json',JSON.stringify(courses));
        console.log('Categories All Crawled!');

    }
});


c.queue(['https://iasext.wesleyan.edu/regprod/!wesmaps_page.html']);












// var lst = [[1,2,3],[2,3,4],[1,2,3],[4,5,6]];
// console.log(uniq(lst,function (l1,l2) {
//     return l1[0] !== l2[0] && l1[1] !== l2[1] && l1[2] !== l2[2];
// }).reverse());

