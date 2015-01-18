'use strict';

//controller for adding/editing artwork obj
scheduleControllers.controller('ArtworkEditCtrl', ['$scope', '$log', '$firebase', '$routeParams', '$route', '$location', '$timeout', 'globalFuncs', 'FirebaseSVC',
    function($scope, $log, $firebase, $routeParams, $route, $location, $timeout, globalFuncs, FirebaseSVC) {
        // for the assets
        var assetSync = globalFuncs.getAssetsArray($scope, $firebase);

        $scope.assetArr = assetSync;

        // for the artworks
        var artworkSync = globalFuncs.getArtworksArray($scope, $firebase);

        artworkSync.$loaded().then(function(data) {
            $scope.artworkArr = data;
        });

        //are we in editmode?
        $scope.editmode = !angular.isUndefined($route.current.editmode);

        //get data and sync with firebase
        var sync = globalFuncs.getArtwork($scope, $firebase, $routeParams);

        sync.$loaded().then(function(data) {
            // check the `stitched` property

            console.log('13:02 - ArtworkEditCtrl | $scope.editmode: ', $scope.editmode);
            if ($scope.editmode) {
                data.$bindTo($scope, 'artwork');

                if ($scope.artwork) {
                    $scope.artwork.$id = data.$id;
                }

                // check the `stitched` property
                // bit hackey but will populate the radio button property
                if (!data.stitched) {
                    data.stitched = 'no';
                }
            }

            /**
             *
             * @param key the index of the drop down
             */
            $scope.saveSelect = function(key) {
                // doNothing() - the syncing takes care of the update and repeats have been removed by the filter
                console.log('saveSelect: ', key);
            };
        });

        /**
         * Creates a new artwork and re-directs to the artwork page if successful
         *
         * @param fields
         */
        $scope.create = function(fields) {
            console.log('A CREATE ARTWORK');
            create(fields);
        };

        /**
         * A shared function which creates the new Artwork
         * @param fields
         * @param stitched
         * @returns {boolean}
         */
        var create = function(fields, stitched) {
            var pushdata = {},
                maxAssets = 4;
            $scope.master = angular.copy(fields);
            pushdata.assets = [];
            for (var i = 0; i < maxAssets; i++) {
                //ensure we don't create an empty array in firebase, it no likey
                pushdata.assets[i] = '-----';
            }

            if ($scope.master === undefined) {
                return false;
            }

            //check undefined variable, messy i know
            if ($scope.master.name === undefined) {
                return false;
            } else {
                pushdata.name = $scope.master.name;
            }
            if ($scope.master.path === undefined) {
                return false;
            } else {
                pushdata.path = $scope.master.path;
            }
            if ($scope.master.assets === undefined) {
                pushdata.assets = pushdata.assets;
            } else {
                //foreach this to have a clean array in firebase
                angular.forEach($scope.master.assets, function(value, key) {
                    pushdata.assets[key] = $scope.master.assets[key];
                });
            }

            pushdata.date_create = Firebase.ServerValue.TIMESTAMP;
            pushdata.id = '';
            pushdata.stitched = $scope.master.stitched ? $scope.master.stitched : 'no';
            pushdata.screen_code = ($scope.master.screen_code === undefined) ? '' : $scope.master.screen_code;
            pushdata.notes = ($scope.master.notes === undefined) ? '' : $scope.master.notes;
            pushdata.deleted = false;

            FirebaseSVC.createNewArtwork(pushdata).then(function(result) {
                // success
                $log.info('Artwork ', result.id, ' created.');

                if (!stitched) {
                    $location.path('/artwork');
                }

                return true;
            }, function(error) {
                // failure
                $log.error('Creation of new Artwork failed: ', error);
                return false;
            });
        };

        /**
         * Appends ths `stitched` signifier to the artwork name
         * @param artwork
         */
        $scope.toggleStitched = function(artwork) {

            // helper utility as we are using the strings `yes` and `no`
            var convertToBoolean = function(value) {
                return value.toString().toLowerCase() === 'yes';
            };

            if (!artwork.name) {
                return;
            }

            var name = artwork.name;

            if (convertToBoolean($scope.artwork.stitched) && $scope.editmode) {
                artwork.name = name;
                create(artwork, 'stitched');
            } else {
                // we just have to change the name of the `artwork`
                artwork.name = name;
            }
        };
    }]);
