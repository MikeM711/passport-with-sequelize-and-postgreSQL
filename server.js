
// 0.1. Assign the express module to a variable 'express'
const express = require('express');

// 0.2. Initialize express and name it a variable 'app' 
const app = express();
 
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

  // if the error is undefined (server is working), let the developer know in the console 
  if (!err) {
    console.log("Site is live");
  }
  // if the error IS defined (server is not working), let the developer know in the console, and send in the error message
  else console.log(err)

});