'use strict';


/***** ASSETS ****/
//list all assets
scheduleControllers.controller('AssetListCtrl', ['$scope', '$firebase', 'globalFuncs',
    function($scope, $firebase, globalFuncs) {

        console.log('hi from the AssetListCtrl');

        var sync = globalFuncs.getAssets($scope, $firebase);
        sync.$bindTo($scope, 'assets');

        //get products
        $scope.products = globalFuncs.getProductsArray($scope, $firebase);

        //artworks
        $scope.artworksEls = globalFuncs.getArtworksArray($scope, $firebase);

    }]);
