# MovieSpotterApi

Step to run locally:

* Clone this repo
* Run 'npm install'
* Run 'npm start'

In the folder "config", create a file named "database.js" and add in it those line : 
```
# config/database.js
module.exports = {
  'secret':'authsecret',
  'database': 'mongodb://localhost/yourdatabase'
};
```
Replace 'database' with your mongo database path and 'secret' with a secret word that will be used by passport.js
