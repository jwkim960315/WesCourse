// Crawling Websites

// console.log(__dirname);
// require(__dirname+'/../crawler/categoryCrawler');
//
// var require_courses = () => {
//     require(__dirname+'/../crawler/coursesCrawler');
// }
//
// setTimeout(require_courses,2000);



// Modules
const mysql = require('promise-mysql');
const fs = require('fs');
var {coursesVal,courseInfosVal} = require('./data_manipulation');

// console.log(coursesVal.length);
// console.log(courseInfosVal.length);
// console.log(dedupCourseInfosVal.length);
// console.log(courseInfosVal[0]);

// console.log(courses);

var connection;

var insertId = (arr0,arr1) => {
    arr0.map((obj,index,arr) => {
        arr1.map((courseArr,index0,arr0) => {
            if (obj.acronym === courseArr[courseArr.length-1]) {
                arr1.field_id = obj.id;
            };
        });
    });

    return arr1;
};

var dedupFunc = (lst) => {
    return lst.map((arr) => {
        return String(arr);
    }).filter((arr,i,itself) => {
        return itself.indexOf(arr) == i;
    }).map((arr) => {
        return arr.split(',');
    });
};

mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'wes_course',
    multipleStatements: true
}).then((conn) => {
    connection = conn;

    // console.log('HERERERERERE');

    connection.query('INSERT INTO fields (category,field_name,url,acronym,term) values ?',[coursesVal]).then((tmp) => {
        console.log(tmp);
        connection.query('SELECT id,acronym from fields').then((rows) => {
            var courseInfosVal = insertId(rows,courseInfosVal);
            return Promise.resolve(courseInfosVal);
        }).then((res) => {
            var dedupCourseInfosVal = dedupFunc(res);
            return Promise.resolve(dedupCourseInfosVal);
        }).then((result) => {
            connection.query('INSERT INTO courses () values ?'.[result]).then((ok) => {
                console.log(ok);
            });
        });
    });
}).catch((err) => console.log(err));





// console.log(coursesVal);
// console.log(courseInfosVal);







// connection.end();