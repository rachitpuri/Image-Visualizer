var app = angular.module("ImageFinder", ['ngRoute', 'ui.bootstrap']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
     when('/home', {
         templateUrl: 'views/home/home.html',
         controller: 'HomeController'
     }).
     otherwise({
         redirectTo: '/home'
     });
}]);
