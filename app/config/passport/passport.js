// 4.1 load bcrypt to hash the incoming password that the user provides us
const bCrypt = require('bcrypt-nodejs');

/* "module exports block" - this file exports out a function
  Think of it like inserting this "chunk" into server.js */
module.exports = function (passport, user) {

  /* We receive the "model" user as an argument, from where the require was initiated (server.js)
    user is models.user 
    Set the user "model" = User */
  const User = user;
  
  /* initialize the passport-local strategy
    Set the instance to the variable: 'LocalStrategy' */
  const LocalStrategy = require('passport-local').Strategy;

  // 12.0 - Import Google Strategy into application
  const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

  // 12.7 Import private keys from key.js inside "config" folder - we will '.gitignore' this file, and have the developer make it themselves for security purposes

  const keys = require('../keys.js') || null
  // /* HEROKU: If localhost - require keys.js | If Heroku - DON'T require keys.js */
  // // keys.js - figure out what set of credentials to return
  // if (process.env.NODE_ENV === 'production') {
  //   // Execution is in production
  // } else {
  //   // Execution in development - return the dev keys
  //   // We will use 'var' because, unlike 'const/let', 'var' is not limited to block scope {...}
  //   var keys = require('../keys.js')
  // }

  // 4.2 serialize user - we enter here AFTER we called done() inside the "Verify Callback Function", with a DEFINED second parameter
  // Serializing: This function will take a piece of information, from our record (database), and pass it on to "stuff it" in a cookie

  /* 
    Cookies:
      Cookies & Authentication
        ** Cookies tell the website that you are logged in, that you are authenticated **
          Specifically: "A token allows for authentication, this token is stored in a cookie, and is sent back with each subsequent request" 
          Now that the browser has this cookie, every time the browser makes a request to your website (server) in the future, 
            it will SEND the cookie back to the server, with the token as well!
          "The server receives every request that requires authentication and uses the token to authenticate the user (!) and return the requested data back to the client application."
        For example, on the completion of an authentication process you will set an encrypted cookie containing details of the user to be presented with each subsequent request. 

      As long as we go through all of the proper done() methods (regardless if the user information is correct or not, and errors are 'null'),
        the user will be authenticated, telling the whole application that - isAuthenticated() = 'true'
      Serialization sends out user info to "stuff" into a cookie
      Deserialization provides us with that same ID from inside the cookie, which is the ID of the authenticated user (database "row" information)
        When completed, we have a cookie stored in our browser with an authentication token and user id
          If we didn’t have correct user id info, we will STILL have a cookie with an authentication token
        Inside deserialize, we found the matching 'id' value in our database, and we put the CONCISE "database row information" as the 2nd param in the done() method
          From there, we can get this "database row information" off of req.user for this "concise" DB row information AND we enter the OBJECT portion (redirect/flash messages) of the strategy in "routes"
            req.user = 2nd param of deserializeUser done() method
            EXPERIMENT: if 2nd param of deserializeUser done() = 24, then req.user in all "routes" = 24

      Extra notes:
        On any website that we are "logged in", if we delete the cookie, we log out - we aren't authenticated 
          Deleted cookie = deleted access token
        Sessions are usually implemented using cookies
        For our app - we know that we are authenticated when we redirect to /dashboard!
      When it comes to sending data from a server:
        "Data cannot be trusted just like any client input can't, 
          so in practice people often just send a session ID and store the actual data that you might not want people to tamper with on the server side."
    tl;dr: all cookies have a token for authentication, regardless if there is any 'user_id' "stuffed" in the cookie
  */
 
  passport.serializeUser(function (user, done) {
    // All of our strategies "dump" the execution into here, from the "Verify Callback Function" of our strategies
    // We enter here due to done() having a defined 2nd param, inside the "Verify Callback Function" of one of our strategies 

    /* user is a big unorganized blob of database information
      We only want to grab a PIECE of identifying information from that user - Just the ID
      If we use: user.id is a PERFECT ID NUMBER!
    */
    /* we are saving the user 'id' to the session
        done() will pass that 'id' off somewhere else, and we will "stuff" that 'id' in a cookie
      The next stage: We want to jam 'user.id' into a cookie, and SEND IT to the browser */
      /* EXPERIMENT: if we say 'done('serialize error', false);' signupPOST URL will say: 'serialize error'
        Dashboard does not work! - Therefore, user has not been authenticated yet
          Makes sense - cookie has not been created yet
          On refresh, the site will work as if the user has not logged in
      */
     
    // if 'done(null, false, true)' - messy URL + "Error: Failed to serialize user into session"
    done(null, user.id);
  });

  // 4.2 deserialize user
  /* Since passport.serializeUser - we created a unique cookie, sent it to the browser, and the browser stored the cookie
    When the cookie comes back to us from the browser, and on the server, we do the following: */
  passport.deserializeUser(function (id, done) {
    /* Inside here, it is our job to get the user from the 'id' parameter
      With the help of the 'User' Sequelize Model, we search for that returning 'id' from the cookie 
    */

    /* use the sequelize method findById() and pass in the 'id'
      This async task returns a promise, where success is either:
        1) Finds the 'id'
        2) Searches through the full database
    */
    User.findById(id).then(function (user) {

      /* If 'user' is found in the database, use the done() method to go to the next stage of passport
          The only way to go to the next stage is if either the 2nd parameter is defined
        Inside the done() 
          Param1: No error to report - so pass in 'null'
            If string was passed into Param1, it will render to that screen on the POST URL
          Param2: pass in the defined 'user' BUT with concise database information: 'user.get()'
            'user.get()' returns user "Row database information", where we can say something like user.firstname and we will get the 'firstname' value from the database
      */
      if (user) {
        // GOAL: below will attach the 'user' property to the 'request' (req) object inside the routes !!!

        /* EXPERIMENT: if we say: done('deserialize error', false); 
          We end up on /dashboard URL with string 'deserialize error', string will show up on EVERY page
          Since this experiment landed on /dashboard, we can assume that the user has been psuedo-authenticated (?) 
            However, the passport "flow" has not been completed (we need to get out of deserialization)
        */
        /* If second parameter is 'true' we can access the whole app as isAuthenticated() = true! 
          We just can't receive proper user information that way */
        // When done() is called with a defined second parameter, we enter the OBJECT of the local strategy in our route
        // WHATEVER IS THE 2ND PARAMETER IS = 'req.user' in "routes"

        /* If 'done(null, false, true)' - we land on /signin# (even with Google OAuth)
          Most likely because we enter the 'isLoggedInFunction' inside "routes", and if we are not authenticated, we get redirected to '/signin'*/
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });

  /* OUR LOCAL STRATEGIES (2) BELOW */

  /* (1) LOCAL-SIGNUP STRATEGY*/

  // define our custom strategy with our instance of 'LocalStrategy'

  /* 'local-signup' is the name of our Local Strategy 
    Use this particular Local Strategy in locations of your app where you wish to run this specific authentication code below 
      Obviously, we want to use this 'local-signup' in the POST request of the same 'path' that signup.hbs form action 'path' is going to*/
  
  /* passport.use()
      Param 1 (optional): Name of the strategy
        We are using named strategies since we have one for login and one for signup
        By default, if there was no name, it would just be called 'local'
      Param 2: the LocalStrategy callback
  */
  passport.use('local-signup', new LocalStrategy(
    /* OPTIONAL: modify the default of LocalStrategy with the following object 
      Future me: I will probably be modifying the default of LocalStrategy a lot because 'req' is VERY USEFUL AND IMPORTANT
    */

    /* These "Field" values are equal to the <input> names inside of signup.hbs that we receive as a POST request
      If the signup.hbs names are NOT equal to the default, we will have to explitly state it in the object below
    If our attributes are "email" and "password" and no other form information else needs to be sent, we can get rid of the below object
      If we need more form information, we will need to moidfy the default to allow 'req' - passReqToCallback: true
    */
    {
      usernameField: 'email', // Default: 'username'
      passwordField: 'password', // Default: 'password' 
        /* THEORY: Meaning, we don't NEED this 'passwordField' in here
          We are aleady using the default */
      passReqToCallback: true
      /* Allows us to pass back the entire request to the callback, 
        Therefore, we can use 'req' as a parameter in the verify callback function */
    },

    // The Verify Callback Function
    
    /* In this function, we will handle the storing of a user's details.
      We will check to see if the 
      Local Strategy will will find credentials in the parameters: 'email' (modified from the default 'username') and 'password'
      We can use 'req' because set 'passReqToCallback: true' above */
    function (req, email, password, done) {
      // here, we have access to all of the user's form data

      /* A hashed password generating function:
        Used when a user signs up and has passed the email validation
          Meaning, the email is not found in the database, therefore, is able to be used
      */

      // It is recommended to use bCrypt's 'async way' in the future
      const generateHash = (password) => {
        /* Syntax: bCrypt.hashSync(plain_password, # salt rounds)
          "salt round" = cost factor = time needed to calculate the hash*/
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8));
      };

      /* Using the Sequelize user model we initialized earlier as User, 
        We check to see if the user already exists, and if not we add them. */

      // Remember: all Sequelize functions are promises
      // Sequelize model '.findOne()' method
      User.findOne({
        // 'where:{obj}' always used inside findOne()
        where: {
          // match "database email" with "user input email"
          email: email
        }

      }).then(function (user) {
        /* If a match is found: 'user' will be definied
          If NO match is found: 'user' will NOT be definied
        */

        if (user) {
          /* If user is 'defined' - that means we have found the email in the database
            Therefore, this information CANNOT be used, as it is taken */

          /* done() supplies Passport with the user (2nd param) that authenticated.
            Inside passport, the function done() (2nd param is defined) basically means "go to the next stage"
            In our case, we will supply with 'false' (2nd param), indicating authentication failure
              Along with that, we will display a flash message prompting the user to try again
            1st param is typically 'null'
              1st param is actually the error, if there is one
              If 1st param is a string, the URL will render that string to the user on the browser at whatever URL execution is currently on (NOT FAILURE-REDIRECT)
            * A defined (or true) 3rd param in this Verify Callback Function = failureRedirect!
          */
         
          return done(null, false, {
            message: 'That email is already taken'
          });

        } else {
          /* 'user' is not defined
            Therefore this email is not currently in the database
            This email is acceptable! Let's see if we can add it into the database!
          */

          /* Turn the plain password into gibberish for security
            Future: We'll use bCrypt again to turn the gibberish back to plain text when the user signs in
          */
          const userPassword = generateHash(password);
          
          /* We are able to use req.body because:
              1. Our app has BodyParser
              2. The default of LocalStrategy has been modified with: 'passReqToCallback: true'
              3. Our Verify callback function has 'req' parameter 
          */

         // below data must match our database table (model) of "User"
          const data =
            {
              // databaseField: valueOfField
              email: email,
              password: userPassword,
              firstname: req.body.firstname,
              lastname: req.body.lastname
            };

          /* Send the 'data' object, in the format of the User table (model) into the database
            Use sequelize model '.create()' method
          */

          User.create(data)
            .then(function (newUser) {
              /* At this point, if "newUser" is defined - the database table has OFFICIALLY added a row of information for the new user!
                  Execution lands here when we passed all of our constraints and validations inside our model!
                  Remember, the "database" constraints/validations are an exact copy of the "model" constraints/validations 
              */

              /* The last part of our strategy:
                Was the user successfully added to the database?
              */

              /* The 'create' method is completed
                Did the database create the user?
                The first param of .then() will be the entire database row that was just added in
                  We could say that this row represents a 'newUser' of our application
                  Was a new user successfully added in?
                    If yes: authenticate the user
                      2nd param: insert the new user
                    If no: indicate authentication failure
                      2nd param: 'false'
              */

              /* If the database did NOT add a new user:
                We know this because the '.create()' did NOT return the brand new database row of 'user' information
                  USER INFORMATION *UNSUCCESSFULLY* ADDED TO DATABASE
              */
              if (!newUser) {

                // Not exactly sure how execution may end up here if it didn't add anything to the database
                return done(null, false);
              }

              /* If the database DID add a new user:
                We know this because the '.create()' returned the brand new database row of 'user' information!
                  USER INFORMATION *SUCCESSFULLY* ADDED TO DATABASE
              */
              if (newUser) {
                /* At this point, this user has valid credentials
                  done() supplies Passport ('serializeUser') with the user that authenticated (2nd param) - The 'newUser' "row information"
                */
               /* After calling done() with a DEFINED second parameter - the next stage is to serialize the user
                Execution will enter passport.serializeUser after this return (4.2)
                  Theory: execution will also enter if 1st param was definined (an error)
               */
                return done(null, newUser);
              }

            /* 5.1 Thanks to debugger, I found where I needed my "catch"
              For the case if email is not "@something.com" 
                We can also use type="email" for email input field in the "view"*/
          }).catch((err) => {
            /* Execution is in here when we get a database validation error, 
              these "errors" are our validations which we set up in our models! 
              We must have a .catch() so that the application doesn't crash, and we can move the error along*/
            console.log('Database validation error: ', err)

            /* 5.1 2 ways of displaying errors:
              1) The first parameter you provide to done() is what you want to show on screen, if you want to show an error that way
                We immediately enter '/signinPOST' URL, and load the page with the variable of the 1st parameter
                  We don't Use ANY redirect, we just use this URL '/signinPOST' to display the error
                In our case: we don't need this, we just want to be redirected to the signin, so we will use 'null' 
              2) With the help of connect-flash we can send messages so that they are accessible inside our routes
                3rd param syntax: req.flash('arrayName','message stored in array')
                This time, we actually get to the 'failureRedirect', unlike 1), and we have extra req info that we can use as well!
            */
            done(null, false, req.flash('messages','error, signup is incorrect!'));
            // After the above 'done()', execution will immediately end up inside the '/signinPOST' handler as "failureRedirect" !!!

          })

        }

      });

    }

  ));

  /* 4.7 (2) LOCAL-SIGNIN STRATEGY*/

  // copy/paste beginning of the First strategy:

  passport.use('local-signin', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, email, password, done) {
      // end of copy/paste

      /* Function will compare "plain text password" with "hash" 
        return 'true' if there's a comparison, 'false' if no comparison
      */
      var isValidPassword = function (userpass, password) {
        // below will instantly provide us with 'true' or 'false'
        // bCrypt.compareSync(plainTextPW, hash)
        return bCrypt.compareSync(password, userpass);
      }

      // Can we find the email in the database?
      User.findOne({
        where: {
          email: email
        }
      }).then(function (user) {
        // If no 'user' is found in the database, the user does not exist
        if (!user) {
          return done(null, false, {
            message: 'Email does not exist'
          });
        }

        // Exeuction is here if a user is found

        /* if the "plain text password" and "hash" do NOT compare inside 'comparesync' of the 'isValidPassword' function, 
          the password the user has typed in is incorrect */
        if (!isValidPassword(user.password, password)) {
          return done(null, false, {
            message: 'Incorrect password.'
          });
        }

        // Execution is here if user is found AND password matches

        // acquire ALL of the user info from the database "row"
        const userinfo = user.get();
        // send ALL of the user info to the next stage of passport, which is inside passport.serialize
        return done(null, userinfo);

      }).catch(function (err) {
        // Me - I think execution ends up here if it can't find the database table to search?

        console.log("Error:", err);

        return done(null, false, {
          message: 'Something went wrong with your Signin'
        });
      });
    }
  ));

    // 12.0 GOOGLE OAUTH 2.0 STRATEGY

    /* Heroku - Environment Variables
      When we create this application on Heroku, we want our Heroku and Github repos to have synced code
        That being said, our "keys.js" file MUST be ignorned for BOTH Github and Heroku repos
      Locally: we get our keys from key.js
      Heroku: we get our keys from settings > config vars
        1. write: process.env.ENVIRONMENT_VARIABLE
        2. Inside Heroku: set a value for 'ENVIRONMENT_VARIABLE'
      We will put BOTH key-location options inside ONE variable
        Ex: const EnvOrLocalKey = process.env.GOOGLE_CLIENT_KEY || keys.google.clientID
        The 'Environment Variable' must come first!
          If there is no 'Environment Variable' (situation: localhost), check for keys inside keys.js
    */
    const clientIdKey = process.env.GOOGLE_CLIENT_KEY || keys.google.clientID
    const clientSecretKey = process.env.GOOGLE_SECRET_KEY || keys.google.clientSecret

    // 12.0 copy/paste from passport site
  passport.use(new GoogleStrategy({
    // 12.7 1st param: Options for google strategy - Created for us in "Console Developers" in Google, and enabled the Google+ API
    /* Heroku 
      The value of Google clientID and clientSecret properties is set to the variable that holds both key-location options
      Heroku NEEDS to identify these values as a string, so use backticks (``) and backtick syntax: `${variable_in_a_string}`
    */
    clientID: `${clientIdKey}`,
    clientSecret: `${clientSecretKey}`,
    // 12.8 do not put in "localhost" for callback URL, put in the URL PATH relative to where the application is served
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
    /* 12.9 2nd param: Passport callback function
        This is the function that fires when execution comes back with the actual information about the profile from Google 
        Index.js in "routes" - In that picture from Net Ninja - that piece of middleware, passport.authenticate(), belongs to the stage: 
          “get code from google in the redirect URI”. 
          Execution goes out and grabs in the info “exchange code for profile info”, 
            and “FIRES the Passport callback function” upon entry to the application in this file - passport.js, before we execute the redirects.
        If this passport callbackfunction was not filled - Our Google Consent Screen would be "hanging", browser-side
    */

    /* 12.9 Passpport callback function params: Copy/paste from Google OAuth 2.0 strategy
  
      1. request
        AKA req, we can use this because of bodyParser
      2. accessToken
        A token we receive from google - so that if we want to go back and, maybe, alter the user’s profile, 
            (ie: go into their mailbox, read their emails), we can use that access token to that
          Because we got it from Google
          The user granted us permission to that on the Consent Screen
        Won’t really be used in our tutorial
      3. refreshToken
        To refresh the accessToken, because the accessToken expires after a certain amount of time 
        Won’t really be used in our tutorial
      4. profile
        The profile information that passport comes back with when it takes that code to Google (in index.js in "routes"), 
            (that URL code) and it BRINGS BACK that profile information [from Google].
        * If we console.log this inside here, we get stuff like -  unique Google ID, display name, name, family name,
          photos/avatar, gender (if used), json object with more information '_json:  {...}'
      5. done 
        A function we need to call when we are done with this callback function
    */

    function (request, accessToken, refreshToken, profile, done) {
      // We are only using the 'profile' and 'done' params in this callback as of 12.15+

      //console.log(profile)

      const googleId = profile.id
      const username = profile.displayName

      // 12.12/12.13 - Is the user's unique Google id in our database?
      User.findOne({
        where: {
          googleId: googleId
        }
      })
        .then((user) => {

          // If user exists, enter 'serializeUser'
          if(user){
            console.log('user exists!')
            
            // 12.15+ - Return existing user to 'serializeUser'
            // If 'return done(null, false, true)' = failureRedirect
            // If 'return done(true, false)' = messy URL + 'true' on blank page
            return done(null, user);
          }

          /* If the user doesn't exist, make a record of them, their Google ID, and other Google profile information you wish to grab
            We plan to store this information on our own database */
          if(!user){
            console.log(" user doesn't exist!")

            // data to be stored on our own database about the particular user, represented by a "database row"
            const data = {
              username: username,
              googleId: googleId
            }

            //12.12/12.13 - If Google ID is not found, create the ID and its user in our own database
            User.create(data)
              .then((newUser) => {
                console.log('User has been successfully added to database: ', newUser)
                /*
                Send one piece of identifying information that we can use from the particular user’s record
                  Question: Can we send the googleId into the cookie?
                    Answer: No. Not everyone who signs up to our application will have a Google ID. 
                      Only people who login or signup with Google will have that property. 
                      Other people may have a facebook ID, or github ID.
                  Instead, use the ID of our “users” table, the primaryKey - AKA the ID of our "user" from our OWN database
                    Much ike we did with the 'local' authentication
                */

                // 12.15+ - Return the "newly-added user" in the database, to 'serializeUser'
                return done(null, newUser);

              })
              .catch((err) => {
                console.log('User was not added to the database: ', err)
              })

          }

          // if user doesn't exist, do something
        })
        .catch((err) => {
          console.log('Failed to search for user in database: ', err)
        })

    }
  ));

}