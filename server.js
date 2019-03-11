
// 0.1. Assign the express module to a variable 'express'
const express = require('express');

// 1.1 Create a path to our models
/* In COMPLETED "todo" project this is called "db"
    Best to have our app/config/config.json in our .gitignore
*/

/* 
4.1 It looks like 'models' (index.js) takes all of the model's define() 'strings' and converts them into properties that can be called anywhere
  Example: Create a 'Todo' model inside app/models
    say: sequelize.define('MyTodo', ...)
    Thanks to index.js in "models", we can grab this model here by saying:
      'models.MyTodo'
*/
const models = require("./app/models");

//3.2.1 All of the data (which are routes) from module.exports, inside app/routes/index.js
const routes = require('./app/routes')

// 3.0 import handlebars
const exphbs = require('express-handlebars')

// 4.1 Import passport and express session - both needed to handle authentication

/* Passport.js is an authentication package that will go ahead and test users username and password in the backend of our database, 
  or maybe even other databases such as Facebook or Google databases that allow for multiple authentication methods
tl;dr for user authentication
  Responsible for: 
    1. Authentication strategy (verify callback inside passport.js)
      i. We use this as a callback in our routes
    2. Serialize and deserialize user instances to and from the session. (done in 4.2)
*/
const passport = require('passport')

/* express-session allows us to make use of sessions on our backend, and will return to the user a “cookie” if we tell it to do so
  Using the template app.use() method for session will create a cookie for us automatically
    Passport will use this cookie and its value to access data specific to its session 
  The cookie that we are going to be creating with express session will be called, by default, connect.sid
    We will be stuffing in identifying database information into our cookie, we will use that ID to fetch stuff from the database
    “The client will receive the session id in a cookie, and will send it along with every HTTP request.”
tl;dr for user sessions, and reads & writes cookies on req/res
*/
const session = require('express-session')
// 4.1 end of authentication packages

// 0.2. Initialize express and name it a variable 'app' 
// This normally comes after all initial imports
const app = express();

// 4.1 We must use bodyparser for 'app/config/passport/passport.js' so that we can use the 'body' method of 'req.body'
const bodyParser = require('body-parser')

/* 
3.1 Handlebars Middleware
  1. File location
  2. Register the engine
  3. Use the handlebars engine from 2) as default engine
*/

/* 
3.1 We are setting up our views inside ./app/views
  Handlebars expects the views to be located in ./views
  Let it know that the views folder is actually in a custom location
*/
app.set('views', './app/views')

/* 
3.2 Register the template engine
  The following sets up express app to use .hbs as the file extension for views
  1st param: hbs file extension
  2nd param: the library that will render for the given extension
*/
app.engine('.hbs', exphbs({
    /* 3.3 Use extname of '.hbs' to let handlebars know that the extension is NOT the default '.handlebars'
      Rather the extension is '.hbs' instead of default */
    extname: '.hbs'
}));
// 3.4 use the '.hbs' engine we just created (1st param of app.engine) as the default view engine of our app
app.set('view engine', '.hbs');

//4.1 For BodyParser

/* "support parsing of application/x-www-form-urlencoded post data"
  “Parses the text as URL encoded data 
    (which is how browsers tend to send form data from regular forms set to POST) 
  and exposes the resulting object (containing the keys and values) on req.body”
Body object:
  This object will contain key-value pairs, 
    extended: false -  the value can be a string or array
    extended: true - the value is any type
*/
app.use(bodyParser.urlencoded({
  // both 'extended: true/false' works in our case...
  extended: false
}));

/* 
  "support parsing of application/json type post data"
  Parses the text as JSON and exposes the resulting object on req.body
*/
app.use(bodyParser.json());

// 4.1 Session - For Passport
// below block has been copied from the express-session github
/* 
Github: "Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work." 
  "This module [express-session] *now directly reads and writes cookies on req/res*"
*/
app.use(session({
  /* You can think of 'secret' as a salt
    Each time we return a cookie to the user, it will be “signed” with a 'secret' (what we are using to hash our cookie)
      Want to make sure no one has access to this
    'secret' is usually a random string of characters from a random string character generator
    Github: "This is the secret used to sign the session ID cookie."
    Future: HAVE THIS SECRET IN A .GITIGNORE FILE
  */
  secret: 'keyboard cat', // The key for our cookie session

  /* 'resave', determines whether or not our session should be updated, 
      Even though a user may not have made a change to the session specifically
    We will keep 'resave' at 'false' so that we’re only saving our session whenever a change is directly made to it
  */
  resave: true, // we will leave it as 'true' as per tutorial

  /* 'saveUninitialized: true' will create a cookie and a session for us, whenever a user visits the page, even if they have not logged in
    If 'true', the session WILL be stored in the session store
      When do you want to enable this? When you want to be able to identify recurring visitors, for example.
      * In chrome devtools, a cookie is visibly made for everyone, even if you are not logged in
    If 'false', the session will NOT be stored in the session store
      session is "forgotten" at the end of the request
      Thus, prevent a lot of empty session objects being stored in the session store & saves memory
      * In chrome devtools, a cookie is NOT made for non-logged in visitors
        A cookie is made when you HAVE logged in
  */

  // 'true' - allow cookies to return to the frontend whether you are logged in or not
  // Creates a cookie for us whenever a user visits the page, even if they are not logged in
  saveUninitialized: true, 

  // cookie: { secure: true } // (from Github) - use if you are using HTTPS
})); // session secret

// 4.1 below block has been copied from the passport github to initialize passport
// 4.1 Initialize passport, allow us to make use of the different authentication strategies
app.use(passport.initialize());
/* 4.1 Allow passport to integrate with 'express-session'
  We will need this to test whether or not our user is logged in, using the session 
  We use this to control our "logging in", so we are using session cookies

This middleware is a Passport Strategy invoked on every request.
  ** If it finds a serialised user object in the session, it will consider this request authenticated. **
  */
app.use(passport.session()); // persistent login sessions

// 0.5 Send some text to the browser
/* 
Use app.get() to "match and handle a specific route when requested"
  Parameter 1: The path
    We use '/' AKA, localhost:5000 on our machine
  Parameter 2: callback function
    The callback provides 'req' request and 'res' response for us to use
    We will use the 'send' method that is attached to 'res' to display some text on the browser at path '/'
*/
app.get('/', (req, res) => {
    res.send('Welcome to Passport with Sequelize');
});

// 3.2.2 Mount the routes as middleware at path /site
// changed to blank
app.use('/', routes);

//4.1 load passport strategies

/* the module.exports from the below require(path) is a function
  We must invoke this function so we can use it as a simple 'code block'
  The function takes in 2 params:
    1. passport require()
    2. The DB table name name of sequelize.define()
      The variable 'model' holds ALL models inside of 'app/models/index.js'
        These model names come from sequelize.define('singularPostgresTableName', ...)
      Tacking on 'model.user' is the particular model name that the 'index.js' in "models" receives from user.js sequelize.define('user', ...)
*/

/* Want the user information to show up in a different data table?
  1. change 2nd param to models.newDBtableUser
  2. change (or create) a model of sequelize.define('newDBtableUser',...)
  Result:
    When saved: Your particular DB has a new table named 'newDBtableUsers'
    When ran: User information is POSTed in that table in the particular database
*/
require('./app/config/passport/passport.js')(passport, models.user);

// 0.3. Create a port
/*
If we host this application on a service, we will need process.env.PORT
  Otherwise '||' , we will listen to localhost:5000, '5000'
*/
const PORT = process.env.PORT || 5000;

// 0.4. Listen to the PORT
// If local, we will be listening on PORT '5000'
app.listen(PORT, (err) => {

  // 0.5 if the error is undefined (server is working), let the developer know in the console 
  if (!err) {
    /* 1.2 Create the database in postgres (the 'database' we used in our config.json)
      We just need to create the name, our models will automatically create our tables for EZ work
    If no error - Using the model path, look through all of our models and replicate them to the database */
    models.sequelize.sync()
      // 1.3 Send messages to developer, for whether or not the database is in sync with our models
      .then(() => {
      console.log('Nice! Database looks fine')
      })
      .catch((err) => {
      console.log(err, "Something went wrong with the Database Update!")
      });
    
    // 0.6 error is undefined - server is working properly
    console.log("Site is live");
  }
  // 0.7 if the error IS defined (server is not working), let the developer know in the console, and send in the error message
  else console.log(err)

});