//I editted the angular.js file on line 13920, adding a return and commenting out the following line. It turns off the constant console logging on the map.

//Creates an angular module called 'happyplace' and uses 'ui-router', 'ngCookies', and 'leaflet-directive' modules
var app = angular.module('happyplace', ['ui.router', 'ngCookies', 'leaflet-directive']);

//The happyplace marker icon.
var happyMarker = {
  iconUrl: "img/happyplace6.png",
  shadowUrl: "img/markers_shadow.png",
  iconSize: [45, 45],
  iconAnchor:   [18, 42],
  popupAnchor: [5, -40],
  shadowAnchor: [25, 3],
  shadowSize: [36, 16],
};

//these are the states for the app
app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    //This is the inital page you get when you go to happyplace.click
    .state({
      name: 'happyplace',
      url: '/',
      templateUrl: 'landing.html',
      controller: 'HappyPlaceLandingController'
    })
    //Profile state for when a user wants to edit their profile info or edit or remove their happyplaces
    .state({
      name: 'profile',
      url: '/profile',
      templateUrl: 'profile.html',
      controller: 'ProfileController'
    })
    //State for showing all of a user's happyplaces on a map
    .state({
      name: 'myhappyplaces',
      url: '/myhappyplaces',
      templateUrl: 'myhappyplaces.html',
      controller: 'MyHappyPlacesMapController'
    })
    //State for showing all of the happyplaces near a user's location
    .state({
      name: 'worldhappyplaces',
      url: '/worldhappyplaces',
      templateUrl: 'worldhappyplaces.html',
      controller: 'WorldHappyPlacesMapController'
    });

  $urlRouterProvider.otherwise('/');
});

//The app factory for all of the services. It's called happyplaceService.
app.factory('happyplaceService', function($http, $cookies, $rootScope, $state) {
  var service = {};

  //Use of the rootScope for the logout lets you initiallize all of the various settings across all of the controllers. Delete's the cookies as well.
  $rootScope.logout = function() {
    console.log('clicked logout');
    $cookies.remove('cookie_data');
    $rootScope.auth_token = null;
    $rootScope.username = '';
    $rootScope.needtologin = false;
    $rootScope.loggedin = false;
    $rootScope.loggingin = false;
    $rootScope.clickedLogin = false;
    $rootScope.clickedSignup = false;
    $rootScope.visitingProfile = false;
    $rootScope.makehappyplacebutton = false;
    $rootScope.markers = [{
      lat: 33.8486719,
      lng: -84.3733370,
      group: 'world',
      focus: true,
      message: "ATV: Home of HappyPlace",
      icon: happyMarker,
      draggable: false,
      options: {
        noHide: true
      }
    }];
    console.log('just before state.go');
    $state.go('happyplace');
  };

  service.getworldhappyplaces = function() {
    return $http.get('/getworldhappyplaces');
  };

  //The basic login. Makes a call to the backend to find the user and check the password against the one stored in the database. It's sending it unencrypted, which is a problem, so I should look into getting bcrypt working on the frontend. Is that feesible? Once we get a response from the backend, we set a cookie with the username, happyplaces, and token;
  service.login = function(formData) {
    var userinfo = {
      username: formData.username,
      password: formData.password
    };
    return $http({
      method: 'POST',
      url: '/login',
      data: userinfo
    })
    .then(function(response) {
      var data = response.data;
      console.log('this is the data for the cookie, ', data);
      $cookies.putObject('cookie_data', data);
      $rootScope.username = data.username;
      $rootScope.happyplaces = data.happyplaces;
      $rootScope.auth_token = data.token;
    })
    .catch(function(err) {
      console.log('login failed because ', err);
      $rootScope.wronglogin = true;
    });
  };

  //Basic signup. Takes the user information from the form on the page, sends it to the backend to put in the database. Should get a then and catch part so that I can log an error for when the user picks a username already in use (the username is the id in the database and therefore unique).
  service.signup = function(formData) {
    var newuser = {
      username: formData.username,
      password: formData.password,
      email: formData.email
    };
    return $http.post('/signup', newuser);
  };

  //Get's an array of objects of the user's happyplaces. This is used to update the markers list in the controller.
  service.getMyHappyPlaces = function(username) {
    return $http.get('/myhappyplaces/' + username);
  };

  //This returns a an object containing the user info (like username, email, password) and happyplaces so that the user can edit or delete their account or edit and delete happyplaces.
  service.getMyProfileInfo = function(username) {
    return $http.get('/profile/' + username);
  };

  //Adds a happyplce taking latitude and longitude and message for a marker. Will need to add the option of adding a picture later.
  service.addHappyPlace = function(lat, lng, msg) {
    var newHappyPlace = {
      coords: {
        lat: lat,
        lng: lng
      },
      message: msg,
      username: $rootScope.username
    };
    return $http.post('/createhappyplace', newHappyPlace);
  };

  //Allows the user to edit a message for a happylace.
  service.editMessage = function(id, message) {
    var editData = {
      id: id,
      message: message
    };
    return $http.post('/editmessage', editData);
  };

  //Allows the user to remove a happyplace.
  service.removeHappyPlace = function(id) {
    var removeData = {
      id: id
    };
    return $http.post('/remove', removeData);
  };



  return service;
});

app.controller('HappyPlaceHeaderController', function($scope, $state, happyplaceService, $cookies, $rootScope) {
  $scope.clickedLogin = function() {
    console.log('clicked login');
    $rootScope.loggingin = true;
    $rootScope.clickedLogin = true;
  };

  $scope.clickedSignup = function() {
    console.log('clicked signup');
    $rootScope.loggingin = true;
    $rootScope.clickedSignup = true;
  };

  $scope.clickedProfile = function() {
    console.log('clicked profile');
    $rootScope.visitingProfile = true;
    $state.go('profile');
  };

  $scope.openHappyPlacePopup = function() {
    $rootScope.clickedhappyplace = true;
    console.log('clicked makenewhappyplace', $rootScope.clickedhappyplace);
  };

  $scope.closeHappyPlacePopup = function() {
    console.log('clicked closepopup');
    $scope.clickedhappyplace = false;
  };

  $scope.$on('leafletDirectiveMap.click', function(event, args){
    $scope.center.lat = args.leafletEvent.latlng.lat;
    $scope.center.lng = args.leafletEvent.latlng.lng;
    $rootScope.clickedLat = args.leafletEvent.latlng.lat;
    $rootScope.clickedLng = args.leafletEvent.latlng.lng;
  });

  $scope.$on('leafletDirectiveMap.popupopen', function(e) {
    // var something = e.popup._source;
    console.log('clicked marker');
    // console.log(something);
  });

  $rootScope.markers = [{
    lat: 33.8486719,
    lng: -84.3733370,
    group: 'world',
    focus: true,
    message: "ATV: Home of HappyPlace",
    icon: happyMarker,
    draggable: false,
    options: {
      noHide: true
    }
  }];

  var mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token={apikey}';
  // var mapboxUrl = 'https://api.mapbox.com/v4/mapbox.streets-basic.html?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbTgzcHQxMzAxMHp0eWx4bWQ1ZHN2NGcifQ.WVwjmljKYqKciEZIC3NfLA#3/0.00/0.00';
  var mapboxAPIKey = 'pk.eyJ1IjoibXdkb3ducyIsImEiOiJjaXd5MXVpZm4wMWZsMnpxcm5vbDVhcHZwIn0.m_HmCvf10RP_go_r3sFroQ';
  var mapboxUser = 'mwdowns';
  var osmUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

  angular.extend($scope, {
    center: {
      lat: 33.84867194475872,
      lng: -84.37333703041077,
      zoom: 12
    },
    layers: {
      baselayers: {
        mapboxStreets: {
          name: 'Mapbox Streets',
          url: mapboxUrl,
          type: 'xyz',
          layerOptions: {
            apikey: mapboxAPIKey,
            mapid: mapboxUser
          }
        },
        osm: {
          name: 'OpenStreetMap',
          url: osmUrl,
          type: 'xyz'
        }
      }
    },
    defaults: {
      scrollWheelZoom: false
    },
    events: {
      map: {
        enable: ['click', 'mousemove', 'load', 'popupopen'],
        logic: 'emit'
      }
    }
  });


if (navigator.geolocation) {
  console.log('uses geolocation');
  navigator.geolocation.getCurrentPosition(findPosition);
  console.log('maybe i can set the coords now');
}
else {
  console.log('Geolocation is not supported by this browser.');
}

function findPosition(data) {
  console.log(data.coords.latitude, data.coords.longitude);
  console.log('maybe i can use the coords here');
  $scope.center.lat = data.coords.latitude;
  $scope.center.lng = data.coords.longitude;
  $scope.center.zoom = 14;
}

});

app.controller('HappyPlaceLandingController', function($scope, $state, happyplaceService, $cookies, $rootScope) {


  var cookie = $cookies.getObject('cookie_data');
  if (cookie) {
    console.log('there is a cookie');
    console.log('these are the markers', $scope.markers);
    console.log('these are the markers in the cookie, ', cookie.happyplaces);
    $rootScope.username = cookie.username;
    $rootScope.loggedin = true;
    $state.go('myhappyplaces');
  }
  else {
    console.log('there is no cookie');
  }

  happyplaceService.getworldhappyplaces()
  .then(function(worldhappyplaces) {
    for (var i = 0; i < worldhappyplaces.data.data.length; i++) {
      var gothappyplace = {
        lat: worldhappyplaces.data.data[i].coords.lat,
        lng: worldhappyplaces.data.data[i].coords.lng,
        group: 'world',
        focus: true,
        message: worldhappyplaces.data.data[i].message,
        icon: happyMarker,
        draggable: false,
        options: {
          noHide: true
        }
      };
      // console.log('this got happyplaces,', gothappyplace);
      $rootScope.markers.push(gothappyplace);
    }
    console.log($rootScope.markers);
  })
  .catch(function(err) {
    console.log('there was an error getting happyplaces', err);
  });

  $scope.signupSubmit = function() {
    if ($scope.password != $scope.confirmPassword) {
      $scope.passwordsdontmatch = true;
    }
    else {
      $scope.passwordsdontmatch = false;
      var formData = {
        username: $scope.username,
        password: $scope.password,
        email: $scope.email
      };
      happyplaceService.signup(formData)
        .success(function() {
          $scope.clickedLogin = true;
          $scope.clickedSignup = false;
          console.log('success');
        })
        .error(function() {
          $scope.signuperror = true;
          console.log('could not sign up');
        });
      $scope.username = '';
      $scope.email = '';
      $scope.password = '';
    }
  };

  $scope.loginSubmit = function() {
    console.log('clicked');
    var formData = {
      username: $scope.username,
      password: $scope.password
    };
    console.log('clicked submit and this is the data', formData);
    happyplaceService.login(formData)
      .then(function() {
        if($cookies.getObject('cookie_data')) {
          $rootScope.markers = [{
            lat: 33.8486719,
            lng: -84.3733370,
            group: 'world',
            focus: true,
            message: "ATV: Home of HappyPlace",
            icon: happyMarker,
            draggable: false,
            options: {
              noHide: true
            }
          }];
          $state.go('myhappyplaces', {username: formData.username});
          $rootScope.loggedin = true;
          $rootScope.makehappyplacebutton = true;
        }
        else {
          console.log('something happened');
        }
      })
      .catch(function(err) {
        console.log('login failed');
        $scope.loginerror = true;
      });
    $scope.user = '';
    $scope.password = '';
  };

  $scope.closeHappyPlacePopup = function() {
    console.log('clicked closepopup');
    $rootScope.clickedLogin = false;
    $rootScope.clickedSignup = false;
    $rootScope.loggingin = false;
  };

  $scope.clickedOK = function() {
    $rootScope.needtologin = false;
  };

});

app.controller('ProfileController', function($scope, $state, happyplaceService, $cookies, $rootScope) {

  var cookie = $cookies.getObject('cookie_data');
  if (cookie) {
    $rootScope.visitingProfile = true;
    $rootScope.makehappyplacebutton = false;
    console.log('on profile page', $rootScope.visitingProfile);
    $rootScope.username = cookie.username;
    $rootScope.loggedin = true;
    happyplaceService.getMyProfileInfo($rootScope.username)
    .then(function(info) {
      console.log('this is the info, ', info);
      $scope.data = info.data;
    })
    .catch(function(err) {
      console.log('you got an error', err);
    });

    $scope.editHappyPlace = function(id, message) {
      $scope.happyplaceID = id;
      $scope.oldMessage = message;
      $scope.editingHappyPlace = true;
      console.log($scope.happyplaceID, $scope.oldMessage);

      $scope.changeMessage = function() {
        if ($scope.newMessage) {
          happyplaceService.editMessage($scope.happyplaceID, $scope.newMessage)
          .then(function(data) {
            console.log('you updated the message', data);
            $scope.editingHappyPlace = false;

          })
          .catch(function(err) {
            console.log('you got an error, ', err);
          });
        }
        else {
          $scope.messageerror = true;
        }
        $state.go('profile');
      };

      $scope.deleteHappyPlace = function() {
        console.log($scope.happyplaceID);
        happyplaceService.removeHappyPlace($scope.happyplaceID)
        .then(function(data) {
          console.log('you deleted this Happy Place', data);
          $scope.editingHappyPlace = false;
          $state.go('profile');
        })
        .catch(function(err) {
          console.log('you got an error, ', err);
        });
      };
    };

    $scope.backToHappyPlaces = function() {
      console.log('clicked backtohappyplaces');
      $rootScope.visitingProfile = false;
      $rootScope.makehappyplacebutton = true;
      $rootScope.markers = [{
        lat: 33.8486719,
        lng: -84.3733370,
        group: 'world',
        focus: true,
        message: "ATV: Home of HappyPlace",
        icon: happyMarker,
        draggable: false,
        options: {
          noHide: true
        }
      }];
      $state.go('myhappyplaces');
    };

    $scope.closeHappyPlacePopup = function() {
      console.log('clicked closepopup');
      $scope.editingHappyPlace = false;
    };


  }
});

app.controller("MyHappyPlacesMapController", function($scope, $state, happyplaceService, $cookies, $rootScope) {


  var cookie = $cookies.getObject('cookie_data');
  if (cookie) {
    console.log('there is a cookie');
    console.log('these are the markers', $rootScope.markers);
    console.log('these are the markers in the cookie, ', cookie.happyplaces);
    $rootScope.username = cookie.username;
    $rootScope.loggedin = true;
    $rootScope.makehappyplacebutton = true;
  }
  else {
    console.log('there is no cookie');
    $rootScope.needtologin = true;
    $state.go('happyplace');
  }

  happyplaceService.getMyHappyPlaces($rootScope.username)
  .then(function(happyplaces) {
    // console.log('these are the happyplaces from the database', happyplaces.data);
    for (var i = 0; i < happyplaces.data.length; i++) {
      var gothappyplace = {
        lat: happyplaces.data[i].coords.lat,
        lng: happyplaces.data[i].coords.lng,
        group: 'world',
        focus: true,
        message: happyplaces.data[i].message,
        icon: happyMarker,
        draggable: false,
        options: {
          noHide: true
        }
      };
      // console.log('this got happyplaces,', gothappyplace);
      $rootScope.markers.push(gothappyplace);
    }
    console.log($rootScope.markers);
  })
  .catch(function(err) {
    console.log('there was an error getting happyplaces', err);
  });

  $scope.addNewHappyPlace = function(message) {
    if($scope.message) {
      $scope.messageerror = false;
      // $scope.clickedhappyplace = false;
      var createdHappyPlace = {
        lat: $rootScope.clickedLat,
        lng: $rootScope.clickedLng,
        group: 'world',
        focus: true,
        message: $scope.message,
        draggable: false,
        icon: happyMarker,
        options: {
          noHide: true
        }
      };
      $rootScope.markers.push(createdHappyPlace);
      happyplaceService.addHappyPlace($rootScope.clickedLat, $rootScope.clickedLng, $scope.message)
      .then(function(data) {
        console.log('success!', data);
        $rootScope.clickedhappyplace = false;
        $scope.message = '';
      })
      .error(function(err) {
        console.log('you got an error, ', err);
      });
    }
    else {
      $scope.messageerror = true;
    }
  };

  $scope.closeHappyPlacePopup = function() {
    console.log('clicked closepopup');
    $rootScope.clickedhappyplace = false;
  };


});

app.controller("WorldHappyPlacesMapController", function($scope, $state, happyplaceService, $cookies, $rootScope) {
  if (navigator.geolocation) {
    console.log('uses geolocation');
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position.coords.latitude, position.coords.longitude);
    });

    $scope.markers = [{
      lat: 33.8486719,
      lng: -84.3733370,
      group: 'world',
      focus: true,
      message: "ATV: Home of HappyPlace",
      icon: happyMarker,
      draggable: false,
      options: {
        noHide: true
      }
    }];

    // window.setTimeout(createMap, 5000, lat, lng);
    map = function(lat, lng) {
      console.log('at the start');
      angular.extend($scope, {
        center: {
          lat: lat,
          lng: lng,
          zoom: 12
        },
        layers: {
          baselayers: {
            // googleTerrain: {
            //   name: 'Google Terrain',
            //   layerType: 'TERRAIN',
            //   type: 'google'
            // },
            mapboxStreets: {
              name: 'Mapbox Streets',
              url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXdkb3ducyIsImEiOiJjaXd5MXVpZm4wMWZsMnpxcm5vbDVhcHZwIn0.m_HmCvf10RP_go_r3sFroQ',
              type: 'xyz',
              layerOptions: {
                apikey: 'pk.eyJ1IjoibXdkb3ducyIsImEiOiJjaXd5MXVpZm4wMWZsMnpxcm5vbDVhcHZwIn0.m_HmCvf10RP_go_r3sFroQ',
                mapid: 'mwdowns'
              }
            },
            osm: {
              name: 'OpenStreetMap',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz'
            }
          }
        },
        // markers: {
        //   mainMarker: angular.copy(mainMarker)
        // },
        defaults: {
          scrollWheelZoom: false
        },
        events: {
          map: {
            enable: ['click', 'mousemove'],
            logic: 'emit'
          }
        }
      });
      console.log('hi');
    };

    console.log($scope.center);

    $scope.$on('leafletDirectiveMap.click', function(event, args){
      $scope.center.lat = args.leafletEvent.latlng.lat;
      $scope.center.lng = args.leafletEvent.latlng.lng;
    });
  }
  else {
    console.log('does not use geolocation');
  }
});
