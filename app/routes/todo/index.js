// 5.2 Created "todo" routes

/* Application can access this file, thanks to app/routes index.js file
  That file acts as a complete source of every route of this application
    That file gets required in the 'server.js' file
*/

const express = require('express');

// { todo } is the same as models.todo
const { todo } = require('../../models')

const router = express.Router();

/* A '/todoPOST' route handler to handle the 'action="/todoPOST"' of the form inside the 'dashboard' view
  Which is responsible for adding 'todos' to the "todos" database table */
router.post('/todoPOST',(req,res) => {

  // Create the data that will be inserted into the "todos" table, in the database
  // make sure syntax matches the database - databaseField: yourValues
  const data = {
    todo: req.body.todo
  }

  // Use sequelize Model.create({obj})
  todo.create(data)
    .then((todo) => {
      /* Execution is here if we have successfully added a 'todo' to the database
        'todo' should be a defined variable
          Let's go back to the /dashboard URL
      */
      if(todo){
        res.redirect('/dashboard')
      }
      
    })
    .catch((err) => {
      /* Why would execution be here?
        We failed to add data to the database
        Specifically: We failed the validation test to add data to the database
          Validation - from the todo "Model"
      Example: We send an empty 'todo'
        Problem: our todo "Model" has a 'validate: { notEmpty: true }' validation
          Execution enters here as a result of not being successful
      */
      console.log("Error with adding todo to database: ", err)
      res.redirect('/dashboard')
    })

})

// always export our routers, so that routes/index.js knows what to do
module.exports = router;