/* 
QUESTIONS:
    1. Can we substitute all 'notEmpty' for 'allowNull' validations?
        ANS: 'null' and 'notEmpty' are two very different things
            '[null]' happens when a value is NOT sent to the database
            'empty' happens when a value is sent to the database, but nothing inside it
            Always use: 'allowNull: false' on all database fields where values are created on INITIAL 'POST' request
    2. last_login timestamp equal to createdAt/updatedAt data types?
        ANS: We didn't really do anything with 'last_login' - but probably it seems
    3. Can we write validations with/witout the 'validations' object?
        ANS: NO - WE MUST USE THE VALIDATIONS OBJECT FOR ALL 'validations'
            Good news: if we make changes to validate: {...} we don't need to delete/recreate our database table!
*/

/*
2.1 UTILITY:
This file gives us access to methods such as 
- findAll()
- create()
- update() 
- destroy()
*/

/* Our module will be automatically exported into index.js 'model', and will need the use of 'sequelize' and 'Sequelize' to work
    - sequelize to use the define() method
    - Sequelize to use the table field data types
The below 'module.export' line is used for ALL models
    I believe the "index" model file gives us the below parameters
*/
module.exports = function (sequelize, Sequelize) {

    /* 
    The name of the const variable will be the name of our model (capitalized & singular)
        Set our model = sequelize.define() to define mappings between model and table
            First param = SINGULAR name of the database table, as a string
                That singular name will become plural when inserted into postgres
                *This define() string is also the name of this model inside "models" index.js* 
                    So, when we require the "models" index.js as 'modelsRequire', we can say modelsRequire.ModelDefineStringName to have access to a particular model/table! (index.js creates this connection for us)
                    Now that we have access to a specific model, we can use Sequelize Model methods of editing and searching stuff in the database!
                If we were to change the string name, we will AUTOMATICALLY add a table to the database
            Second param = the sequelize model that represents the database table, as an object
                AKA: attributes/fields object
    If we say: sequelize.define('myTableofData', ...)
        And we saved - postgres will automatically create a table called: myTableofDatas
    */
    
    const User = sequelize.define('user', {

        /* Database field structure:
            - All have data types
            - Use validation whenever you can
                All validation must be set inside the validate: {} object
                Keep in mind, we use some validation inside our "view" (eventually becomes HTML) as well!
            - Always use: 'allowNull: false' on all database fields where values are created on INITIAL 'POST' request, 
                No validation object needed…
                All other fields (where values are not created initially): leave that out
        */

        /* id is our primary key, of a number (integer) that will increment up (autoIncrement)
            If not set, postgres will create one by itself */
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /* firstname/lastname: 
            data type: character varying (255)
        */

        firstname: {
            type: Sequelize.STRING,

            /* SITUATION: Inside postgres, pretend that this field is set "Not NULL?" to 'no' inside PostgreSQL - what if we want to change it to 'yes'?
                For our case, this "change" is something we should do - more constraints is a good thing
                    Even if we are sending an empty string, we are letting postgres know that values in this particular field EXISTS at INITIAL 'POST' request
                HOW TO DO IT: We need to fully delete our table in the database, if we want to switch "Not NULL?" from 'no' to 'yes'
                    1. Write 'allowNull: false'
                    2. Delete/drop the table in postgres pgadmin
                    3. Restart our application
                        If using nodemon - just "save" anywhere to restart
                    4. Disconnect database
                    5. Reconnect database - new table should automatically show up
            */
           allowNull: false,

            /* EXAMPLE: Create a validation, where the user CANNOT submit an empty 'firstname' field
                Use the "validate" object in order to make use of ANY validations
                Sequelize docs - we can use 'notEmpty: true'

            Answer: 
            // validate: {
            //     notEmpty: true,
            // }

            Result: The above validation will force the user to input something, if they want to sign up

            Theories: 
                We can also add this type of validation on the HTML-side as well, by using the 'required' attribute
                Sequelize does not recognize 'notEmpty: false', I don't think there's such a thing
                    If you want it as 'false' don't use it...
                Good news: if we make changes to validate: {...} we don't need to delete/recreate our database table!
            */
        },

        lastname: {
            type: Sequelize.STRING,
            allowNull: false,
            // In order to use 'notEmpty' validation, we MUST use the "validate" object
            // validate: {
            //     notEmpty: true,
            // }
            // The above will force the user to input something, if they want their stuff saved to the database
        },

        /* username/about:
            data type: character varying + no length limit
        */

        username: {
            type: Sequelize.TEXT,
            /* If we use 'allowNull: false' on this field, our table will NEVER work, 
                because singup.hbs currently does NOT include a "username" form input
                    Because "username" doesn't exist inside our initial form, and thus, when it initially is sent to the database, 
                        the field value will ALWAYS be [null] at first POST request, no matter what
                If we say - allowNull: false (AKA "Not NULL? = true" in Postgres), the database expects SOMETHING to be to be there, but that is IMPOSSIBLE
                    We are not sending "empty strings" (like lastname & firstname), 
                        we are sending literally NOTHING to the field
             */
        },

        about: {
            type: Sequelize.TEXT
        },

        /* email:
            data type: character varying (255)
            validation: Check for email format (Ex: foo@bar.com)
                You MUST use the validate object {}
                You *CANNOT* just use the 'isEmail' validation by itself...
        */

        email: {
            type: Sequelize.STRING,
            allowNull: false,
            /* SITUATIONS:
            1) If there is no 'isEmail' validation inside "validate object" (bad) AND signup.hbs email input attribute is 'type="text"' (bad):
                For an email with simple text: The user can sign up (bad)
            2) If there IS isEmail validation (good), but the email attribute = type="text" (does not stop the non-email from being sent - (bad) )
                For an email with simple text: The application won't stop at HTML, but it WILL server-side (it won't enter the database) (good)
            3) There IS 'isEmail' validation (good) AND signup.hbs email input attribute is 'type="email"' (good):
                We have 2 safety nets: email validation of HTML and validation of server-side
                    So, it seems, 'validate: {isEmail: true}' isn't REALLY needed
                For an email with simple text: The application will stop at HTML, before execution moves server-side 
            */

            /* 
                SITUATION: Back to #1 for above - no validation on HTML or in this model
                    We may be able to use simple text as "emails", but what if we enter a BLANK email?

                ANSWER: The passport strategy doesn't let us continue without an 'email' - no empty strings
                    Remember: For passport, we swiched the defaults from 'username' -> 'email' field before the Verify Callback function
                    That being said, if "email" is blank, under the conditions of #1 and the form is submitted: 
                        1. The form submit forces execution to enter /signupPOST
                        2. Execution will enter the passport.authenticate's 'local-signin' callback
                        3. Execution will say, "Wait, the default we set {usernameField: 'email'} is empty! (remember?)"
                        4. 'local-signin' immediately fails, and enters 'failureRedirect'
            */
            validate: {
                isEmail: true
            }
        },

        /* password:
            data type: character varying (255)
            Don't allow null values - allowNull: false
                This is typical for 'password' fields, as the initial POST request to the database must have a type of username/password to start,
                    when it comes to authenticated websites
            validate: {no empty strings}
        */

        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
            /* Some theory:
                Remember, just like with "email", the passport strategy doesn't let us continue without a password
                Safety nets:
                    1. HTML of password <input> has 'required' attribute
                    2. validate: {notEmtpy: true}
                    3. Passport strategy doesn't continue without a password - immediately enters the 'failureRedirect' 
            */
        },

        last_login: {
            type: Sequelize.DATE
        },

        /* status:
            data type: An ENUM, where we declared the only legal values
                The only allowed values are 'active' and 'inactive'
            model definition: When a user logs in, they will be 'active' 
        */

        // Just for visual purposes - looks like the completed todo list doesn't even use this
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }

        /*
        Sequelize will then automatically add the attributes 'createdAt' and 'updatedAt' to this model, and thus, to the database
        */

    });

    // Return the variable out of the function
    return User;

}