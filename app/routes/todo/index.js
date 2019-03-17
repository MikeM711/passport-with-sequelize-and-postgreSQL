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

  /* 7. Thanks to passport completing its entire system,
    AND making the 2nd parameter of done() inside deserializeUser defined AND equal to the particular 'user' "row information" in the database)
      We have access to that "row information" on 'req.user'
        Whether that information is correct or not - in our case, it is correct
    Below is our "id" from the "users" table, that we will store inside the "userId" field in the "todos" table! 
  */
  const { id } = req.user;

  /* 7. The new database field: 'userId'
    This 'userId' field will be equal to the 'id' of the user who made it!
  */
  const data = {
    todo: req.body.todo,
    userId: id
  }

  // Add the new 'todo' "row information" to the database - Use sequelize Model.create({obj})
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

// Frontend HTML forms cannot send DELETE methods to backend router, this POST will handle a database DELETE
// Any action that has '/delete/ + anyString' will enter this router, thanks to the colon ':'
router.post('/delete/:id', (req,res) => {

  // Execution is entering this handler in the form of a URL named: '/delete/{{someTodoId}}'
  // We can grab values off of the URL using 'req.params'
  // Because we wrote ':id' as the URL for this handler, this allows the 'id' variable to attach to req.params - thus, req.params.id 
  // this 'id' has the value of WHATEVER comes after /delete/ in the URL  
  const id = req.params.id

  // Using Model.destroy({where: {field:value}}), we will delete that particular id off the database
  todo.destroy({
    where: {
      id: id
    }
  })
  // The following is not MANDATORY, but helps with safety!
    .then((deletedItem) => {
      if (deletedItem) {
        res.redirect('/dashboard')
      } else {
        console.log('error: todo was not deleted inside database')
      }
    })
    .catch((err) => {
      console.log('there was an error in deleting your item: ', err)
    })
  
})

// a POST request for PUT, very similar to a POST request for DELETE - HTML forms can only send GET and POST
router.post('/put/:id', (req, res) => {

  // The updated particular "todo", provided by the user on the "todo-edit" form, and its 'id'
  const todoId = req.params.id
  const todoContent = req.body.todoEdit

  // Data object of the updated todo, to be sent into Model.update()
  /* Below works without the userId param! 
      Why? because Model.update() does not destroy the full database row, it simply overwrites the fields you explicitly say */
  const updatedTodo = {
    todo: todoContent,
    // userId: userId
  }

  // Model.update({updatedTodo, where: {...}})
  todo.update(updatedTodo, {
    where: {
      id: todoId
    }
  })
    .then(([rowsUpdated]) => {
      // If successful, promise returns a parameter of the number of rows updated
      // the parameter is of type: array

      // Extra security: if rowsUpdated = 1, redirect to dashboard
      if(rowsUpdated === 1){
        res.redirect('/dashboard')
      } else {
        console.log('no rows have been updated')
      }
 
    })
    .catch((err) => {
      console.log('Update Error: ', err)

    })

})

// always export our routers, so that routes/index.js knows what to do
module.exports = router;