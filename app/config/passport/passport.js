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

  // 4.2 serialize user - we enter here AFTER we called done() inside the "Verify Callback Function", with a DEFINED first or second parameter
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
          The only way to go to the next stage is if either the 1st or 2nd parameter is defined
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
            Inside passport, the function done() (if the 1st or 2nd param is defined) basically means "go to the next stage"
            In our case, we will supply with 'false' (2nd param), indicating authentication failure
              Along with that, we will display a flash message prompting the user to try again
            1st param is typically 'null'
              1st param is actually the error, if there is one
              If 1st param is a string, the URL will render that string to the user on the browser
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
                  done() supplies Passport with the user that authenticated - The 'newUser' "row information"
                */
               /* After calling done() with a DEFINED second parameter - the next stage is to serialize the user
                Execution will enter passport.serialize after this return (4.2)
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
            // After the above 'done()', execution will immediately end up inside the '/signinPOST' handler as "failureRedirect"

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
}