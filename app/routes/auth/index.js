// 3.2.1 get 'router' off of express module

const express = require('express');

// 4.1 Allow this file to use 'passport'
const passport = require('passport');
// const { User } = require('../../models');
// const hashPassword = require('../../utils/hashPassword');

const router = express.Router();

/* render the 'signup' handlebars view to the '/signup' route:
    AKA: '/site/auth/signup'
Create a GET route to display a view (GET can also fetch data from inside a database)
    Syntax: router.METHOD(PATH, HANDLER)
        PATH = URL /signup, AKA '/site/auth/signup'
        HANDLER = will be a res.render() of the handlebars 'signup' view
            - res.render() "Renders a view and sends the rendered HTML string to the client"
            - Remember: The application knows this because we set handlebars extensions as the default template engine
*/
router.get('/signup', (req, res) => {
    res.render('signup');
});

// 3.3.1 Do the same for the sign in page - '/site/auth/signin'
router.get('/signin', (req, res) => {
    res.render('signin')
})

// 4.3 Dashboard route

/* This is where the redirect will take the user if authentication, from '/signupPOST', is successful
    NOTE: This is a *Non-protected* dashboard route - Even users that AREN'T logged in, can access it (not good)
    We will need to change this to a *protected* route
*/
router.get('/dashboard', (req,res) => {
    res.render('dashboard')
})


/* 4.1 In the future we can make the POST request to '/signup', along with the GET request to '/signup'
    It's fine to have both at the same path
    Just make sure that signup.hbs form action 'path' matches the below POST path
*/

/* 4.1 Instead of (req,res) the callback function will be passport.authenticate()
    First param: The URL of the POST route must match the URL of the signup.hbs action: '/signupPOST'
    Second param: "Passport provides an authenticate() function, which is used as route middleware to authenticate requests."
        Use the passport middleware for authentication here
        First param: the local strategy custom name (if there is any)
            Inside passport.js of app/config/passport, we created a Local Strategy named: 'local-signup'
            We want to use that 'local-signup' block of code to authenticate our /signupPOST
        Second param: An object of redirects and flash message options
*/
router.post('/signupPOST', passport.authenticate('local-signup', {
    // 4.2 The below occurs when done() method is called inside deserialize with a defined 1st or 2nd param
    successRedirect: '/dashboard',
    failureRedirect: '/signup'
    }
));

// We want app/routes/index.js to have access to our routes inside this file when it uses require()
module.exports = router;