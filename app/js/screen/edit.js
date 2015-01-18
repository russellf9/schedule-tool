'use strict';

//edit a single screen
scheduleControllers.controller('ScreenEditCtrl', ['$rootScope', '$scope', '$firebase', 'globalFuncs', '$route', '$routeParams', '$timeout', '$filter', '$log', 'DaysSVC', '_', 'ProjectSVC', 'ScreenSVC', 'productList',
    function($rootScope, $scope, $firebase, globalFuncs, $route, $routeParams, $timeout, $filter, $log, DaysSVC, _, ProjectSVC, ScreenSVC, productList) {

        $log.info('\n****    ScreenEditCtrl    ****\n\n');

        $scope.configIndex = $routeParams.configIndex;

        var projectLoaded = false,
            screensLoaded = false,
            screenId;

        // products
        productList.$loaded().then(function(data) {
            $scope.productsArr = data;
        });

        // TODO  load from data source
        $scope.times = globalFuncs.getTimes();

        //get config data
        var configSync = globalFuncs.getConfig($scope, $firebase, $routeParams);
        configSync.$bindTo($scope, 'configArr');

        configSync.$loaded().then(function(data) {

        });

        // use a $promise to get the unique project
        ProjectSVC.getProject($scope.projectId).then(function(data) {
            $scope.project = data;
        });

        /**
         * This just gets the object data
         */
        ScreenSVC.getScreen($routeParams.id).then(function(data) {
            data.$bindTo($scope, 'thisscreen');

            // data - this is a FirebaseObject
            // so we need to wait for it to be loaded before we can access the data directly
            data.$loaded().then(function(result) {
                // assume we only have one project for now...
                $scope.projectId = $scope.thisscreen.projects[0].projectId;
                // use a $promise to get the unique project
                ProjectSVC.getProject($scope.projectId).then(function(projectData) {
                    projectData.$bindTo($scope, 'project');
                });
            });
        });
        // called when `day_type` value is updated
        $scope.saveDayType = function() {
            $scope.update();
        };

        // called when the run daily value has been modified
        $scope.editRunDaily = function() {
            $scope.update();
        };

        $scope.saveStartDate = function() {
            console.log('ScreenEditCtrl::saveStartDate');
        };
        $scope.submit = function() {
            console.log('ScreenEditCtrl::submit');
        };
        /**
         *
         */
        $scope.saveRepeatScreen = function() {
            ProjectSVC.updateDayParts($scope.project, $scope.thisscreen);
        };
        /**
         * Updates the screens day parts
         * @param index
         */
        $scope.updateDayParts = function(index) {
            var lastIndex = $scope.thisscreen.day_parts.length - 1;

            // a utility function used by the lo-dash every function
            function checkTrue(item) {
                return item === true;
            }

            if (String($scope.times[index]).toUpperCase() === 'ALL') {
                // if setting the `ALL` and it is true...
                if ($scope.thisscreen.day_parts[index]) {
                    for (var i = 0; i < lastIndex; i++) {
                        $scope.thisscreen.day_parts[i] = true;
                    }

                } else {
                    for (var j = 0; j < lastIndex; j++) {
                        $scope.thisscreen.day_parts[j] = false;
                    }
                }
            } else {
                // check if all are selected by making a copy less the last element
                var array = angular.copy($scope.thisscreen.day_parts);
                array.pop();

                $scope.thisscreen.day_parts[lastIndex] = _.every(array, checkTrue);
            }

            ProjectSVC.updateDayParts($scope.project, $scope.thisscreen);
        };
    }]);
