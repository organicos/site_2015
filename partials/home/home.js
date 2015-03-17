'use strict';

var home = angular.module('myApp.home', ['ngRoute']);

home.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'partials/home/home.html',
    controller: 'HomeCtrl'
  });
}]);

home.controller('HomeCtrl', [function() {

}]);