//I editted the angular.js file on line 13920, adding a return and commenting out the following line. It turns off the constant console logging on the map.

var app = angular.module('happyplace', ['ui.router', 'ngCookies', 'leaflet-directive']);


app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state({
      name: 'happyplace',
      url: '/happyplace',
      templateUrl: 'landing.html',
      controller: 'HappyPlaceLandingController'
    })
//     .state({
//       name: 'login',
//       url: '/login',
//       templateUrl: 'login.html',
//       controller: 'LoginController'
//     })
//     .state({
//       name: 'signup',
//       url: '/signup',
//       templateUrl: 'signup.html',
//       controller: 'SignupController'
//     })
    .state({
      name: 'myhappyplaces',
      // url: '/',
      url: '/myhappyplaces/{username}',
      templateUrl: 'myhappyplaces.html',
      controller: 'MyHappyPlacesMapController'
    // })
//     .state({
//       name: 'worldhappyplaces',
//       url: 'worldhappyplaces',
//       templateUrl: 'worldhappyplaces.html',
//       controller: 'WorldHappyPlacesMapController'
    });

  $urlRouterProvider.otherwise('/');
});

app.factory('happyplaceService', function($http, $cookies, $rootScope, $state) {
  var service = {};

  service.getMyHappyPlaces = function(username) {
    return $http.get('/myhappyplaces/' + username);
  };

  service.addHappyPlace = function(lat, lng, msg) {
    var newHappyPlace = {
      lat: lat,
      lng: lng,
      group: 'world',
      focus: true,
      message: msg,
      draggable: false,
      options: {
        noHide: true
      }
    };
    return $http.post('/createhappyplace', newHappyPlace);
  };

  return service;
});

app.controller('HappyPlaceHeaderController', function($scope, $stateParams, $state, happyplaceService, $cookies, $rootScope) {


});

app.controller("MyHappyPlacesMapController", function($scope, $stateParams, $state, happyplaceService, $cookies, $rootScope) {

    var happyMarker = {
      iconUrl: "img/happyplace6.png",
      shadowUrl: "img/markers_shadow.png",
      iconSize: [45, 45],
      iconAnchor:   [18, 42],
      popupAnchor: [5, -40],
      shadowAnchor: [25, 3],
      shadowSize: [36, 16],
    };

  $scope.addNewHappyPlace = function(message) {
    console.log('clicked addnewhappyplace');
    console.log($scope.message);
    $scope.clickedhappyplace = true;
  };

  $scope.openHappyPlacePopup = function() {
    $scope.clickedhappyplace = true;
    console.log('clicked openpopup');
    console.log('this is the lat, ', $scope.center.lat);
    console.log('this is the lng, ', $scope.center.lng);
  };

  $scope.closeHappyPlacePopup = function() {
    console.log('clicked closepopup')
    $scope.clickedhappyplace = false;
  };

  $scope.username = $stateParams.username;
  // $scope.username = 'mwdowns';
  console.log('stateParams', $stateParams);
  console.log($stateParams.username);
  console.log($scope.username);

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

  // $scope.username = "mwdowns";

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

  happyplaceService.getMyHappyPlaces($scope.username)
  .then(function(happyplaces) {
    console.log('these are the happyplaces', happyplaces.data);
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
      console.log(gothappyplace);
      $scope.markers.push(gothappyplace);
    }
  })
  .catch(function(err) {
    console.log('there was an error getting happyplaces', err);
  });

  console.log($scope.markers);

  // $scope.addHappyPlace = function() {
  //   console.log('button click', $scope.center.lat, $scope.center.lng);
  //   var newHappyPlace = {
  //     lat: $scope.center.lat,
  //     lng: $scope.center.lng,
  //     group: 'world',
  //     focus: true,
  //     message: "New Happy Place",
  //     draggable: false,
  //     options: {
  //       noHide: true
  //     }
  //   };
  //   $scope.markers.push(newHappyPlace);
  // };
  //This is the section where a user places a new marker using the click event. The args part of the function is where the lat/lng reside. I need to figure out a way to make it so that 1.) multiple happyplaces CANNOT be placed on the same coordinate and 2.) you can edit the message before placing the marker. Maybe I'll need to make the placing of a maker connected to a button and the map centers on clicks so that you can zero in on a place.
  $scope.$on('leafletDirectiveMap.click', function(event, args){
    $rootScope.center.lat = args.leafletEvent.latlng.lat;
    $rootScope.center.lng = args.leafletEvent.latlng.lng;
  });

});
