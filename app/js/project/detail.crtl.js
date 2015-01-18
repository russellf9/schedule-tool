'use strict';

//controller for single project view
scheduleControllers.controller('ProjectDetailCtrl', ['$scope', '$log', '$firebase', '$routeParams', 'globalFuncs', '_', 'ScreenSVC', 'ProjectSVC', 'productList', 'screenList',
    function($scope, $log, $firebase, $routeParams, globalFuncs, _, ScreenSVC, ProjectSVC, productList, screenList) {
        console.log('\n****    ProjectDetailCtrl    ****\n\n');

        //get artworks for dropdowns
        var artworkSync = globalFuncs.getArtworksArray($scope, $firebase),

        //get project details
            projectSync = globalFuncs.getProject($scope, $firebase, $routeParams);

        // products
        productList.$loaded().then(function(data) {
            $scope.products = data;
        });

        // artwork NOTE  not being used some issue here
        //artworkList.$loaded().then(function(data) {
        //    //$scope.artworks = data;
        //    console.log('A $scope.artwork - ', data);
        //});

        // screens
        screenList.$loaded().then(function(data) {
            $scope.screens = data;
        });

        artworkSync.$loaded().then(function(adata) {
            $scope.artworks = adata;
            projectSync.$loaded().then(function(projdata) {

                projdata.$bindTo($scope, 'project');

                // not sure if we have to assign all the project properties to the scope..
                $scope.project = projdata;

                $scope.dates = ProjectSVC.createDateObject($scope.project);

                $scope.timeSlots = globalFuncs.getTimeSlots();

                //ProjectSVC.setCurrentProject($scope.project);
            });
        });


        /**
         * Gets the date with the supplied index
         * The `$scope.dates` object contains a date object for each day of the campaign
         * Used by the `days.html`
         * @param day the index of the day within the campaign
         */
        $scope.getDate = function(dayIndex) {
            return $scope.dates[dayIndex];
        };


        /**
         * A utility which gets a screen object
         * @param id
         * @returns {*} the first screen of the collection
         */
        $scope.getScreen = function(id) {
            if (!$scope.screens) {
                return null;
            }
            return _.findByValue($scope.screens, 'id', id)[0];
        };


        /**
         * TODO - can this be removed?
         * @param slot
         * @param index
         */
        $scope.selectScreen = function(slot, index) {
            console.log('index: ', index, ' | slot: ', slot);
        };


        /**
         * Creates a new Screen object
         * @param day the day index
         * @param slot position ( left to right )
         * @param timeslot time slot
         * @param config
         */
        $scope.addScreen = function(day, slot, timeslot, config) {
            console.log('day', day, 'slot: ', slot, ' | timeslot: ', timeslot, ' | config: ', config);


            // will have to do the following
            // 1. create a new screen object ( this will be automatic prior to editing ) - OK done

            // 2. will pass the timeslot to the new screen object ( write to the correct `day_part` ) - OK done

            // 4. The view/client would have to then link the `set` screens to the appropriate slots...
            // 4b. set the day_part id values... OK done

            // 5. Will have to update the values when the screen has been updated OK - DONE

            ScreenSVC.createNewScreenWithTimeslot(timeslot, $scope.project.id, config, slot, day).then(function(data) {
                //console.log('result: ', data.id);
                update(data.id, config, slot, day);
            }).then(function(error) {
            });
        };


        /**
         * Evaluates if a `link` is to be disabled
         * @param screenId
         * @param day
         * @param slot
         * @param timeslot
         * @param config
         * @returns {boolean}
         */
        $scope.evaluateScreenIsDisabled = function(screenId, day, slot, timeslot, config) {

            if (!screenId || screenId === '') {
                return false;
            }

            var screen = $scope.getScreen(screenId),
                project;
            if (screen) {
                project = screen.projects[0];
            }

            /// configId: 0, day: 0, projectId: "-JfSx1yNB5DLjzQUYQh2", slot: 1, timeslot: 1
            return !(project.configId === config && project.day === day && project.slot === slot && project.timeslot === timeslot);
        };

        /**
         *  Note: - just running through the screens for the time being
         *  We might have to do some real checking later
         *  TODO - extract to a service
         *  TODO use lo-dash to perform the search more efficiently
         * @param slot
         * @param config
         * @param day
         */
        var checksScreens = function(config, slot, dayIndex) {
                // 1. get the array of screens - these are objects which have a property id ( not to be confused with their own id )
                var array = $scope.project.configurations[config].screens[slot].screens,
                    screenIds = [];

                // 2. push those id's into a new array
                angular.forEach(array, function(value, key) {
                    screenIds.push(value.id);
                });

                // 3. now we can iterate through the screens
                angular.forEach(screenIds, function(value, key) {
                    var screen = $scope.getScreen(value);
                });
            },
            /**
             *
             * @param id
             * @param config
             * @param slot
             * @param dayIndex
             */
            update = function(id, config, slot, dayIndex) {
                ScreenSVC.getScreen(id).then(function(data) {
                    data.$loaded().then(function(screen) {
                        ProjectSVC.updateDayParts($scope.project, screen);
                    });
                });
            };

        /**
         * Defines the available Products for the screen with the supplied id
         * Used by the `days.html`
         * @see productDisplay.dir.js
         * @param id screen id
         */
        $scope.getScreenProducts = function(id) {

            if (!id || id === '') {
                return;
            }

            var screen = $scope.getScreen(id),
                products = [];

            if (!screen || !screen.screen_products) {
                return;
            }

            // using old school for in loop as other methods were not working
            for (var i = 0; i < screen.screen_products.length; i++) {
                if (screen.screen_products[i]) {
                    products.push($scope.getProduct(screen.screen_products[i]));
                }
            }

            return products;
        };
        /**
         *
         * @param id
         */
        $scope.getProduct = function(id) {
            return _.findByValue($scope.products, 'id', id)[0];
        };
    }]);
