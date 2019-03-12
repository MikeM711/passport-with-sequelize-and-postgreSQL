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

/* 4.6 A second callback function for our '/dashboard' route handler
    This callback is just "extra criteria" for execution to reach the 'dashboard' view render method
        We will have this callback as the FIRST callback
        While rendering 'dashboard' view will be the SECOND (last) callback
            We are basically fitting this callback behind the "'dashboard' view render" callback
    If we want to, we can simply put this criteria inside the existing callback
        Having 2 callbacks seems more organized though
*/

/* Because we plan to enter ANOTHER callback after this callback, we must include the 3rd parameter 'next' along with 'req' and 'res'
    We enter the next callback with 'return next()'
*/
function isLoggedIn(req, res, next) {

    // Thanks to passport, we have access to the 'isAuthenticated' method on the 'req' object
    if (req.isAuthenticated())
        /* if 'isAuthenticated' is 'defined', enter the next callback
            This "extra criteria" makes this '/dashboard' route protected!
            The next callback is the callback we had initially (which "was" unprotected) - it simply renders out the view 'dashboard'
        */
        return next();
    // if 'isAuthenticated' is 'undefined', redirect the user to '/signin' URL page
    res.redirect('/signin');
}

// 4.3 Dashboard route

/* This is where the redirect will take the user if authentication, from '/signupPOST', is successful
    NOTE: This is a *Non-protected* dashboard route - Even users that AREN'T logged in, can access it (not good)
    We will need to change this to a *protected* route
*/
/* 4.6 We create a new callback, and insert it behind the callback that renders the 'dashboard' view to the browser (req,res)=>{...}
    This extra callback "criteria" caused this route to become a *protected* route */
router.get('/dashboard', isLoggedIn, (req,res) => {

    // 4.4 specific user - database "row" information
    const user = req.user
    /* If no "logout", user database information will be stored until another 'signup' is requested
        Meaning: the cookie session will not end until signup) */

    // 4.4 param2 sends specific user database information to the (param1) 'dashboard' view to use !!!
    res.render('dashboard',{user})
})

// 4.5 Logout route handler
router.get('/logout', (req, res) => {
    /* "To store or access session data, simply use the request property 'req.session',
        which is (generally) serialized as JSON by the store, 
        so nested objects are typically fine."
    */
    /* To end a session, use: req.session.destroy(callback)
        If successful, we will redirect to '/' - the homepage
     */
    /* session.destroy() "clears session data"
        Seems better to use than passport's 'req.logout'
    */
    req.session.destroy((err) => {
        res.redirect('/');
    })
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