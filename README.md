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

In this project I am using The Movie Database API. 
So you will need to create your own TMDB account and then put your API key in a file named ".env" like this :
```
# .env
API_URL=https://api.themoviedb.org/3/
API_TOKEN=yourAPIKey
```