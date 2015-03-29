'use strict';

var products = angular.module('myApp.products', ['ngRoute']);

products.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/products', {
    templateUrl: 'partials/products/products.html',
    controller: 'ProductsCtrl'
  });
  $routeProvider.when('/product', {
    templateUrl: 'partials/products/product.html',
    controller: 'ProductCtrl'
  });
  $routeProvider.when('/product/:id', {
    templateUrl: 'partials/products/product.html',
    controller: 'ProductCtrl'
  });
}]);

products.controller('ProductsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', function($scope, $http, $filter, $routeParams, myConfig) {

  $scope.products = [];
  $scope.selectedFilterField = 'category';
  $scope.selectedFilterValue = 'Óleos';
  $scope.selectedOrder = 'name';

  $http.get(myConfig.apiUrl+'/products')
  .success(function(res){
    
    $scope.products = res;
    
  }).error(function(err) {
  
      $scope.$emit('alert', {
          kind: 'danger',
          msg: err,
          title: "Não foi possível acessar a lista de produtos. Verifique o motivo abaixo:"
      });
  
  });

  $scope.selectFilter = function (field, value) {
    
    $scope.selectedFilterField = field;
    $scope.selectedFilterValue = value;
    
  }
  
}]);

products.controller('ProductCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', function($scope, $http, $filter, $routeParams, myConfig) {

  $scope.saving_product = false;
  
  $scope.selectedProduct = {};

  if($routeParams.id){
    
    $http.get(myConfig.apiUrl+'/product/'+$routeParams.id)
    .success(function(res) {

      $scope.selectedProduct = res;

    }).error(function(err) {
    
        $scope.$emit('alert', {
            kind: 'danger',
            msg: err,
            title: "Não foi possível acessar os dados do produto. Verifique o motivo abaixo:"
        });
    
    });
    
  }

  $scope.selectedProducFormSubmit = function () {
    
    $scope.saving_product = true;
    
    if($scope.selectedProduct._id){
      
       $scope.productPut($scope.selectedProduct);
      
    } else {

      $scope.productPost($scope.selectedProduct); 

    }

  }
  
  $scope.productPost = function(product) {
    
    $http.post(myConfig.apiUrl + '/products', product)
    .success(function(resp) {
      
        $scope.products = resp.data;
        window.location = ("#/product/" + resp._id);
        
    })
    .error(function (resp) {
      
      var error_list = [];

      angular.forEach(resp.errors, function(error, path) {
        this.push(error.message);
      }, error_list);
      
      $scope.$emit('alert', {
          kind: 'danger',
          msg: error_list,
          title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
      });
  
    })
    .finally(function () {
      $scope.saving_product = false;
    });
  
  };

  $scope.productPut = function(product) {
    
    $http.put(myConfig.apiUrl + '/products/'+product._id, product)
    .success(function(resp) {
      
      $scope.products = resp.data;

      $scope.$emit('alert', {
          kind: 'success',
          msg: '',
          title: "Produto editado com sucesso"
      });

    })
    .error( function(resp) {
      
      var error_list = [];

      angular.forEach(resp.errors, function(error, path) {
        this.push(error.message);
      }, error_list);
      
      $scope.$emit('alert', {
          kind: 'danger',
          msg: error_list,
          title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
      });
  
    })
    .finally(function () {
      $scope.saving_product = false;
    });
  };
  
  $scope.dropProduct = function(product) {
    
    var confirmed = confirm('Deseja realmente excluir o produto ' + product.name + "?");
      
    if (confirmed) {

      $scope.saving_product = true;
        $http.delete(myConfig.apiUrl + '/products/' + product._id)
        .success(function() {
          window.location = ("#/fair");
        })
        .error(function (resp) {
          
          var error_list = [];
    
          angular.forEach(resp.errors, function(error, path) {
            this.push(error.message);
          }, error_list);
          
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
          });
    
      })
      .finally(function () {
        $scope.saving_product = false;
      });
      
    };
    
  };

}]);