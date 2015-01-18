'use strict';

/**
 * A directive used to evaluate the percentage of total number of screens which have a valid artwork assigned
 */
tool.directive('screenCodes', ['$firebase', 'globalFuncs', function($firebase, globalFuncs) {

    return {
        restrict: 'EA',
        scope: {
            project: '='
        },

        controller: function($scope) {

            $scope.width = '0%';

            $scope.artworks = [];

            // need to wait until the actual project is loaded!
            $scope.$watch('project', function(newValue, oldValue) {
                // First time will be `undefined`
                // id the `newValue` is NOT undefined we are ready...!
                if (newValue !== undefined) {

                    $scope.artworks = globalFuncs.getArtworksArray($scope, $firebase);

                    $scope.$watch('artworks', function(newValue, oldValue) {
                        evaluateValidCodes();
                    }, true);

                }
            }, true);

            /**
             * Evaluate the percentage of defined screen codes for  `artwork_id`s` in all `day_parts`
             * This Client-side evaluation is fairly fast ( see the `performance.now()` figures )
             */
            var evaluateValidCodes = function() {
                    // check the time this function takes to complete
                    // see: https://developer.mozilla.org/en-US/docs/Web/API/Performance.now
                    // just use for dev. ( in Chrome only! )
                    // var startTime = performance.now();

                    var dayParts = 0,
                        validScreenCodes = 0,
                        artwork_id;

                    // 1. configurations
                    angular.forEach($scope.project.configurations, function(configuration, k) {
                        // 2. the individual screen
                        angular.forEach(configuration.screens, function(screen, k) {
                            // console.log('screen: ', screen);
                            // 3. the individual day object
                            angular.forEach(screen.days, function(day, k) {
                                // console.log('day: ', day);
                                // 4. the individual day-parts
                                angular.forEach(day.day_parts, function(day_part, k) {
                                    // console.log('day_part: ', day_part.artwork_id);
                                    // increment
                                    dayParts++;
                                    // now check if the artwork_id has a valid `resource`
                                    if (day_part.artwork_id && day_part.artwork_id !== '') {
                                        var code = getScreenCode(day_part.artwork_id);

                                        if (code && code !== undefined) {
                                            validScreenCodes++;
                                        }
                                    }
                                });
                            });
                        });
                    });

                    $scope.percentage = (validScreenCodes / dayParts) * 100;

                    $scope.width = $scope.percentage + '%';

                    // var endTime = performance.now();
                    // console.log('It took ' + (endTime - startTime) + ' ms.');
                },

                // Simply returns the valid screen code
                getScreenCode = function(id) {
                    if (!id) {
                        return null;
                    }
                    var record = $scope.artworks.$getRecord(id);

                    return record ? record.screen_code : null;
                };
        },
        link: function($scope) {
        },
        templateUrl: 'partials/screens/screen-codes.html'
    };
}]);
