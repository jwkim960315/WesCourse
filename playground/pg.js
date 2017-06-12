var courseInfos1;
var courseInfos2;
var fs = require('fs');
var _ = require('lodash');
let {coursesVal,courseInfosVal} = require('./../db/data_manipulation.js');

// fs.readFile(__dirname+'/../db/json/courseInfos.json','utf-8',(err,data) => {
//     courseInfos1 = JSON.parse(data);
//     fs.readFile(__dirname+'/../db/json/courseInfosTest.json','utf-8',(err1,data1) => {
//         courseInfos2 = JSON.parse(data1);
//         console.log(courseInfos1.length);
//         console.log(courseInfos2.length);
//     })
// });

var test = [["a","b","c","d","e","f","g","h","h"],["a","b","c","d","e","f","g","h","h"],["a","b","c","d","e","f","g","i","h"],["a","b","c","d","e","f","g","j","h"],["a","b","c","d","e","f","g","k","h"],["a","b","c","d","e","f","g","l","h"],["a","b","c","d","e","f","g","w","v"]];
// var tmp = [];



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

console.log(filter2dArr(addCrossList(courseInfosVal)));


























// var filter2dArr =  lst => {
//     return lst.filter((arr,index,itself) =>  {
//         for (var i=0;i < itself.length;i++) {
//             if (itself[i][3] === arr[3]) {
//                 if (i === index) {
//                     return true;
//                 } else {
//                     return false;
//                 }
//             }
//         }
//         return false;
//     });
// };

// var addCrossList = lst => {
//     let result = [];
//     lst.forEach((arr,index,itself) => {
//         arrCopy = arr.slice();
//         for (var i=0;i < itself.length; ++i) {
//             if (itself[i][3] === arr[3]) {
//                 if (itself[i][7] !== itself[i][8]) {
//                     tmp.push(itself[i][7]);
//                 }
//             }
//         }

//         if (tmp.length !== 0) {
//             arrCopy[8] = tmp.sort().join(';');
//             result.push(arrCopy);
//         } 

//         tmp = [];
        
//     });
//     return result;
// };

// console.log(filter2dArr(addCrossList(test)));
// console.log(addCrossList(test));
// filter2dArr(addCrossList(test));
// console.log(filter2dArr(addCrossList(courseInfosVal)));


// console.log(_.isEqual([1,2],[2,1]));