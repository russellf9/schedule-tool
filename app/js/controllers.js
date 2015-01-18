'use strict';

/* Controllers */

var scheduleControllers = angular.module('scheduleControllers', []);

scheduleControllers.controller('globalFuncs', ['$scope', 'globalFuncs', '$route', '$firebase', '$location', '$routeParams', function($scope, globalFuncs, $route, $firebase, $location, $routeParams) {

    //nav selected state
    $scope.getClass = function(state) {
        return globalFuncs.navSelect($scope, $location, state);
    };

    $scope.saveArtWork = function(index) {
        console.log('saveArtWork');
    };


}]);


/***** PRODUCTS ****/
//list all products
scheduleControllers.controller('ProductListCtrl', ['$scope', '$firebase', 'globalFuncs',
    function($scope, $firebase, globalFuncs) {
        var sync = globalFuncs.getProducts($scope, $firebase);
        sync.$bindTo($scope, 'product_categorys');

        console.log('hi from the ProductListCtrl!');
    }]);


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
scheduleControllers.controller('ModalInstanceCtrl', function($scope, $modalInstance) {

    $scope.ok = function() {

        console.log('ok ', $scope.edit);

        if ($scope.edit){
            $modalInstance.close($scope.edit);
        } else {
            $modalInstance.close();
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.openModal = function() {
        console.log('open modal!');
    };
});
