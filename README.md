

# WesCourse

A web application that displays & stores the ratings of the Wesleyan University courses

## Table of Contents


- [Browser Support](#browser-support)
- [Overview](#overview)
- [Limitations](#limitations)
- [Issues](#issues)
- [Technologies Used](#technologies-used)
- [Moving On](#moving-on)

## Browser Support

Chrome | Safari | FireFox | IE | Edge
------ | ------ | ------- | -- | ----
60 &#10004; | 10 &#10004; | 55 &#10004; | 11 &#10004; | 15 &#10004;


## Overview

WesCourse is a web application which Wesleyan Students can view/rate Wesleyan courses. It has some key features:
* Sign in/Create an Account only with your Wesleyan email
* You can choose to be an anonymous when you are posting a rating of a course
* If you like a rating of a course, you can "like" it
* You can manage your profile by uploading a new picture & edit/delete ratings you have submitted
* You can sort all ratings of a course by various categories
* If you type in a keyword in a searchbox from a Search Page, a suggestive results will be shown
* Courses Page will show you the courses with WesMaps-style


## Limitations

For now, it has some limitations on using this web application:

- Since this is deployed via Heroku and uses clearDB as an addon, it is limited to only 5MB for free
- Connections to/from ClearDB is pretty slow, which may cause some troubles during the following actions:
    * Liking/Unliking a rating may take up to a second to complete
    * After changing a profile picture, loading a page from the web application will take some time
- Some pages might have some shift/disappear effects because of CSS files not being loaded completely


## Issues

For now, issues might occur when these actions are performed:
* Some GET/POST requests are sent to the server (Some of them do not cover edge cases)
* Like/Unlike a rating and refresh the page within a second
* Browser Support 
  * Interner Explorer: Although the web application does function properly in most cases, it does not provide a user with a suggestive search (Found a reason, but yet to fix it)


## Technologies Used

* Node.js
* Bootstrap 3
* Passport.js
* JQuery Bar Rating
* iCheck...and many other modules


## Moving On

As I was developing this project, I realized that I could develop some code further and create a couple new open source projects:
* Pagination
  * I tried to find a pagination module that allows a user to navigate to first/last pages, next/previous sections, and next/previous pages, but I gave up and built my own version of pagination with Node, html, and CSS. I am willing to further develop it and make it available to everyone
* Wesleyan Courses API
  * I also had to scrap all the Wesleyan courses data from WesMaps since Wesleyan REST API has been shutdown during the Summer Break. This tragedy actually allowed me to realize that I could make this an open source project and allow Wesleyan developers to use it freely
* Refactoring
  * I have a lot to refactor both back-end and front-end code. Hopefully, I can make is much cleaner than what I have now






