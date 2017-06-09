// Modules
const mysql = require('promise-mysql');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const express = require('express');
const ejs = require('ejs');
const path = require('path');

const port = process.env.port || 3000;

var app = express();

// Pre-Setting for the server
app.use(bodyParser.json());
// app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
// app.set('view engine','ejs');
// console.log(path.join(__dirname, '../public'));
app.use(express.static(path.join(__dirname, '../public')));
// app.use('views',__dirname);

// Temporary Variables

let tmpCategory;
let tmpCourseNames = [];
let renderData = {};

// Helper Functions

let catalogDataManipulator = data => {
    tmpCategory = data[0].category;
    for (let i=0;i < data.length;++i) {
        if (data[i].category === tmpCategory) {
            tmpCourseNames.push(data[i].name);
        } else {
            renderData[tmpCategory] = tmpCourseNames;
            tmpCourseNames = [data[i].name];
            tmpCategory = data[i].category;
        }
        
    }
    renderData[tmpCategory] = tmpCourseNames;
    tmpCategory = '';
    tmpCourseNames = [];
    return renderData;
};



// Database Connection

let connection;

mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'wes_course_test'
}).then(function(conn){
    connection = conn;
});


// Routes


app.get('/',(req,res) => {
    res.send('index.html',{});
});


app.get('/catalog',(req,res) => {
    connection.query('SELECT category,name FROM fields ORDER BY 1,2').then((data) => {
        data = catalogDataManipulator(data);
        res.send(data);
    });
});


// app.get('/:name',(req,res) => {
//     let courseName = req.params.name;

//     connection.query(`SELECT acronym FROM fields WHERE name="${courseName}"`).then(acronyms => {
//         connection.query(`SELECT id,course_acronym,section,professors,class_date FROM courses WHERE field_acronym="${acronyms[0].acronym}",field_acronym=SUBSTR()`).then(data => {
//             console.log(data[0]);
//         });
//     });
// });





app.listen(port,() => {
    console.log(`Server is running at ${port}`);
});