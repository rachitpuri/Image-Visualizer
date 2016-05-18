'use strict'

/*describe("A suite is just a function", function () {
    var a;

    it("and so is a spec", function () {
        a = true;

        expect(a).toBe(true);
    });
});*/

describe("A suite is just a function", function () {
    it('should demonstrate using when (200 status)', inject(function ($http, $httpBackend) {

        var $scope = {};
        /* Code Under Test */
        var city = "Boston"
        var responseLength = 0;
        $http.get('api/getImages/Boston')
          .success(function (response) {
              $scope.valid = true;
              $scope.response = response;
          })
          .error(function (response) {
              $scope.valid = false;
          });
        /* End */

        $httpBackend
          .when('GET', 'api/getImages/Boston')
          .respond(200);
    
        $httpBackend.flush();

        expect($scope.valid).toBe(true);
        //expect($scope.response).toEqual({ 'data': 'as' });
        //expect($scope.response).toEqual({ foo: 'bar' });

    }));
});