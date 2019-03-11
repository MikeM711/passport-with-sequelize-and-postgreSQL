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
  passport.serializeUser(function (user, done) {
    /* user is a big unorganized blob of database information
      We only want to grab a PIECE of identifying information from that user - Just the ID
      If we use: user.id is a PERFECT ID NUMBER!
    */
    /* we are saving the user 'id' to the session
        done() will pass that 'id' off somewhere else, and we will "stuff" that 'id' in a cookie
      The next stage: We want to jam 'user.id' into a cookie, and SEND IT to the browser */
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
          Param2: pass in the defined 'user' BUT with conscice database information: 'user.get()'
            'user.get()' returns user "Row database information", where we can say something like user.firstname and we will get the 'firstname' value from the database
      */
      if (user) {
        // GOAL: below will attach the 'user' property to the 'request' (req) object inside the routes !!!
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });

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

              /* The last part of our strategy:
                Was the user successfully added to the database?
                In other words, were all of the required fields filled out?
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

                /* Execution may end up here for following situation:
                  An email was not found (good), BUT we have mandatory fields that MUST be filled PROPERLY (bad - if you didn't do this)
                    user.js "model" may have some required validation that must be met in order to be placed inside the database
                      Example: 'notEmpty: true' inside some field of user.js model
                */
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

          });

        }

      });

    }

  ));

}