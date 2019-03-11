/* 
QUESTIONS:
    1. Can we substitute all 'notEmpty' for 'allowNull' validations?
    2. last_login timestamp equal to createdAt/updatedAt data types?
    3. Can we write validations with/witout the 'validations' object?
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
            - Can be empty, unless otherwise stated
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
            validation: don't allow empty strings
        */

        firstname: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        lastname: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        /* username/about:
            data type: character varying + no length limit
        */

        username: {
            type: Sequelize.TEXT
        },

        about: {
            type: Sequelize.TEXT
        },

        /* email:
            data type: character varying (255)
            validation: Check for email format (Ex: foo@bar.com)
                I want to say that you can use either a validation object, or just the 'isEmail' validation by itself...
        */

        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },

        /* password:
            data type: character varying (255)
            validation: don't allow null values
                This is typical for 'password' fields
        */

        password: {
            type: Sequelize.STRING,
            allowNull: false
        },

        /* last_login:
            data type: timestamp of an instance
                Question - Exactly the same as 'createdAt' and 'updatedAt'?
        */

        last_login: {
            type: Sequelize.DATE
        },

        /* status:
            data type: An ENUM, where we declared the only legal values
                The only allowed values are'active' and 'inactive'
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