const fs = require('fs');
const _ = require('lodash');

var courses = JSON.parse(fs.readFileSync(__dirname+'/json/coursesTest.json'));
var courseInfos = JSON.parse(fs.readFileSync(__dirname+'/json/courseInfosTest.json'));
var coursesVal = [];
var courseInfosVal = [];
let tmp = [];



courses.map((obj,index,arr) => {
    coursesVal.push([obj.category,obj.name,obj.fieldUrl,obj.acronym,obj.term]);
});

// console.log(coursesVal);
// console.log('*******************');
// console.log(courses[0]);

courseInfos.map((obj) => {
    courseInfosVal.push([obj.course_name,obj.section,obj.professors,obj.course_acronym,obj.class_date,obj.term,obj.term_name,obj.field_acronym,obj.cross_list]);
});


let addCrossList = lst => {
    let tmp = [];
    let tmp1 = [];
    resArr = lst.map(arr => arr.slice());
    lst.forEach((arr,i,itself) => {
        itself.forEach((arr1,i1,itself1) => {
            if (arr1[3] === arr[3]) {
                tmp.push(arr1[8]);
                tmp1.push(arr1[6]);
            }
        })
        resArr[i][8] = tmp.join(';');
        resArr[i][6] = tmp1.join(';');
        tmp = [];
        tmp1 = [];
    })
    return resArr;
};

let filter2dArr = lst => {
    return lst.filter((arr,index,itself) =>  {
        for (var i=0;i < itself.length;i++) {
            if (itself[i][3] === arr[3]) {
                if (i === index) {
                    return true;
                } else {
                    return false;
                }
            } 
        }
        return false;
    });
};

courseInfosVal = filter2dArr(addCrossList(courseInfosVal));

// courseInfos.map((obj) => {
//     if (obj.field_acronym !== obj.cross_list) {
//         console.log(`${obj.field_acronym} <--> ${obj.cross_list}`);
//     }
// })

// dedupCourseInfosVal = courseInfosVal.map((arr,i,itself) => {
//     return String(arr);
// }).filter((arr,i,itself) => {
//     return itself.indexOf(arr) == i;
// }).map((arr,i,itself) => {
//     return arr.split(',');
// });

// console.log(coursesVal.length);
// console.log(courseInfosVal.length);
// console.log(dedupCourseInfosVal.length);

// {"course_name":"Introduction to Ancient Greek: Semester II",
//   "section":1,
//   "professors":"Szegedy-Maszak,Andrew ",
//   "course_acronym":"GRK102-01",
//   "class_date":".M.W... 10:50AM-12:10PM; .....F. 10:50AM-11:40AM;",
//   "term":1179,
//   "term_name":"fall",
//   "field_acronym":"GRK"}




module.exports = {coursesVal,courseInfosVal};