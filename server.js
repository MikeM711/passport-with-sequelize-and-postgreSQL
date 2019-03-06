
// 0.1. Assign the express module to a variable 'express'
const express = require('express');

// 1.1 Create a path to our models
/* In COMPLETED "todo" project this is called "db"
    Best to have our app/config/config.json in our .gitignore
*/
const models = require("./app/models");

// 3.0 import handlebars
const exphbs = require('express-handlebars')

// 0.2. Initialize express and name it a variable 'app' 
const app = express();

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
// 3.4 use the '.hbs' engine we just created (1st param of app.engine)as the default view engine of our app
app.set('view engine', '.hbs');
 
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