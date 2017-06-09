const fs = require('fs');
const _ = require('lodash');

var courses = JSON.parse(fs.readFileSync(__dirname+'/json/courses.json'));
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