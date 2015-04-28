'use strict';

var tickets = angular.module('myApp.tickets', ['ngRoute']);

tickets.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/tickets', {
        templateUrl: '/partials/tickets/tickets.html',
        controller: 'AdminTicketsCtrl'
    })
    .when('/ticket/:id', {
        templateUrl: '/partials/tickets/ticket.html',
        controller: 'AdminTicketCtrl'
    });
}]);

tickets.controller('AdminTicketCtrl', ['$scope','$http', '$routeParams', 'myConfig', function($scope, $http, $routeParams, myConfig) {
  
    $scope.ticket = {};
    $scope.processingTicketUpdate = false;
    
    $http.get(myConfig.apiUrl+'/ticket/'+$routeParams.id)
    .success(function(res) {
    
        $scope.ticket = res;
    
    }).error(function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.updateTicket = function(){
        
        $scope.processingTicketUpdate = true;
        
        $http.put(myConfig.apiUrl+'/ticket/'+$scope.ticket._id, $scope.ticket)
        .success(function(res) {
            
        
            $scope.$storage.ticket = res;
    
            $scope.$emit('alert', {
                kind: 'success',
                msg: ['Dados salvos!'],
                title: "Sucesso"
            });  
          
        }).error(function(err) {
            
            $scope.processingChangePassword = false;
        
            var error_list = [];
            
            angular.forEach(err.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Sua alteração precisa ser revisada. Verifique os motivos abaixo:"
            });  
        
        }).finally(function(){

            $scope.processingTicketUpdate = false;

        });
        
    }


  
}]);

tickets.controller('AdminTicketsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', function($scope, $http, $filter, $routeParams, myConfig) {

    $scope.tickets = [];
    $scope.ticketFormModalObject = {};
    $scope.selectedOrder = "updated";
    
    $http.get(myConfig.apiUrl+'/tickets').then(function(res) {
    
        $scope.tickets = res.data;
        
        $scope.ticketFormModalObject = ($filter('filter')($scope.tickets, {_id: $routeParams.id}, false))[0];
    
    }, function(err) {
    
        console.error('ERR', err);
    
    });

}]);