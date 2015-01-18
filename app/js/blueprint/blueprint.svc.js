'use strict';

/**
 * Performs various operations on the project data client-side
 */

scheduleServices.factory('Blueprint', ['$http', function($http) {

    var blueprint;

    return {
        getBlueprint: function(callback) {
            if (blueprint) {
                callback(blueprint);
            } else {
                $http.get('data/blueprint.json').success(function(data) {
                    blueprint = data;
                    callback(data);
                });
            }
        }
    };
}]);

