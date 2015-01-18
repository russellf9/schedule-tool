'use strict';

//list all artwork
scheduleControllers.controller('ArtworkListCtrl', ['$scope', '$firebase', 'globalFuncs',
    function($scope, $firebase, globalFuncs) {

        console.log('hi from the ArtworkListCtrl');

        var sync = globalFuncs.getArtworks($scope, $firebase);
        sync.$bindTo($scope, 'artworks');

        //lookup asset name from id
        $scope.assetArr = globalFuncs.getAssetsArray($scope, $firebase);

        $scope.artworkArr = globalFuncs.getArtworksArray($scope, $firebase);
    }]);
