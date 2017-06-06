var Crawler = require('node-webcrawler');
var url = require('url');
var uniq = require('uniq');
const fs = require('fs');


var courses = JSON.parse(fs.readFileSync(__dirname+'/../db/json/courses.json','utf-8'));
var courseInfos = [];
var courseAcronym;
var courseName;
var professors = "";

fs.writeFile(__dirname+'/../db/json/courseInfos.json','',(err) => {
    if (err) throw err;
    console.log('The file has been saved as courseInfos.json!');
});


var c1 = new Crawler({
    maxConnection: 90,
    callback     : (err, res, $) => {
        var categoryQuery = $('td[valign="top"]');

        var term;
        var termName;
        for (var i = 0; i < categoryQuery.length; i++) {
            if (i % 3 === 0) {
                termName = categoryQuery[`${i}`].parent.parent.parent.parent.prev.children[0].children[1].attribs.name;
                term = categoryQuery[`${i}`].parent.parent.parent.parent.prev.children[0].children[2].attribs.name;
            };


            categoryQuery[`${i}`].children.map((obj, index, arr) => {
                // console.log(obj);
                if(arr.length === 1) {
                    if (obj.name === 'a') {
                        courseAcronym = obj.children[0].data;
                        return;
                    } else {
                        courseName = obj.data;
                        return;
                    }
                };

                if (obj.name === 'a') {
                    if (professors.length === 0) {
                        professors = obj.children[0].data.trim();
                    } else {
                        professors += `;${obj.children[0].data.trim()}`;
                    }
                } else {
                    if (!(obj.name === 'br') && index === 0) {
                        professors = (obj.data.trim().slice(-1) !== ';') ? obj.data.trim() : obj.data.trim().slice(0, -1);
                    }
                };


                if (index === arr.length - 1) {


                    courseInfos.push({
                        courseName,
                        section: parseInt(courseAcronym.slice(-2)),
                        professors,
                        courseAcronym,
                        date: (arr[arr.length-1].data.trim() === 'TBA;') ? arr[arr.length-1].data.trim().slice(0,-1) : arr[arr.length-1].data.trim(),
                        term,
                        termName,
                        acronym: (String(parseInt(courseAcronym[3])) !== 'NaN') ? courseAcronym.slice(0,3) : courseAcronym.slice(0,4)
                        // field_id,
                    });
                    professors = "";
                    return;
                };

                return;
            });
        };
        console.log(courseInfos[27]);

        fs.writeFileSync(__dirname+'/../db/json/courseInfos.json',JSON.stringify(courseInfos));
        console.log('Courses All Crawled!');

    }
});

for (var i=0;i < courses.length;i++) {
    c1.queue(courses[i].fieldUrl);
};

