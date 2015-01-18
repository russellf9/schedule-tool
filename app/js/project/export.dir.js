'use strict';

/**
 * A directive used to export data as a CSV file
 * Utilises the `ng-csv` directive
 * In the mark-up the call to export the data is triggers `getArray()`
 */
tool.directive('projectExport', ['ProjectSVC', 'storageSVC', function(ProjectSVC, storageSVC) {
    return {
        restrict: 'EA',
        scope: {
            project: '='
        },
        controller: function($scope) {
            // use the values to populate the array
            $scope.getArray = function() {
                return ProjectSVC.getProjectData($scope.project);
            };
            // get the data keys for the headers
            $scope.getHeaders = function() {
                return ProjectSVC.getProjectHeaders($scope.project);
            };
            // returns the generated file name
            $scope.getFileName = function() {
                return ProjectSVC.getFileName($scope.project);
            };
        },
        link: {
            pre: function(scope, element, attr) {
                element.hide();
            },
            post: function(scope, element, attr) {
                if (!storageSVC.canExportData()) {
                    element.remove();
                } else {
                    element.show();
                }
            }
        },
        templateUrl: 'partials/project/export.html'
    };
}]);
