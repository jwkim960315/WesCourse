var Crawler = require('node-webcrawler');
var url = require('url');
var uniq = require('uniq');
var cb = require('callback');


// var courses = [];
var courseInfos = [];
var courseInfoUrlFront = "https://iasext.wesleyan.edu/regprod/";
var courseInfoUrlBack = "&offered=Y";
var categoryName;
var courseAcronym;
var courseName;
var professors = "";

var export_func = () => {
    module.exports = {courses,courseInfos};
};




    // https://iasext.wesleyan.edu/regprod/!wesmaps_page.html?crse_list=THEA&term=1179&offered=Y


// Wesmap main page crawler

var c = new Crawler({
    maxConnections: 10,
    callback: (err,res,$) => {
        if (err) throw err;

        var categoryQuery = $('td[valign="top"]');
        var courses = [];

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

            // console.log(courses);
        };

        export_func(callback);

        var c1 = new Crawler({
            maxConnection: 90,
            callback: (err,res,$) => {
                var categoryQuery = $('td[valign="top"]');


                // console.log('***************************');
                // console.log('***************************');
                // console.log('***************************');
                // console.log('***************************');

                var term;
                var termName;
                for (var i=0;i < categoryQuery.length;i++) {
                    if (i%3 === 0) {
                        termName = categoryQuery[`${i}`].parent.parent.parent.parent.prev.children[0].children[1].attribs.name;
                        term = categoryQuery[`${i}`].parent.parent.parent.parent.prev.children[0].children[2].attribs.name;
                    };


                    categoryQuery[`${i}`].children.map((obj,index,arr) => {
                        // console.log(obj);
                        if (arr.length === 1) {
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
                                professors = (obj.data.trim().slice(-1) !== ';') ? obj.data.trim() : obj.data.trim().slice(0,-1);
                            }
                        };


                        if (index === arr.length-1) {
                            courseInfos.push({
                                courseName,
                                section: parseInt(courseAcronym.slice(-2)),
                                professors,
                                courseAcronym,
                                date: (arr[arr.length-1].data.trim() === 'TBA;') ? arr[arr.length-1].data.trim().slice(0,-1) : arr[arr.length-1].data.trim(),
                                term,
                                termName,
                                // field_id,
                            });
                            professors = "";
                        }

                        return;
                    });
                };




            }

        });

        for (var i=0;i < courses.length;i++) {
            c1.queue(courses[i].fieldUrl);
        };

        // module.exports = {courses,courseInfos};

        // c1.queue(courses[80].fieldUrl);

        // c1.queue(courses[3].fieldUrl);

    }
});

var gather = function (callback) {
    c.queue(['https://iasext.wesleyan.edu/regprod/!wesmaps_page.html']);
};

gather();









// var lst = [[1,2,3],[2,3,4],[1,2,3],[4,5,6]];
// console.log(uniq(lst,function (l1,l2) {
//     return l1[0] !== l2[0] && l1[1] !== l2[1] && l1[2] !== l2[2];
// }).reverse());

