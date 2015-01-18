'use strict';

/**
 A directive used to evaluate the percentage of total number of screens which have an artwork assigned
 */
tool.directive('deliverables', [function() {

    return {
        restrict: 'EA',
        scope: {
            project: '='
        },

        controller: function($scope) {

            $scope.width = '0%';

            // need to wait until the actual project is loaded!
            $scope.$watch('project', function(newValue, oldValue) {
                // First time will be `undefined`
                // id the `newValue` is NOT undefined we are ready...!
                if (newValue !== undefined) {
                    evaluateDeliverables();
                }
            }, true);

            /**
             * Evaluate the percentage of selected `artwork_id`s` in all `day_parts`
             * This Client-side evaluation is fairly fast ( see the `performance.now()` figures )
             */
            var evaluateDeliverables = function() {
                // check the time this function takes to complete
                // see: https://developer.mozilla.org/en-US/docs/Web/API/Performance.now
                // just use for dev.
                // var startTime = performance.now();

                var dayParts = 0,
                    numberDelivered = 0;

                // 1. configurations
                angular.forEach($scope.project.configurations, function(configuration, k) {
                    // 2. the individual screen
                    angular.forEach(configuration.screens, function(screen, k) {
                        // console.log('screen: ', screen);
                        // 3. the individual day object
                        angular.forEach(screen.days, function(day, k) {
                            // 4. the individual day-parts
                            angular.forEach(day.day_parts, function(day_part, k) {
                                // increment
                                dayParts++;
                                // now check if the artwork_id property has been entered
                                if (day_part.artwork_id && day_part.artwork_id !== '') {
                                    //console.log('found')
                                    numberDelivered++;
                                }
                            });
                        });
                    });
                });


                $scope.percentage = (numberDelivered / dayParts) * 100;

                $scope.width = $scope.percentage + '%';

                //console.log('end: numberDelivered: ', numberDelivered, $scope.percentage, $scope.width)

                // var endTime = performance.now();
                // console.log('It took ' + (endTime - startTime) + ' ms.');
            };

        },
        link: function($scope) {
        },
        templateUrl: 'partials/screens/deliverables.html'
    };
}]);
