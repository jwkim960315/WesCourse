// Crawling Websites
require('./../crawler/categoryCrawler');
require('./../crawler/coursesCrawler');

// Creating Databases
require('./../db/db.js');

// Modules
const mysql = require('mysql');
const bodyParser = require('body-parser');
const express = require('express');


var app = express();

// Pre-Setting for the server
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({extended: true}));





