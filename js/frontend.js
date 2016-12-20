//I editted the angular.js file on line 13920, adding a return and commenting out the following line. It turns off the constant console logging on the map.

var app = angular.module('happyplace', ['leaflet-directive']);

// app.config('happyPlaceService', function($stateProvider, $urlRouterProvider) {
//   $stateProvider
//     .state({
//       name: 'happyplace',
//       url: '/happyplace',
//       templateUrl: 'landing.html',
//       controller: 'HappyPlaceLandingController'
//     })
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
//     .state({
//       name: 'myhappyplaces',
//       url: 'myhappyplaces',
//       templateUrl: 'myhappyplaces.html',
//       controller: 'MyHappyPlacesMapController'
//     })
//     .state({
//       name: 'worldhappyplaces',
//       url: 'worldhappyplaces',
//       templateUrl: 'worldhappyplaces.html',
//       controller: 'WorldHappyPlacesMapController'
//     });
//
//   $urlRouterProvider.otherwise('/happyplace');
// });

app.controller("HappyPlaceMapController", [ '$scope', function($scope) {

  $scope.markers = [{
    lat: 33.8486719,
    lng: -84.3733370,
    group: 'world',
    focus: true,
    message: "ATV: Home of HappyPlace",
    draggable: false,
    options: {
      noHide: true
    }
  }];

  angular.extend($scope, {
    center: {
      lat: 33.84867194475872,
      lng: -84.37333703041077,
      zoom: 17
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

  $scope.addHappyPlace = function() {
    console.log('button click', $scope.center.lat, $scope.center.lng);
    var newHappyPlace = {
      lat: $scope.center.lat,
      lng: $scope.center.lng,
      group: 'world',
      focus: true,
      message: "New Happy Place",
      draggable: false,
      options: {
        noHide: true
      }
    };
    $scope.markers.push(newHappyPlace);
  };
  //This is the section where a user places a new marker using the click event. The args part of the function is where the lat/lng reside. I need to figure out a way to make it so that 1.) multiple happyplaces CANNOT be placed on the same coordinate and 2.) you can edit the message before placing the marker. Maybe I'll need to make the placing of a maker connected to a button and the map centers on clicks so that you can zero in on a place.
  $scope.$on('leafletDirectiveMap.click', function(event, args){
    $scope.event = "Click";
    $scope.lat = args.leafletEvent.latlng.lat;
    $scope.lng = args.leafletEvent.latlng.lng;
    console.log('mouse click', $scope.lat, $scope.lng);
    $scope.center.lat = $scope.lat;
    $scope.center.lng = $scope.lng;
  });

}]);
