'use strict';

var admin = angular.module('myApp.admin', ['ngRoute']);

admin.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/admin_panel', {
    templateUrl: 'partials/admin/admin_panel.html',
    controller: 'AdminPanelCtrl'
  });
}]);

admin.controller('AdminPanelCtrl', ['$scope', function ($scope) {
    
    $scope.usuarios = {};
    
    

}]);