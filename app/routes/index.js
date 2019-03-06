/* 3.2.1
The router method we want to use is found inside the express module, we need to require it
    specifically: express.Router()
*/

const express = require('express');
const router = express.Router();

// to use my signup, you must use '/auth' - '/site/auth'

/* If file address is to a folder, express will look for index.js
    ./auth = ./auth/index
If you want express to look at a SPECIFIC file, use:
    ./auth/auth = "Express will look for auth.js inside 'auth' folder"
*/
router.use('/auth', require('./auth'));

/* Frontend GET, POST, UPDATE, DELETE routes: 
    router.use('/todo', require('./todo')); */

/* 
In order for require('./app/routes') to work inside server.js
    We must export the module with the line: module.exports
    What do we want server.js to have access to? The 'router' variable
*/
module.exports = router;