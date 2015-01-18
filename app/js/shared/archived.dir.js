'use strict';

/**
 * A directive used to add the text `Archived` to the set mark-up
 */

tool.directive('archived', [function() {

    var evaluateAsBoolean = function(value) {

        if (typeof value === 'string') {
            // 1. for string
            return value.toLowerCase() === 'true';
        } else if (typeof value === 'boolean') {
            // 2. for boolean
            return value;
        }
        return false;
    };


    return {
        restrict: 'EA',
        scope: {
            theStyle: '@',
            deleted: '='
        },
        controller: function($scope) {
            $scope.isDeleted = function(value) {
                return evaluateAsBoolean(value);
            };
        },
        link: function(scope, element, attrs) {
        },
        templateUrl: 'partials/shared/archived.html'
    };
}]);
