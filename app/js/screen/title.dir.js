'use strict';

/**
 * A directive used to decorate the title field of the Screen
 */
tool.directive('screenTitle', [function() {
    return {
        restrict: 'EA',
        scope: {
            name: '@',
            orientation: '@',
            id: '@',
            screens: '=',
            screen: '=',
            project: '='
        },
        controller: function($scope) {
            $scope.getScreenProject = function() {
                if (!$scope.screen || !$scope.screen.projects) {
                    return undefined;
                }
                return $scope.screen.projects[0];
            };
            $scope.getConfigurationName = function() {
                if ($scope.screen  && $scope.screen.projects && $scope.project && $scope.project.configurations) {
                    var screenProject = $scope.screen.projects[0],
                        configuration = $scope.project.configurations[screenProject.configId],
                        screens = $scope.project.configurations[screenProject.configId].screens;
                           // has the side-effect of setting the len property!
                    $scope.length = screens.length;
                    $scope.ready = true;
                    return configuration.name;
                } else {
                    return '';
                }
            };
            $scope.getConfigurationOrientation = function() {
                if ($scope.screen  && $scope.screen.projects && $scope.project && $scope.project.configurations) {
                    var screenProject = $scope.screen.projects[0],
                        configuration = $scope.project.configurations[screenProject.configId];
                    return configuration.orientation;
                } else {
                    return '';
                }
            };
        },
        link: {
            post: function(scope, elem, attr) {
                // have to watch the update to the attribute as it's value relies on the `interpolation`
                scope.$watch('id', function(value) {
                    if (value) {scope.screenId = Number(value) + 1;
                    }
                });
                scope.$watch('screen', function(value) {
                });
            }
        },
        templateUrl: 'partials/screen/title.html'
    };
}]);
