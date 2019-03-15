/* 5.2 - Adding a "todo" Model
    Thus, a "todos" PostgreSQL table
    Model file = a singular name
*/

module.exports = function (sequelize, Sequelize) {

    /* The const variable is responsible for encapsulating this entire model and sending it out as an export
            It's only used in here, that is it.
        For the define('modelName',{...}) - 'modelName' is how we call the database table within our application 
    */
    const TodoExport = sequelize.define('todo', {

        // Always have some sort of ID for postgres
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        todo: {
            type: Sequelize.STRING,
            allowNull: false,
            // Don't allow empty todos
            validate: {
                notEmpty: true,
            }
        },

        // 'allowNull: false' because the first 'POST' request to the table will always have a value for the 'todo' field

        /*
        Sequelize will then automatically add the attributes 'createdAt' and 'updatedAt' to this model, and thus, to the database
        */

    });

    // Return the variable out of the function
    return TodoExport;

}