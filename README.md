# passport-with-sequelize-and-postgreSQL
An extremely simple, passport with sequelize and postgreSQL, application

I am using this article - [Tutsplus - Using Passport With Sequelize and MySQL](https://code.tutsplus.com/tutorials/using-passport-with-sequelize-and-mysql--cms-27537) - to create our passport/sequelize/SQL application

I have expanded upon this tutorial, with:
- The ability to use flash messages
- Correct database field validations
- More HTML validations
- More constraints and restrictions of database fields for better security + a Foreign Key relationship between tables
- A Full CRUD application that features a todo list
  - Todo list displays only the todos that a particular user has created
- Now uses Google OAuth 2.0!

## Installation

1. `git clone` repo
2. `npm install`
3. Fill in `config.json` with correct credentials:

```
{
  "development": {
      "username": "your_DB_username",
      "password": "your_DB_pw",
      "database": "your_DB_name",
      "host": "127.0.0.1",
      "dialect": "postgres"
  },
 ...
 }
```
4. Register your application on [Google Console Developers](https://console.developers.google.com/). Make sure your Callback URI is `/auth/google/callback`.
5. Create `keys.js` inside the directory: `app/config` with your `clientID` and `clientSecret` received from Google console Developers.

```
module.exports = {
  google: {
    clientID: "client_id_from_google.apps.googleusercontent.com",
    clientSecret:"client_secret_from_google"
  }
}
```
6. Run application: `npm run dev` to run nodemon