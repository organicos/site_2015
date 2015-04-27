'use strict'; //avoid bad practice as global var declaration

var $scope, $location;

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ngRoute',
  'ui.bootstrap',
  'ngStorage',
  'angular.filter',
  'satellizer',
  'ngSanitize',
  'myApp.home',
  'myApp.fair',
  'myApp.security',
  'myApp.version',
  'myApp.payments',
  'myApp.contact',
  'myApp.auth',
  'myApp.admin',
  'myApp.users',
  'myApp.order',
  'myApp.products',
  'myApp.config',
  'myApp.certification',
  'myApp.susteinable',
  'myApp.about',
  'myApp.articles',
  'myApp.blog'
]);

app.config(['$routeProvider', '$httpProvider', '$authProvider', '$locationProvider', function($routeProvider, $httpProvider, $authProvider, $locationProvider) {

    // define default route
    $routeProvider.otherwise({redirectTo: '/'});
    
    // add cross-domain to the header
    $httpProvider.defaults.useXDomain = true;

    // remove some http header to use CORS
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    
    $locationProvider.html5Mode(true).hashPrefix('!');
        
}]);

app.service('HtmlMetaTagService', ['$location', function($location) {
    
    var HtmlMetaTagService = this;
    var metaData = {
        title: 'Feira Orgânica Delivery'
    };

    return {
        resetData: function() {
            metaData = {
                title: 'Feira orgânica Delivery - Produtos orgânicos entregues em sua porta.'
            };
            return HtmlMetaTagService;
        },
        tag: function (tag, value) {
            if (!tag && !value) {
                return metaData;
            } else if (!value) {
                return metaData[tag];
            } else {
                metaData[tag] = value;
                return HtmlMetaTagService;
            }
        }
   }
  
}]);

app.controller('headCtrl' , ['$scope', 'HtmlMetaTagService' , function($scope, HtmlMetaTagService) {

    // Reset HTML Meta Tags
    HtmlMetaTagService.resetData();
    $scope.HtmlMetaTagService = HtmlMetaTagService;
    
}]);

app.controller('myAppCtrl' , ['$scope', '$location', 'anchorSmoothScroll', '$localStorage', 'basketService', 'HtmlMetaTagService', '$http', 'myConfig' , function($scope, $location, anchorSmoothScroll, $localStorage, basketService, HtmlMetaTagService, $http, myConfig) {
    
    $scope.$storage = $localStorage.$default({
        user: {kind: ''},
    });
    
    $scope.followingShippingDate = '';
    
    $http.get(myConfig.apiUrl + '/shipping/following')
    .success(function(res) {
      
      $scope.followingShippingDate = res;
      
    })
    .error(function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.ensureUser = function() {
        $scope.$storage.user = $scope.$storage.user ? $scope.$storage.user : {kind: ''};
    }();
    
    $scope.ping = function(callback) {
        callback();
    }

    $scope.$back = function() {
        
        window.history.back();

    };
  
    $scope.alerts = [];

    $scope.addAlert = function(alertObj) {
        
        $scope.alerts.unshift(alertObj);
        
        if(alertObj.duration == undefined || alertObj.duration > 0){

            setTimeout(function(){
                
                $scope.$apply(function(){
                    var index = $scope.alerts.indexOf(alertObj);
                    $scope.alerts.splice(index, 1);            
                });
                
            },
            alertObj.duration || 5000)
        }
        

    };
    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);    
    }
        
    $scope.$on('alert', function(event, alertObj) {
        $scope.addAlert(alertObj);
    });
    
    $scope.appAlert = function(msg, duration) {

        alert(msg.join('<br>'));
        
    };

    // Basket 
    $scope.openBasket = basketService.showModal;
    $scope.addToBasket = basketService.addToBasket;
    $scope.dropFromBasket = basketService.dropFromBasket;
    
}]);

app.controller('NavBarCtrl', function($scope, $localStorage) {
    
    $scope.isCollapsed = true;
    
    $scope.user = $localStorage.user;
    
    $scope.$on('$routeChangeSuccess', function(){
        $scope.isCollapsed = true;
    });
    
    $scope.totalBasketItens = function(){
        var total = 0;
        for(count=0;count<$scope.items.length;count++){
            total += $scope.items[count].Price + $scope.items[count].Price;
        }
        return total;
    };

});

app.service('basketService', ['$modal', '$localStorage', '$filter', function ($modal, $localStorage, $filter) {
    
    var self = this;
    
   this.ensureBasket = function() {
    	if(!$localStorage.basket){
    	    $localStorage.basket = {total: 0,name: '',products: [], shipping: {price: 6, country: 'Brasil'}};
    	} else {
        	if(!$localStorage.basket.products) $localStorage.basket.products = {};
        	if(!$localStorage.basket.total) $localStorage.basket.total = 0;
        	if(!$localStorage.basket.name) $localStorage.basket.name = '';
        	if(!$localStorage.basket.shipping) $localStorage.basket.shipping = {price: 6, country: 'Brasil'};
    	}
    }();

    this.addToBasket = function (product) {
        var basket = $localStorage.basket;
        var basketProduct = ($filter('filter')(basket.products, {_id: product._id}, false))[0];
        if(basketProduct){
            basketProduct.quantity = basketProduct.quantity >= 0 ? basketProduct.quantity : 1;
            basketProduct.quantity ++;
        }  else {
            product.quantity = 1;
            basket.products.push(product);
        }
        basket.total += parseFloat(product.price);
    };
    
    this.dropFromBasket = function (product, decreasingAmount) {
        var basket = $localStorage.basket;
        var productIndex = basket.products.indexOf(product);
        var product = basket.products[productIndex];
        if (productIndex >= 0) {
            if (decreasingAmount > 0 & product.quantity > decreasingAmount) {
                product.quantity -= decreasingAmount;
                basket.total -= product.price * decreasingAmount;
            } else {
                basket.total -= parseFloat(product.price) * product.quantity;
                basket.products.splice(productIndex, 1);   
            }
        }
    };
    
    this.showModal = function(){
        return $modal.open({
            backdrop: true,
            keyboard: true,
            modalFade: true,
            size: 'lg',
            templateUrl: '/partials/basket/basket_modal.html',
            controller: function ($scope, $location, $modalInstance) {
                $scope.basket = $localStorage.basket;
                $scope.addToBasket = self.addToBasket;
                $scope.dropFromBasket = self.dropFromBasket;
                $scope.modalOptions = {
                    ok: function (result) {
                        $location.path('/order_review');
                        $modalInstance.dismiss('order_review');
                    },
                    close: function (result) {
                        $modalInstance.dismiss('cancel');
                    },
                    goToFair: function(){
                        $location.path('/fair');
                        $modalInstance.dismiss('fair');
                    }
                };
            }
        }).result;
    };
    
}]);

app.service('confirmModalService', ['$modal', function ($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: '/partials/modals/confirm.html'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        actionButtonKind: 'btn-primary',
        headerText: 'Continuar?',
        bodyText: 'Realizar esta ação?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }
        }

        return $modal.open(tempModalDefaults).result;
    };

}]);

app.directive('contenteditable', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            // view -> model
            elm.bind('blur', function() {~
              console.log(scope);
                scope.$apply(function() {
                    ctrl.$setViewValue(elm.html());
                });
            });

            // model -> view
            ctrl.$render = function() {
                elm.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$setViewValue(elm.html());
        }
    };
});

app.service('anchorSmoothScroll', function(){
    
    this.scrollTo = function(eID, offset) {
        
        console.log('iuhiuh')

        // This scrolling function 
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
        
        var startY = currentYPosition();
        var stopY = elmYPosition(eID) + offset;
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        speed = 30;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY;
                timer++;
            }
            return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step;
            if (leapY < stopY) leapY = stopY;
            timer++;
        }
        
        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
        
        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };
    
});