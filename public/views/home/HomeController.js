"use strict"

app.controller("HomeController", function ($scope, $rootScope, $http, $routeParams, $log) {

    $scope.cityNames = [
        { value: 0, label: "Boston" },
        { value: 1, label: "New York" },
        { value: 2, label: "California" },
        { value: 3, label: "Florida" },
        { value: 4, label: "Seattle" },
        { value: 5, label: "Washington" },
        { value: 6, label: "Virginia" },
        { value: 7, label: "Las Vegas" },
    ]

    $scope.widths = [
        { value: 0, label: "300px" },
        { value: 1, label: "400px" },
        { value: 2, label: "500px" },
        { value: 3, label: "600px" },
        { value: 4, label: "700px" },
        { value: 5, label: "800px" },
        { value: 6, label: "900px" },
    ]

    $scope.heights = [
        { value: 0, label: "300px" },
        { value: 1, label: "400px" },
        { value: 2, label: "500px" },
        { value: 3, label: "600px" },
        { value: 4, label: "700px" },
        { value: 5, label: "800px" },
        { value: 6, label: "900px" },
    ]

    var searchbycity = "Boston";

    // Admin can add more cities data dynamically
    $scope.addOption = function (text) {
        // check if new city is already present in the dropdown? If yes, do not add it.
        var found = false;
        var noOfCities = $scope.cityNames.length;
        for (var i = 0; i < noOfCities; i++) {
            if (text.toLowerCase() === $scope.cityNames[i].label.toLowerCase()) {
                found = true;
            }
        }
        if (found == false)
            $scope.cityNames.push({ value: noOfItems + 1, label: text });
    }

    /*
    * This function is used to fetch the Images from Foursquare API and fill it's metadata information 
    * to our local (NoSQL) database which will be used in future for  
    */
    $scope.submit = function () {
        // fill data
        var city = $scope.city
        $http.get("https://api.foursquare.com/v2/venues/explore?client_id=CNJEZO3QR35ZFEJAPZUIKS4AFLCCPO3WOAAY4H0TCAVSB545&client_secret=NLHBQ250KZTZIMYYGUZUILNSDWZ4HVXOOTRWWHDEC55Q4YAP&v=20130815&near=" + city + "&section=sights&limit=50&venuePhotos=1")
            .success(function (response) {
                console.log(response);
                var size = response.response.groups[0].items.length;
                console.log(size);
                var images = [];
                for (var i = 0; i < size; i++) {
                    // create image object and fill db
                    var item = response.response.groups[0].items[i]; 
                    var place = item.venue.name;
                    var rating = item.venue.rating;
                    var width = item.venue.featuredPhotos.items[0].width;
                    var height = item.venue.featuredPhotos.items[0].height;
                    var url = item.venue.featuredPhotos.items[0].prefix + item.venue.featuredPhotos.items[0].width + 'x' + item.venue.featuredPhotos.items[0].height + item.venue.featuredPhotos.items[0].suffix;
                    var date = item.venue.featuredPhotos.items[0].createdAt;
                    var image = {
                        city: city,
                        place: place,
                        rating: rating,
                        width: width,
                        height: height,
                        url: url,
                        date: date
                    };
                    console.log(image);
                    images.push(image);
                }
                console.log(images);
                var json = JSON.stringify(images);
                console.log(json);
                $http.post("api/uploadImage", json)
                    .success(function (response) {
                        console.log("image inserted successfully");
                        //$scope.addOption(city);
                        $scope.city = "";
                    })
                    .error(function () {
                        console.log("Some error while filling DB");
                    });
            })
            .error(function (error) {
                console.log("some error");
            })
    }

    $scope.updateCity = function () {
        $scope.filterCityName = $scope.selectedItem.label;
    }

    /*
    * Diplays Images based on city name
    */
    $scope.imagesByCityName = function () {
        // clear dropdown filters
        searchbycity = $scope.filterCityName;
        if (searchbycity == undefined || searchbycity.length == 0) {
            searchbycity = "Boston"
        }
        // check if search city is in the dropdown ? If yes, change dropdown label
        var noOfCities = $scope.cityNames.length;
        for (var i = 0; i < noOfCities; i++) {
            if (searchbycity.toLowerCase() === $scope.cityNames[i].label.toLowerCase()) {
                $scope.selectedItem = $scope.cityNames[i];
            }
        }
        $http.get("api/getImages/city/" + searchbycity)
            .success(function (response) {
                console.log(response);
                fillImages(response);
            })
            .error(function () {
                console.log("Rating error");
            })
    }

    /*
    * Display Images based on filters (cityname, place, rating, width, height) selected
    */
    $scope.query = function (page) {
        var city = $scope.selectedItem.label;
        var place = $scope.filterPlace;
        var width = $scope.imageWidth.label;
        width = width.substring(0, width.length - 2);
        var height = $scope.imageHeight.label;
        height = height.substring(0, height.length - 2);
        var rating = $scope.filterRating;
        if (rating == undefined || rating.length == 0)
            rating = 0;
        if (place == undefined || place.length == 0)
            place = "*";
        console.log(city, place, width, height, rating);
        $http.get("api/getImages/filter/" + page + "/" + city + "/" + place + "/" + width + "/" + height + "/" + rating)
            .success(function (response) {
                console.log(response);
                fillImages(response);
            })
            .error(function () {
            console.log("Rating error");
        })
    }

    /**
    * @description
    * Display images based on the server's response
    *
    * @param {*} server response
    **/
    function fillImages(response) {
        var slides = [];
        //var currIndex = 0;
        $scope.myInterval = 5000;
        $scope.noWrapSlides = false;
        $scope.addSlide = function (res) {
            slides.push({
                image: res
                //id: currIndex++
            });
            //console.log(slides);
        };
        for (var i = 0; i < response.length; i++) {
            $scope.addSlide(response[i]);
        }
        if (slides.length > 0)
            $scope.slides = slides;
        else
            $scope.slides = [];
        console.log($scope.slides);
    }

    // By Default fetch Boston Images
    var defaultCity = "Boston";
    $http.get("api/getImages/" +defaultCity)
        .success(function (response) {
            console.log(response);
            fillImages(response);
        })
        .error(function () {
            console.log("Image fetch error")
        })


    $scope.totalItems = 50;
    $scope.currentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $log.log('Page changed to: ' + $scope.currentPage);
        $scope.query($scope.currentPage);
    };

    $scope.maxSize = 5;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
});