'use strict';


//controller for adding/editing assets obj
scheduleControllers.controller('AssetEditCtrl', ['$scope', '$log', '$firebase', '$routeParams', '$route', '$location', 'globalFuncs', 'FirebaseSVC','productList',
    function($scope, $log, $firebase, $routeParams, $route, $location, globalFuncs, FirebaseSVC, productList) {

        console.log('\n****    AssetEditCtrl    ****\n\n');
        //artworks
        $scope.artworksEls = globalFuncs.getArtworksArray($scope, $firebase);

        //are we in editmode?
        $scope.editmode = !angular.isUndefined($route.current.editmode);

        if ($scope.editmode) {
            //get data and sync with firebase
            var sync = globalFuncs.getAsset($scope, $firebase, $routeParams);
            sync.$bindTo($scope, 'asset');
        }

        // products
        productList.$loaded().then(function(data) {
            $scope.products = data;
        });

        /**
         *
         * @param fields
         * @returns {boolean}
         */
        $scope.create = function(fields) {

            console.log('Create! | fields: ', fields);

            var pushdata = {};
            $scope.master = angular.copy(fields);

            //check undefined variable, messy i know
            if ($scope.master === undefined) {
                return false;
            }
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

            pushdata.date_create = Firebase.ServerValue.TIMESTAMP;
            pushdata.id = 'some id';
            pushdata.notes = ($scope.master.notes === undefined) ? '' : $scope.master.notes;
            pushdata.deleted = 'false';
            pushdata.product_category = ($scope.master.product_category === undefined) ? '' : $scope.master.product_category;

            FirebaseSVC.createAsset(pushdata).then(function(result) {
                // success
                $log.info('Asset ', result.id, ' created.');
                //redirect to assets landing page
                $location.path('/asset');
                return true;
            }, function(error) {
                // failure
                $log.error('Creation of new Asset failed: ', error);
                return false;
            });
        };
    }]);
