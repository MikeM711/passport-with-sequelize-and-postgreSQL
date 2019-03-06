// 3.2.1 get 'router' off of express module

const express = require('express');

// const passport = require('passport');
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

// We want app/routes/index.js to have access to our routes inside this file when it uses require()
module.exports = router;