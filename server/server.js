// Modules
const mysql = require('promise-mysql');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const html = require('html');

const port = process.env.port || 3000;

var app = express();

// Pre-Setting for the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, '/../public')));
app.set('view engine','ejs');


// Important Variables

const courses = JSON.parse(fs.readFileSync(__dirname+'/../db/json/coursesTest.json'));
const courseInfos = JSON.parse(fs.readFileSync(__dirname+'/../db/json/courseInfosTest.json'));
let filteredCourseInfos;



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

let options;

app.get('/',(req,res) => {
    options = {
        root: __dirname + '/../views/'
    };

    res.sendFile('index.html',options);
});


app.get('/catalog',(req,res) => {
    connection.query('SELECT category,name FROM fields ORDER BY 1,2').then(data => {
        data = catalogDataManipulator(data);
        // console.log(data);
        res.send(data);
    });
});


app.get('/:name',(req,res) => {
    let courseName = req.params.name;

    connection.query(`SELECT acronym FROM fields WHERE name="${courseName}"`).then(acronyms => {
        console.log(acronyms);
        filteredCourses = courseInfos.filter((obj,i,arr) => {
            return obj.field_acronym === acronyms[0].acronym;
        });

        fallCourses = filteredCourses.filter((obj,i,arr) => {
            return obj.term_name.includes('fall');
        });

        springCourses = filteredCourses.filter((obj,i,arr) => {
            return obj.term_name.includes('spring');
        });
        res.render('specificField',{filteredCourses,fallCourses,springCourses});
        
    });
});


app.get('/:acronym/:course',(req,res) => {
    // console.log(req.params.acronym);
    // console.log(req.params.course);

    connection.query('SELECT ')
});








app.listen(port,() => {
    console.log(`Server is running at ${port}`);
});