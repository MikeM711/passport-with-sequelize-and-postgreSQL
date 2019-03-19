// 12.11 Google Authentication Model
/* Just like all other models - Models represent a collection
    We can use this model to interact with the collection to do stuff like:
        save recoreds, retrieve records, update them 

*/

module.exports = function (sequelize, Sequelize) {
    
    const UserExport = sequelize.define('user', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        username: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        googleId: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        // If we want to use the field below, not mandatory
        last_login: {
            type: Sequelize.DATE
        },

        // If we want to use the field below, not mandatory
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }

        })

        UserExport.associate = (models) => {
          UserExport.hasMany(models.todo, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
        }

    return UserExport;

}