var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Question = require("../models/question");
var request = require("request");
require('dotenv').config();

router.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password || !req.body.nickname) {
    res.json({success: false, msg: 'Please pass username, password and nickname.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      nickname: req.body.nickname
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      var token = jwt.sign(newUser, config.secret);
      // return the information including token as JSON
      res.json({
        success: true, 
        msg: 'Successful created new user.', 
        token: 'JWT ' + token, 
        userNickname: user.nickname
      });
    });
  }
});

router.post('/signin', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token, user: user.nickname});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});



router.post('/question', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body.answers[0]);
    var newQuestion = new Question();

    newQuestion.type = req.body.type;
    newQuestion.content = req.body.content;
    newQuestion.mood = req.body.mood;
    newQuestion.reason = req.body.reason;
    newQuestion.answers = [];
    console.log(newQuestion.answers);

    var answers = req.body.answers;

    for (var i = answers.length - 1; i >= 0; i--) {
      var answers_genres = [];
      
      if (answers[i].answer_genre) {
        var genres = answers[i].answer_genre;

        for (var j = genres.length - 1; j >= 0; j--) {
          answers_genres.push(
            {
              id: genres[j].id,
              title: genres[j].title,
            }
          );
        }
      }

      newQuestion.answers.push({
        answer_content: answers[i].answer_content,
        answer_mood: answers[i].answer_mood,
        answer_reason: answers[i].answer_reason,
        answer_genre: answers_genres
      });
      console.log(newQuestion.answers);
    }

    newQuestion.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Save question failed.', error : err});
      }
      res.json({success: true, msg: 'Successful created new question.'});
    });
  } else {
    return res.status(401).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/question/:filters', function(req, res) {
    var filters = JSON.parse(req.params.filters);

    Question.findOne({
      type: filters.type,
      mood: filters.mood,
      reason: filters.reason,
    }, function(err, question) {
      if (err) throw err;

      if (!question) {
        res.status(404).send({success: false, msg: 'Question not found.'});
      } else {
        res.json({success: true, question: question});
      }
    });
});

router.get('/search/:filters', function(req, res) {
  var filters = JSON.parse(req.params.filters);
  var page_nb = getRndInteger(1,5);
  var options = { method: 'GET',
    url: process.env.API_URL+'discover/'+filters.type,
    qs: 
     { with_genres: filters.genres.toString(),
       page: page_nb,
       include_video: 'false',
       include_adult: 'false',
       sort_by: 'popularity.desc',
       language: 'fr-FR',
       api_key: process.env.API_KEY },
    body: '{}' };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var movies = JSON.parse(body);
    res.json({success: true, movies: movies.results});
  });
});

router.get('/movie/:id', function(req, res) {
  var movie_id = JSON.parse(req.params.id);

  var options = { method: 'GET',
  url: process.env.API_URL+'movie/'+movie_id,
  qs: 
   { language: 'fr-FR',
     api_key: process.env.API_KEY },
  body: '{}' };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var movie = JSON.parse(body);
    res.json({success: true, movie: movie});
  });
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

getRndInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}


module.exports = router;
