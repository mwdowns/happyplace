const mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      bluebird = require('bluebird'),
      express = require('express'),
      app = express(),
      uuid = require('uuid'),
      bcrypt = require('bcrypt'),
      salt = 12;


mongoose.Promise = bluebird;
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost/happyplace_db');

const User = mongoose.model('User', {
  _id: String,
  email: {type: String, required: true},
  password: {type: String, required: true},
  token: String,
  happyplaces: [String]
});

const Happyplace = mongoose.model('Happyplace', {
  coords: {
    lat: Number,
    lng: Number
  },
  date: String,
  message: {type: String, minlength: 1, maxlength: 560},
  image: Buffer,
  userID: [String]
});

app.get('/getworldhappyplaces', function(req, res) {
  Happyplace.find()
  .then(function(data) {
    res.json({data: data});
  })
  .catch(function(err) {
    res.json({message: 'you got an error', error: err});
  });
});

app.post('/signup', function(req, res) {
  var user = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  // console.log(user, password, email);
  bcrypt.hash(password, salt)
    .then(function(hash) {
      User.create ({
        _id: user,
        email: email,
        password: hash
      })
      .then(function(data) {
        res.json({message: 'success!', data: data});
      })
      .catch(function(err) {
        console.log(err);
        res.json({message: 'you got an error:', err: err});
      });
  });
});

app.post('/login', function(req, res) {
  var user = req.body.username;
  var password = req.body.password;
  // console.log(user, password);
  User.findById(user)
  .then(function(data) {
    console.log(data.password);
    console.log(password);
    return [data, bcrypt.compare(password, data.password)];
  })
  .spread(function(data, newHash) {
    var token = uuid();
    if (newHash) {
      // console.log('this is the token in the if, ', token);
      User.update(
        {_id: data._id},
        {
          $set: {
            token: token
          }
        }
      )
      .then(function(data) {
        return;
      })
      .catch(function(err) {
        res.json({message: 'error', err: err});
      });
      // console.log('this is the token outside, ', token);
      res.json({message: 'success', username: data._id, happyplaces: data.happyplaces, token: token});
    }
    else {
      throw ('passwords do not match');
    }
  })
  .catch(function(err) {
    // console.log(err);
    res.status(401);
    res.json({message: 'you got an error:', err: err.message});
  });
});

app.get('/gethappyplacebymessage/:message', function(req, res) {
  var message = req.params.message;
  Happyplace.find({
    message: decodeURI(message)
  })
  .then(function(data) {
    res.json({message: 'got data', data: data});
  })
  .catch(function(err) {
    res.json({message: 'you got an error', error: err});
  });
});

app.get('/profile/:username', function(req, res) {
  // User Profile page
  var username = req.params.username;
  // console.log('this is the username on the /profile/:username page, ', username);
  bluebird.all([
    User.findById(username),
    Happyplace.find({userID: username})
  ])
  .spread(function(user, happyplaces) {
    res.json({username: user._id, email: user.email, password: user.password, happyplaces: happyplaces});
  })
  .catch(function(err) {
    res.json({message: 'you got an error', error: err});
  });
});

app.get('/myhappyplaces/:username', function(req, res) {
  var username = req.params.username;
  // console.log('the username is below');
  // console.log(username);
  Happyplace.find({userID: username})
  .then(function(data) {
    res.json(data);
  })
  .catch(function(err) {
    res.json({message: 'you got an error', error: err});
  });
});

app.post('/createhappyplace', function(req, res) {
  // console.log(req.body);
  var lat = req.body.coords.lat;
  var lng = req.body.coords.lng;
  var message = req.body.message;
  var username = req.body.username;
  Happyplace.create({
    coords: {lat: lat, lng: lng},
    date: new Date(),
    message: message,
    userID: username
  })
  .then(function(data) {
    User.update(
      {_id: data.userID},
      {
        $addToSet: {
          happyplaces: data._id
        }
      }
    )
    .then(function(update) {
      res.json({message: 'success!', update: update});

    })
    .catch(function(err) {
      res.json({message: 'you got an error', error: err});
    });
  })
  .catch(function(err) {
    res.json({message: 'you got an error', error: err});
  });
});

app.post('/editmessage', function(req, res) {
  var happyPlaceID = req.body.id;
  var newMessage = req.body.message;
  Happyplace.update(
    {_id: happyPlaceID},
    {
      $set: {
        message: newMessage
      }
    }
  )
  .then(function(data) {
    res.json({message: 'you updated the document', data: data});
  })
  .catch(function(err) {
    res.json({message: 'you got an error', error: err});
  });
});

app.post('/remove', function(req, res) {
  var happyPlaceID = req.body.id;
  Happyplace.remove(
    {_id: happyPlaceID}
  )
  .then(function(data) {
    res.json({message: 'you removed the document', data: data});
  })
  .catch(function(err) {
    res.json({message: 'you got an error', error: err});
  });
});

app.listen(8000, function() {
  console.log('listening on port 8000');
});
