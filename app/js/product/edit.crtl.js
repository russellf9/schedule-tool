'use strict';

//controller for adding/editing a product obj
scheduleControllers.controller('ProductEditCtrl', ['$scope', '$log', '$firebase', '$routeParams', '$route', '$location', 'globalFuncs', 'FirebaseSVC',
    function($scope, $log, $firebase, $routeParams, $route, $location, globalFuncs, FirebaseSVC) {

        console.log('hi from the ProductEditCtrl!');

        //are we in editmode?
        $scope.editmode = !angular.isUndefined($route.current.editmode);

        //get data and sync with firebase
        if ($scope.editmode) {
            var sync = globalFuncs.getProduct($scope, $firebase, $routeParams);
            sync.$loaded().then(function(data) {
                data.$bindTo($scope, 'product_category');
            });
        }

        /**
         *
         * @param fields
         * @returns {boolean}
         */
        $scope.create = function(fields) {

            console.log('CREATE - FIELDS: ', fields);
            var pushdata = {};
            $scope.master = angular.copy(fields);

            if ($scope.master === undefined || $scope.master.name === undefined) {
                return false;
            } else {
                pushdata.name = $scope.master.name;
            }
            pushdata.date_create = Firebase.ServerValue.TIMESTAMP;
            pushdata.id = '';
            pushdata.deleted = 'false';


            FirebaseSVC.createProductCategory(pushdata).then(function(result) {
                // success
                $log.info('Product Category ', result.id, ' created.');
                //redirect to products landing page
                $location.path('/product_category');
                return true;
            }, function(error) {
                // failure
                $log.error('Creation of new Product Category failed: ', error);
                return false;
            });
        };
    }]);
