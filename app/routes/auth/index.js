// 3.2.1 get 'router' off of express module

const express = require('express');

// 4.1 Allow this file to use 'passport'
const passport = require('passport');
// const { User } = require('../../models');
// const hashPassword = require('../../utils/hashPassword');

// 5.2 get 'todo' model from the "models" index.js
// { todo } is the same as model.todo
const { todo } = require('../../models')

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
    // 5.1 Grab the connect-flash error messages so we can display them on the "signup.hbs" view

    // When we click "sign up" submit button, we end up in the local-signup strategy ('/signupPOST' handler) immediately

    /*If we do NOT enter an email and password - execution IMMEDIATELY FAILS on the strategy
        Giving us: failureRedirect: '/signup'
        Passport MUST REQUIRE some type of 'username' AND 'password' in order to function
            Extra info: These 2 fields can have their names defaulted to different names in the first object of the strategy, if needed
                Using: usernameField: 'newFieldName1' and passwordField: 'newFieldName2'
    */
 
    /* Inside our "strategy", we can say: req.flash('arrayName','message stored in array')
        Right here, in our "routes", grab the messsages by saying:  req.flash('arrayName') - this is the literal array of error messages
            So, treat this as a literal array*/
    
    /* store the FIRST error message inside a variable and send it to the view
        Our application will stop executing at the first error it receives,
            so storing only the first error message makes sense */
    const errorMessage = req.flash('messages')[0]
    res.render('signup', {errorMessage});
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

// 5.1 This simple route works too!
router.get('/greet', (req,res) => {
    if(req.isAuthenticated()){
        const user = req.user
        res.send(`greetings ${user.firstname}, we are in this route!`)
    } else {
        res.send('sorry, you are not authenticated.')
    }
    
})

// 4.3 Dashboard route

/* This is where the redirect will take the user if authentication, from '/signupPOST', is successful
    NOTE: This is a *Non-protected* dashboard route - Even users that AREN'T logged in, can access it (not good)
    We will need to change this to a *protected* route
*/
/* 4.6 We create a new callback, and insert it behind the callback that renders the 'dashboard' view to the browser (req,res)=>{...}
    This extra callback "criteria" caused this route to become a *protected* route */
router.get('/dashboard', isLoggedIn, (req,res) => {

    // 4.4 specific user - database "row" information - from the "user" DB table
    // 'req.user' is equal to whatever was the 2nd parameter of the done() method inside deserializeUser
    const user = req.user
    /* If no "logout", user database information will be stored until another 'signup' is requested
        Meaning: the cookie session will not end until signup) */

    // 5.2 (Replaced by 8.) Fetch ALL of the todos (All "database row information" from the "todos" DB table with model.findAll()
    /* 8. (updated from 5.2) We will fetch all todos created by a particular 'user id' that created them 
        Get all "database row information" based on the 'id' of the current user - that matches the "todos" table 'userID' field
        We are able to get this information from the "todos" table "database row", 
            because we have a value for the 'userId' field (req.user.id) as part of the "database row information" that we have sent to the database('Model.create({data})'), 
            inside the POST of '/todoPOST' route handler
        We will use a specific form of 'model.findAll()' - where userId of "todos" table matches the value of the 'id' of the "users" table (req.user.id)
    */
    todo.findAll({
        where: {
            userId: user.id
        }
    })
        .then((userTodos) => {

            // initialize an object
            // 9. {todo: 'a todo', id: 'integer'}
            let TodoList = {};

            /* iterate through 'userTodos' - which is the "database information of every row of a certain id" 
                If a particular row has the 'userId' that matches the 'id' of "users" table, push that to an array 
            */

           /* 9. We need to send the 'id' into the view, so that a user can delete a todo if they wish
                A delete will work by sending a particular 'id' from the handlebars "view" to a router in the backend,
                    where that router is responsible for deleting rows inside a database table using an 'id' to search */
            for (let i = 0; i < userTodos.length; i++) {
                TodoList[i] = {
                    // below to display todos
                    todo: userTodos[i].todo,
                    // below to add to all form 'action' URLs
                    id: userTodos[i].id
                }
                // TodoList.push(userTodos[i].todo)
            }

            // render the 'dashboard' "view", with variables that you would like the view to have access to
            res.render('dashboard', { user, TodoList })
        })
        .catch((err) => {
            /* Execution will land here if database is [null]
                Execution will NOT land here if database is simply empty */
            console.log("Error finding all todos: ", err)
        })
        
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


// 4.1 Create a route handler for when a user, inside the signup.hbs "view", clicks the "submit" of the form, and the form 'action' begins
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

/* What exactly is happening on signup?
    1. User fills out some form information
        If all of the HTML validations are passed, the action goes to '/signupPOST' handler as a method of 'POST'
            As we are being sent to this URL, all <input> names and values are follow!
    2. Execution enters here, it goes right into the callback: passport.authenticate('local-signup',{...})
    3. Execution jumps right into passport.js 'local-signup' strategy
    4. Verify Callback function IMMEDIATELY looks for a 'username' and 'password' field as the <input> name
        We can override default with our OWN field names
            If you do this, make sure you modify the parameters in the Verify Callback Function to match "overridden default"
        If these field names have empty strings, execution comes back here and into failureRedirect
        Override default with 'passReqToCallback: true', to make use of the 'req' object
            If you do this, make sure you add the 'req' parameter to the Verify Callback Function
            Also, enable bodyParser so that we can grab MORE form information: 'req.body.formInputNameAttribute' !!
                We will now have access to more than just the 'username' and 'password' fields, gathered by the passport strategy!
    5. *create hash function with bCrypt, don't use it yet*
    6. Find the 'username' in the database - Check that the username IS unique - Model.findOne({where: {username: username}})
        If it doesn't exist (undefined return): the username is unique, continue with strategy
        If it does exist (defined return): the username is taken, write done() with a defined param1 or param3 to jump out of strategy
            Param 1: shows blank page on 'POST' URL that displays the variable
            Param 3: If inside the Verify Callback Function - Immediately enter failureRedirect with a req.flash() message (if we choose to use it)
        No real need for a .catch(), because success happens if the search finds something, or it searches every row
            Maybe for the case of no database, we may need a catch()?
    7. The user has input a unique username - hash the password with bCrypt
        Get user-inputted 'password' from the parameter of the Verify Callback function
    8. Create a data object, where that data object has data that matches our database table (model) of "User"
        "databaseField: valueOfField"
        Get 'username' from the parameter of the Verify Callback function
        Use "Hashed Password"
        Get other <input> values using req.body.formInputName
    9. Send the data to the database - Model.create(data)
        If success: the database table has OFFICIALLY added a row of information for the new user!
            Thus, we passed all of our constraints and validations inside our model!
            I want to say that we have successfully added the user to the database at this point
        If failure: We have a database validation error - which we set up in our "model"
            Supply done() a defined 1st param (immediate error) or 3rd param (if in verify callback function - failureRedirect) to exit out of this "passport system" as an error
    10. Database addition of the new user is successful
        Supply done() with a defined 2nd param to let passport know that it can keep going
        That 2nd parameter of done() will be supplied to passport.serializeUser
            If we are doing this appropriately, that 2nd param will be CONCISE user database information
    11. serializeUser has access to the 2nd param
            Send the User ID (made from the database) into the 2nd parameter of done(), to let passport know to continue
                That 2nd param will be the user.id
        With the help of app.use(session({ secret: 'secret key', ... })), we will be creating a cookie
    12. We enter deserializeUser - we currently have a cookie that has an authentication token
            If this passport process ends up being successful, 
                this "authentication token" on this cookie will allow access to all routes that have 'isAuthenticated()' criteria, until the user's session ends
    13. deserializeUser provides us with that same ID from inside the cookie, find that particular ID in the database
            Use: 'Model.findById(id)'
                Success is defined by finding the 'id', returning the full "database row information", 
                        or finishing the full 'id' search, thus returning nothing
                    If return is defined: We have found the 'user' in our database and we have access to the "db row information"
                    If return is undefined: We have not found the 'user' in our database
                        Not sure how execution would ever be able to make it here...
    14. We have found the 'user' in our database, take the returning "db row information", make it concise, 
        and send it as the 2nd param of the done() method to let passport know that it can continue
            The 'defined' 2nd param will be the concise user information, which is important for the next stage of passport
            Remember: we acquired the ID from the cookie, and we got the db information using that ID from the cookie
    15. Completing the passport system is a success
        Passport enters 'successRedirect' as long as the 2nd param of the done() of deserializing is defined
            That's the only criteria!!
        Whatever that 2nd parameter is, will be = 'req.user' inside ALL OF OUR ROUTES!!
            You can use 'req.user' anywhere that has the callback (req,res) => {...}
        Because this cookie and session are now working,  the cookie's "authentication token" 
            causes 'req.isAuthenticated()' to be 'true' throughout the entire session!
                It's like a key that will always unlock the 'req.isAuthenticated()' criteria
        Nice.
*/
router.post('/signupPOST', passport.authenticate('local-signup', {
    /* 4.2 Execution enters here when done() method is called inside deserialize, with a defined 2nd param
                Here, execution will enter 'successRedirect', regardless if the user information is correct or not
                    The 2nd param is defined, that's all that matters to be SUCCESSFUL!
            If we ever have a defined 3rd param inside Verify Callback: execution immediately enters here, under failureRedirect + req.flash() message (if we choose to use it)
            If we ever have a defined 1st param, this "authenticate system of stages" will IMMEDIATELY quit out all of all "stages"
                User will land on this URL '/signupPOST' with a blank page, rendering out the 1st param
        We get an instant failureRedirect if the user does not provide an email and password */
        /* done: 
            defined 1st param = error (instant failure, displays a blank screen with that variable on that web page, with the URL of the 'POST' request ), 
            defined 2nd param = Defined info, telling passport that it's ready to go to the next stage of passport with this particular information
                For deserailize: That particular defined info would be 'user data', which gets sent to the next stage of passport
            defined 3rd param = error (instant failure, but enters 'failureRedirect' (unlike Param1 which stays inside 'POST' URL) 
                with a req.flash('arrayName') variable that we can use )
        */
    /* User will be redirected to the below location with an "authenticated session" - isAuthenticated() = true;
        This 'req.isAuthenticated() = true', that lasts the whole session (thanks to passport), 
            helps execution pass through the "authenticated" criteria that a private route may have */
    successRedirect: '/dashboard',
    /* User will be redirected to the below location, with no change in authentication
        'req.isAuthenticated()' is still 'false' */
    failureRedirect: '/signup',
    /* use the below if you want to use the 3rd parameter of done() (error messages), 
        and be able to use req.flash('arrayName') to access these error messages 
        Criteria: connect-flash should be installed and initialized within the app first, and have 'passReqToCallback: true' inside strategy 
            and have the below 'failureFlash' */
    failureFlash: true 
    }
));

// 4.7 - similar to '/signupPOST' handler
// Create a route handler for when a user, inside the signin.hbs "view", clicks the "submit" of the form, and the form 'action' begins
// Again, just like /signupPOST: the router.post() path parameter should equal the 'action' path attribute in the signin.hbs "view"

/* What exactly is happening on signin? - *VERY* similar to 'local-signup' strategy
    1-4. is roughly the same
    5. *create a function to compare hash password in database with user's plain password using bCrypt, don't use it yet*
    6. Find the 'username' in the database - Check that the username IS unique - Model.findOne({where: {username: username}})
        In our case, we are using 'email'
        If email is found, we will continue the strategy
    7. The email is found, but does the password on the database equal the password from the user?
        Unhash the database password, using bCrypt, and compare it against the user's input 'password'
        Syntax: bCrypt.compareSync(plainTextPW, hash)
        If passwords compare, continue the strategy
    8. We know that the email is found in the database, and that the hash-password matches the plain-password
        *Exactly* like how we exited out of the strategy with 'local-signup':
            Supply done() with a defined 2nd param to let passport know that it can keep going
        That 2nd parameter of done() will be supplied to passport.serializeUser
            If we are doing this appropriately, that 2nd param will be CONCISE user database information
    10-15. exactly like 'local-signup'
        Whatever that 2nd parameter is inside deserializeUser, will be = 'req.user' inside ALL OF OUR ROUTES!!
                You can use 'req.user' anywhere that has the callback (req,res) => {...}
            Because this cookie and session are now working, the cookie's "authentication token" 
                causes 'req.isAuthenticated()' to be 'true' throughout the entire session!
                    It's like a key that will always unlock the 'req.isAuthenticated()' criteria
        Nice.
*/
router.post('/signinPOST', passport.authenticate('local-signin', {
    // 4.7 The below occurs when done() method is called inside deserialize with a defined 1st or 2nd param
        // defined 1st param: error (failure), with 1st param loaded on browser on the URL where the execution is currently running
        // defined 2nd param: defined 2nd param = user data (successRedirect)
        // defined 3rd param inside Verify Callback = failureRedirect 
    successRedirect: '/dashboard',
    failureRedirect: '/signin',
    failureFlash: true
    }
));

// 12.0 Authenticating request with Google OAuth

// 12.0 (12.8) sign in with /auth/google - 1st param of .get()
/* 12.8 Below router is responsible for showing the Google consent screen, and redirecting the user to the callback URL - '/auth/google/callback'
    When we go to the route '/auth/google', we want Passport to take control, to interact with Google, and send execution to Google consent screen
        2nd param of .get() - the callback to initialize will be passport's .authenticate() method
    passport.authenticate:
        1st param: Which strategy do we want to use to authenticate someone?
            Ans: the 'new GoogleStrategy', which is recognized as simply 'google'
        2nd param: declare 'scope' property inside an object
            'scope' tells passport what we want to retrieve from the user’s profile, in an array
                Do you want profile information? Emails? - More info about this in the Google API
            We will set the scope to ['profile']
    Complete:
        When user enters '/auth/google' URL, passport will take control, using passport.authenticate()
            Google Consent Screen, and will prompt the user with - "We want your profile information will you allow this app to get it?""
*/
router.get('/auth/google', passport.authenticate('google', {
    scope:['profile']
}));

// 12.8 Callback route for Google to redirect to
/* 12.8 The below router is responsible for handling the URL that '/auth/google' router has redirected us to (declared by passport.js - Google Strategy - 'callbackURL')
    Without the below router, after we sign in, we get the message: "Cannot GET /auth/google/callback" 
    If we say: (req,res) => {res.send('hello world')}, as the callback, we land on a page with a URL such as:
        "http://localhost:5000/auth/google/callback?code=4%2FEAEhMLeFaUUwvntvtfdmm...""
        This is a code that google is sending to us, we “Receive user details from provider (Google)”
        We can access this code, and passsport can use this code to then grab the information that we want
*/

/* 12.9 This router will facilitate the exchange of code (in the URL) for profile information, before we enter the "Passport callback function" inside passport.js
    We use passport.authenticate('google'), as an extra piece of middleware in this route
        This same callback was used inside the '/auth/google' router, what's the difference?
            Ans: The difference is, when execution reaches the callback, we have a code in the URL. Passport can see that we have that code!
            Passport sees the code and it knows that the execution has ALREADY BEEN to the Consent Screen!
        Execution goes straight to google and says: 
            "I have this code, this user said we can authenticate them using their Google profile. 
            So I’m here with my code, to get their profile information.” 
        So [Google] grabs that profile information and comes back.
            Before we enter our {redirects} - Google comes back with the profile information, the callback function is fired!
        [EXECUTION ENTERS THE PASSPORT CALLBACK FUNCTION inside passport.js]
    Redirects:
        If we enter all done() methods with a defined 2nd param, we will end up with 'successRedirect'
        If at any point execution enters a done() method with a defined 1st param, we immediately receive a blank screen with the 1st param displayed, on the URL that the execution was on
        If we enter done() with a true/defined 3rd param in Verify Callback Function, we end up with 'failureRedirect'
*/
router.get( '/auth/google/callback', passport.authenticate( 'google', { 
        successRedirect: '/dashboard',
        failureRedirect: '/auth/google/failure'
}));

// If something goes wrong (failureRedirect - entering a done() with a defined 3rd param in the Verify Callback Function), we will be redirected to this URL
router.get('/auth/google/failure', (req,res) => {
    res.send('Authentication failure')
})

// We want app/routes/index.js to have access to our routes inside this file when it uses require()
module.exports = router;