//I editted the angular.js file on line 13920, adding a return and commenting out the following line. It turns off the constant console logging on the map.

var app = angular.module('happyplace', ['ui.router', 'ngCookies', 'leaflet-directive']);

var happyMarker = {
  iconUrl: "img/happyplace6.png",
  shadowUrl: "img/markers_shadow.png",
  iconSize: [45, 45],
  iconAnchor:   [18, 42],
  popupAnchor: [5, -40],
  shadowAnchor: [25, 3],
  shadowSize: [36, 16],
};

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state({
      name: 'happyplace',
      url: '/',
      templateUrl: 'landing.html',
      controller: 'HappyPlaceLandingController'
    })
    .state({
      name: 'profile',
      url: '/profile',
      templateUrl: 'profile.html',
      controller: 'ProfileController'
    })
    .state({
      name: 'myhappyplaces',
      url: '/myhappyplaces',
      templateUrl: 'myhappyplaces.html',
      controller: 'MyHappyPlacesMapController'
    })
    .state({
      name: 'worldhappyplaces',
      url: '/worldhappyplaces',
      templateUrl: 'worldhappyplaces.html',
      controller: 'WorldHappyPlacesMapController'
    });

  $urlRouterProvider.otherwise('/');
});

app.factory('happyplaceService', function($http, $cookies, $rootScope, $state) {
  var service = {};

  $rootScope.logout = function() {
    console.log('clicked logout');
    $cookies.remove('cookie_data');
    $rootScope.auth_token = null;
    $rootScope.username = '';
    $rootScope.loggedin = false;
    $rootScope.loggingin = false;
    $rootScope.clickedLogin = false;
    $rootScope.clickedSignup = false;
    $state.go('happyplace');
  };

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
      console.log('this sucks');
      $rootScope.wronglogin = true;
    });
  };

  service.signup = function(formData) {
    var newuser = {
      username: formData.username,
      password: formData.password,
      email: formData.email
    };
    return $http.post('/signup', newuser);
  };

  service.getMyHappyPlaces = function(username) {
    return $http.get('/myhappyplaces/' + username);
  };

  service.getMyProfileInfo = function(username) {
    return $http.get('/profile/' + username);
  };

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



  service.editMessage = function(id, message) {
    var editData = {
      id: id,
      message: message
    };
    return $http.post('/editmessage', editData);
  };

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

});

app.controller('HappyPlaceLandingController', function($scope, $state, happyplaceService, $cookies, $rootScope) {

  // $scope.markers = [{
  //   lat: 33.8486719,
  //   lng: -84.3733370,
  //   group: 'world',
  //   focus: true,
  //   message: "ATV: Home of HappyPlace",
  //   icon: happyMarker,
  //   draggable: false,
  //   options: {
  //     noHide: true
  //   }
  // }];

  // angular.extend($scope, {
  //   center: {
  //     lat: 33.84867194475872,
  //     lng: -84.37333703041077,
  //     zoom: 12
  //   },
  //   layers: {
  //     baselayers: {
  //       // googleTerrain: {
  //       //   name: 'Google Terrain',
  //       //   layerType: 'TERRAIN',
  //       //   type: 'google'
  //       // },
  //       mapboxStreets: {
  //         name: 'Mapbox Streets',
  //         url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXdkb3ducyIsImEiOiJjaXd5MXVpZm4wMWZsMnpxcm5vbDVhcHZwIn0.m_HmCvf10RP_go_r3sFroQ',
  //         type: 'xyz',
  //         layerOptions: {
  //           apikey: 'pk.eyJ1IjoibXdkb3ducyIsImEiOiJjaXd5MXVpZm4wMWZsMnpxcm5vbDVhcHZwIn0.m_HmCvf10RP_go_r3sFroQ',
  //           mapid: 'mwdowns'
  //         }
  //       },
  //       osm: {
  //         name: 'OpenStreetMap',
  //         url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //         type: 'xyz'
  //       }
  //     }
  //   },
  //   // markers: {
  //   //   mainMarker: angular.copy(mainMarker)
  //   // },
  //   defaults: {
  //     scrollWheelZoom: false
  //   },
  //   events: {
  //     map: {
  //       enable: ['click', 'mousemove'],
  //       logic: 'emit'
  //     }
  //   }
  // });

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
    var formData = {
      username: $scope.username,
      password: $scope.password
    };
    console.log('clicked submit and this is the data', formData);
    happyplaceService.login(formData)
      .then(function() {
        if($cookies.getObject('cookie_data')) {
          $state.go('myhappyplaces', {username: formData.username});
          $rootScope.loggedin = true;
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

    $scope.closeHappyPlacePopup = function() {
      console.log('clicked closepopup');
      $scope.editingHappyPlace = false;
    };


  }
});

app.controller("MyHappyPlacesMapController", function($scope, $state, happyplaceService, $cookies, $rootScope) {

  var mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXdkb3ducyIsImEiOiJjaXd5MXVpZm4wMWZsMnpxcm5vbDVhcHZwIn0.m_HmCvf10RP_go_r3sFroQ';
  var mapboxAPIKey = 'pk.eyJ1IjoibXdkb3ducyIsImEiOiJjaXd5MXVpZm4wMWZsMnpxcm5vbDVhcHZwIn0.m_HmCvf10RP_go_r3sFroQ';
  var mapboxUser = 'mwdowns';
  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  var cookie = $cookies.getObject('cookie_data');
  if (cookie) {
    console.log('there is a cookie');
    console.log('these are the markers', $scope.markers);
    console.log('these are the markers in the cookie, ', cookie.happyplaces);
    $rootScope.username = cookie.username;
    $rootScope.loggedin = true;
  }
  else {
    console.log('there is no cookie');
    $rootScope.needtologin = true;
    $state.go('happyplace');
  }
  // $scope.username = cookie.username;
  // console.log($scope.username);

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

  console.log('this is the rootscope username, ', $rootScope.username);

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
      $scope.markers.push(gothappyplace);
    }
  })
  .catch(function(err) {
    console.log('there was an error getting happyplaces', err);
  });

  angular.extend($scope, {
    center: {
      lat: 33.84867194475872,
      lng: -84.37333703041077,
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
    // markers: $rootScope.markers,
    defaults: {
      scrollWheelZoom: false
    },
    events: {
      map: {
        enable: ['click', 'mousemove', 'load', 'locationfound'],
        logic: 'emit'
      }
    }
  });

  $scope.$on('leafletDirectiveMap.load', function(event, args){
    console.log('this is the load event, ' , event);
    console.log('these are the args, ', args);
  });

  $scope.$on('leafletDirectiveMap.locationfound', function(event) {
    console.log('this is the location found event, ' , event);
  });

  $scope.addNewHappyPlace = function(message) {
    // console.log('clicked addnewhappyplace');
    // console.log($scope.message, $scope.center.lat, $scope.center.lng);
    if($scope.message) {
      $scope.messageerror = false;
      // console.log($scope.message, $scope.center.lat, $scope.center.lng, $scope.messageerror);
      $scope.clickedhappyplace = false;
      var createdHappyPlace = {
        lat: $scope.center.lat,
        lng: $scope.center.lng,
        group: 'world',
        focus: true,
        message: $scope.message,
        draggable: false,
        icon: happyMarker,
        options: {
          noHide: true
        }
      };
      $scope.markers.push(createdHappyPlace);
      happyplaceService.addHappyPlace($scope.center.lat, $scope.center.lng, $scope.message)
      .then(function(data) {
        console.log('success!', data);
      })
      .error(function(err) {
        console.log('you got an error, ', err);
      });
    }
    else {
      $scope.messageerror = true;
    }

  };

  $scope.openHappyPlacePopup = function() {
    $scope.clickedhappyplace = true;
    console.log('clicked openpopup');
    console.log('this is the lat, ', $scope.center.lat);
    console.log('this is the lng, ', $scope.center.lng);
  };

  $scope.closeHappyPlacePopup = function() {
    console.log('clicked closepopup');
    $scope.clickedhappyplace = false;
  };

  //This is the section where a user places a new marker using the click event. The args part of the function is where the lat/lng reside. I need to figure out a way to make it so that 1.) multiple happyplaces CANNOT be placed on the same coordinate and 2.) you can edit the message before placing the marker. Maybe I'll need to make the placing of a maker connected to a button and the map centers on clicks so that you can zero in on a place.
  $scope.$on('leafletDirectiveMap.click', function(event, args){
    $scope.center.lat = args.leafletEvent.latlng.lat;
    $scope.center.lng = args.leafletEvent.latlng.lng;
  });

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
