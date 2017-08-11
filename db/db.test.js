// var lst = [{'a':1},{'b':2},{'c':3}];
//
// var lst1 = [{'d':4},{'e':5},{'f':6}];
//
//
//
// // lst1.concat(lst[0]);
// //
// // console.log(lst1);
//
//
//
// // function appending () {
// //     for (var i=0;i < lst.length;i++) {
// //         lst1.push(lst[i]);
// //     };
// //
// //     // return new Promise((resolve,reject) => {
// //     //     resolve(lst1);
// //     // });
// //
// //     return Promise.resolve(lst1);
// // };
// //
// // appending().then((res) => console.log(res));
//
// console.log(typeof String(['what','the','fuck']));
//
// console.log(String(['what','the','fuck']).split(","));
//
// var arr = [[1,2,3],[1,2,3]].filter( function( item, index, inputArray ) {
//     return inputArray.indexOf(item) == index;
// });
//
// console.log(arr);






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
var _ = require('lodash');

// console.log(courseInfosVal[9]);

console.log(coursesVal.slice(0,20));
// console.log(courseInfosVal[374]);
// console.log(dedupCourseInfosVal.length);
// console.log(courseInfosVal[0][courseInfosVal[0].length-1]);
// console.log(courseInfosVal.length)
// console.log(courses);

var connection;

var dedupFunc = (lst) => {
    var someLst = lst.map((arr) => {
                      // console.log('hihihiihhi');
                      arr[2] = arr[2].replace(/,/g,'&');
                      arr[0] = arr[0].replace(/,/g,'&&');
                      return String(arr);
                  }).filter((arr,i,itself) => {
                      return itself.indexOf(arr) == i;
                  }).map((arr) => {
                      return arr.split(',');
                  }).map((arr) => {
                      arr[2] = arr[2].replace(/&/g,',');
                      // console.log(arr[arr.length-1]);
                      // arr[arr.length-1] = parseInt(arr[arr.length-1]);
                      arr[0] = arr[0].replace(/&&/g,',');
                      return arr;
                  });
    // console.log(someLst.slice(0,20));
    return someLst;

};




var filter2dArr =  (lst) => {
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

var tmp3 = coursesVal.map((arr,i) => {
    return arr[3]
}); 

var tmp4 = filter2dArr(courseInfosVal).map((arr,i) => {
    return arr.slice(-1)[0]
});

var filterArr = (lst) => {
  return lst.filter((res,i,arr) => {
    return arr.indexOf(res) == i;
  })
}

// tmp4 = filterArr(tmp4);

// console.log(tmp3.length);
tmp4.map((str,i,arr) => {
  if (tmp3.indexOf(str) === -1) {
    console.log(str);
  };
});


console.log('Reading Greek Prose: Plato\'s Ion');

mysql.createConnection({
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'bde7bea3621ed5',
    password: '8a58d1dc',
    database: 'heroku_3cf1e0afcd9cbfb',
    multipleStatements: true
}).then((conn) => {
    connection = conn;

    connection.query('INSERT INTO fields (category,name,url,acronym,term) values ?',[coursesVal]).then((tmp) => {
        connection.query('INSERT INTO courses (course_name,section,professors,course_acronym,class_date,term,term_name,field_acronym,cross_list) values ?',[courseInfosVal]).then((ok) => {
            console.log(ok);
            connection.end();
        }).catch((err) => {console.log(err);connection.end();});
    }).catch((err) => {console.log(err);connection.end();});
}).catch((err) => {console.log(err);connection.end();});


// 'Elementary Arabic I',
//     '1',
//     'Aissa',
//     'Abderrahman',
//     'ARAB101-01',
//     '.MTWRF. 08:50AM-09:40AM;',
//     '1179',
//     'fall',
//     'ARAB'


// console.log(coursesVal);
// console.log(courseInfosVal);







// connection.end();

