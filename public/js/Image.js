var app = angular.module("ImageFinder", ['ngRoute', 'ui.bootstrap']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
     when('/home', {
         templateUrl: 'public/views/home/Home.html',
         controller: 'HomeController'
     }).
     otherwise({
         redirectTo: '/home'
     });
}]);
