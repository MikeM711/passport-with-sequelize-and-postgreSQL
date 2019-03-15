/* 3.2.1
The router method we want to use is found inside the express module, we need to require it
    specifically: express.Router()
*/

// 5.2 This file is responsible for combining all of our routes together, in a single source

const express = require('express');
const router = express.Router();

/* If file address is to a folder, express will look for index.js
    ./auth = ./auth/index
If you want express to look at a SPECIFIC file, use:
    ./auth/auth = "Express will look for auth.js inside 'auth' folder"
*/

router.use('/', require('./auth'));

/* 5.2 In order for the application to use the routes inside of the "todo" folder, 
    we need to require the path (just like 'auth'), with the line below: */
router.use('/', require('./todo'));

/* Frontend GET, POST, UPDATE, DELETE routes: 
    router.use('/todo', require('./todo')); */

/* 
In order for require('./app/routes') to work inside server.js
    We must export the module with the line: module.exports
    What do we want server.js to have access to? The 'router' variable
*/
module.exports = router;