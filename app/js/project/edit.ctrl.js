'use strict';

//controller for ADD/EDIT PROJECT
scheduleControllers.controller('ProjectEditCtrl', ['$scope', '$log', '$routeParams', '$route', '$firebase', '$location', 'globalFuncs', 'ProjectSVC', 'fbutil', '$modal', 'DateSVC', 'FirebaseSVC', 'Blueprint',
    function($scope, $log, $routeParams, $route, $firebase, $location, globalFuncs, ProjectSVC, fbutil, $modal, DateSVC, FirebaseSVC, Blueprint) {

        console.log('ProjectEditCtrl');

        if (!$scope.configurations) {
            Blueprint.getBlueprint(function(results) {
                $scope.configurations = results;

                console.log('config: ', $scope.configurations);
            });
        }

        DateSVC.reset();

        /* SET VARIABLES */
        $scope.project = {};

        //datepicker
        $scope.datepickers = {opened_start: false, opened_end: false, initDate: 'test'};

        $scope.today = function() {
            $scope.dt_start = new Date().getTime();
            $scope.dt_end = new Date().getTime();
        };
        //  TODO - check it's OK not to call this in all use-cases
        // $scope.today();
        $scope.clear = function() {
            $scope.dt_start = null;
        };
        $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        //multiple date popups
        $scope.open = function($event, opened, date) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datepickers[opened] = true;
        };


        $scope.dateOptions = {formatYear: 'yy', startingDay: 1};


        // can't pass the object in as a JSON attribute :-(
        // ie must be a string value.
        $scope.startDateOptions = {formatYear: 'yy', startingDay: 1, initDate: $scope.dt_start};

        $scope.formats = ['yyyy-MM-dd'];
        $scope.format = $scope.formats[0];

        //are we in editmode, i.e. does the config editmode param exist?
        //if yes then grab project data
        $scope.editmode = !angular.isUndefined($route.current.editmode);


        $scope.copymode = !angular.isUndefined($route.current.copymode);

        // define the project reference so we can perform CRUD operations
        var projectRef = globalFuncs.getProjectRef($scope, $firebase, $routeParams),

            projectSync = globalFuncs.getProject($scope, $firebase, $routeParams);

        if ($scope.editmode || $scope.copymode) {
            projectSync.$loaded().then(function(data) {
                $scope.project = data;
                //set data
                $scope.dt_start = new Date($scope.project.date_start).getTime();
                $scope.dt_end = new Date($scope.project.date_end).getTime();

                $scope.diff = ProjectSVC.getDateDifference($scope.dt_start, $scope.dt_end);

                console.log('the diff between the days is: ', $scope.diff);
            });
        }


        /**
         * Will update the date property on the firebase db
         * @param obj
         */
        $scope.updateDate = function(obj) {

            //console.log('update date | edit mode: ', $scope.editmode);
            if (!$scope.editmode) {
                return;
            }

            if (obj.oldValue === obj.newValue) {
                return;
            }

            if (obj.type === 'dt_start') {
                FirebaseSVC.update(projectRef, {date_start: obj.newValue}).then(function(result) {
                    // success
                    $log.info('Start date successfully updated. -> ', result);
                    $scope.update(obj);

                }, function(error) {
                    // failure
                    $log.error('Start date not updated: ', error);
                });
            } else if (obj.type === 'dt_end') {
                FirebaseSVC.update(projectRef, {date_end: obj.newValue}).then(function(result) {
                    // success
                    $log.info('End date successfully updated.-> ', result);
                    $scope.update(obj);

                }, function(error) {
                    // failure
                    $log.error('End date not updated: ', error);
                });
            }
        };


        /**
         * Calls a service to update all the current project`s date objects
         */
        $scope.update = function(obj) {
            ProjectSVC.updateDates($scope.project, obj, projectRef, $scope.project.id, $scope, $firebase, $routeParams);
        };

        /**
         * Opens the error modal
         * @param obj
         */
        $scope.openModal = function(obj) {
            console.log('DateSVC - openModal!! | obj: ', obj);

            var modalInstance = $modal.open({
                templateUrl: 'partials/modal/project-error-modal.html',
                controller: 'ModalInstanceCtrl',
                //size: size,
                obj: obj
            });

            modalInstance.result.then(function() {
                // resolved
            }, function() {
                // dismissed
            }).finally(function() {
                // all
                rollback(obj);
            });
        };

        // rollback to the old value
        var rollback = function(obj) {
            // do the roll back
            if (obj.type === 'dt_start') {
                $scope.dt_start = obj.oldValue;
                if (!obj.oldValue) {
                    // if the old date is undefined we'll have to reset back to the empty string
                    $scope.dt_start_string = '';
                } else {
                    $scope.dt_start_string = new Date($scope.dt_start);
                }
            } else if (obj.type === 'dt_end') {
                $scope.dt_end = obj.oldValue;
                if (!obj.oldValue) {
                    // if the old date is undefined we'll have to reset back to the empty string
                    $scope.dt_end_string = '';

                } else {
                    $scope.dt_end_string = new Date($scope.dt_end);
                }
            }
        };


        // add watches for the time values
        $scope.$watch('dt_start', function(newValue, oldValue) {
            // ignore the initial change
            if (!newValue) {
                return;
            }
            $scope.dt_start = newValue;
            $scope.dt_start_string = new Date(newValue);
        });

        $scope.$watch('dt_end', function(newValue, oldValue) {
            // ignore the initial change
            if (!newValue) {
                return;
            }
            $scope.dt_end = newValue;
            $scope.dt_end_string = new Date(newValue);
        });


        /**
         * Create a new project
         * Gets the form data and then post to db.
         * @param newProject
         * @param copy
         * @returns {boolean}
         */
        $scope.create = function(newProject, copy) {

            // so we can disable the create button
            $scope.loading = true;

            // test the dates are valid first
            if ($scope.dt_start > $scope.dt_end) {
                //'sm' // TODO use this string if we want a smaller modal
                $scope.openModal(null);
                return false;
            }

            var data = {};

            data.notes = ' ';

            $scope.master = {};

            $scope.master = ProjectSVC.copyProject(newProject);

            if ($scope.master.name === undefined) {
                return false;
            } else {
                data.name = $scope.master.name;
            }
            // for copymode the user can add their own title without `COPY`
            if (copy == 1 && !$scope.copymode) {
                data.name = $scope.master.name + ' COPY';
            }

            // create an empty string if the notes have not been entered.
            $scope.master.notes = $scope.master.notes || '';

            // remove the associated artwork if copying
            if (copy == 1) {
                // configurations have already been copied
                data.configurations = $scope.master.configurations;

            } else {
                // set to the default if adding a new project
                //data.configurations = globalFuncs.blueprints($scope);

                data.configurations = $scope.configurations;
            }

            data.date_start = DateSVC.getStartTime() || new Date().getTime();

            // for copy mode we need to `shift` the end date
            if ($scope.copymode) {
                // need to create a new end date, the copied project will have the same number of days
                data.date_end = ProjectSVC.addDays(data.date_start, $scope.diff);
            } else {
                data.date_end = DateSVC.getEndTime() || new Date().getTime();
            }


            data.date_create = Firebase.ServerValue.TIMESTAMP;
            data.notes = $scope.master.notes;
            data.id = '';
            data.deleted = 'false';

            FirebaseSVC.createNewProject(data).then(function(result) {
                // success

                // reset the screens if not a copy
                if (copy !== 1) {
                    ProjectSVC.createScreens($firebase, result.id);
                }
                // redirect to homepage
                $location.path('/home');

            }, function(error) {
                // failure
                $log.error('Creation of new project failed: ', error);
                $scope.loading = false;
            });
        };
    }]);
