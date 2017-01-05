HappyPlace
==========

No likes. No favorites. Just your happy places.

HappyPlace is a web-app for keeping track of place and time that made you happy.

HappyPlace was build using the MEAN stack: HTML/CSS and AngularJS on the frontend with NodeJS and MongoDB on the backend. For rendering the map I used the Leaflet and the [Angular Leaflet Directive](http://tombatossals.github.io/angular-leaflet-directive/#!/). The map-tiles were from MapBox and OpenStreetMaps.

Setup
-----
If you'd like to see a live version of HappyPlace, visit [happyplace.click](http://happyplace.click).

For a local version, feel free to clone the repository, run
```
npm install
```
in the directory where you cloned it, and make sure that you have MongoDB installed on your computer as well. Then run
```
node backend.js
```
in the terminal and type
```
localhost:8000
```
into your browser bar. When you create a user (click the signup button on the page), the app will initialize the happyplace_db in Mongo.

HowTo
-----
The app is relatively intuitive. When not signed in, you can view the world happyplaces, but you can not create a happyplace. Once you create an account, you can create happylaces.

To create a happyplace, simply click on the map and move the crosshair in the middle of the page to the place you want to create and click the "create a happy place" button. Your happyplace marker should appear on the map, and you should be able to edit or delete the message in the marker popup.
