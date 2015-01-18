'use strict';

/**
 * A service used to perform various CRUD operations on the screen data within the firebase data
 */


scheduleServices.factory('ScreenSVC', ['$log', 'fbutil', 'globalFuncs', '$firebase', '$q', 'screenList', '_', function($log, fbutil, globalFuncs, $firebase, $q, screenList, _) {

    var FBURL = globalFuncs.getFirebaseUrl(),

        defaultScreen = {
            // won't be created as it as an empty array :-(
            screen_products: [],
            repeat: 'daily',
            day_parts: [false, false, false, false, false, false, false]
        },

        screens = screenList,
        currentScreen;



    return {
        getDefaultScreen: function() {
            return defaultScreen;
        },


        getScreen: function(screenId) {
            var deferred = $q.defer();
            screenList.$loaded().then(function(data) {
                // as object
                screens = data;
                //var screen = _.where(screens, {id: screenId})[0];
                //
                //currentScreen = screen;

                // ----
                // as reference
                // TODO tidy this up if possible
                var url = globalFuncs.getFirebaseUrl() + '/screens/' + screenId,
                    ref = new Firebase(url),
                    sync = $firebase(ref).$asObject();

                if (sync) {
                    deferred.resolve(sync);
                }
                // TODO -
                // reject(error);
            });
            return deferred.promise;
        },

        /**
         * Creates a Screen with a defined `timeslot`
         * @param timeslot
         * @param projetcId the project id
         * @param configId
         * @param slot
         * @param day
         * @returns {*}
         */
        createNewScreenWithTimeslot: function(timeslot, projectId, configId, slot, day) {
            var data = angular.copy(defaultScreen);
            data.day_parts[timeslot] = true;
            data.projects = [{projectId: projectId, configId: configId, slot: slot, day: day, timeslot: timeslot}];
            return this.createNewScreen(data, projectId);
        },
        createNewScreen: function(data, id) {
            data = data || defaultScreen;
            var ref = new Firebase(FBURL + '/screens'),
                sync = $firebase(ref),

                deferred = $q.defer(),

                screen = sync.$push(data).then(function(ref) {

                    sync = $firebase(ref);

                    var updateId = {id: ref.key()};

                    sync.$update(updateId).then(function(ref) {

                        deferred.resolve(updateId);

                    }, function(error) {
                        deferred.resolve(error);
                    });
                }, function(error) {
                    deferred.resolve(error);
                });

            return deferred.promise;
        },
        /**
         * Creates multiple screens and returns an array of those screen id's
         * @param index
         * @param number
         */
        createScreens: function(index, number) {
            var deferred = $q.defer(),
                screens = [],
                that = this,
                create = function() {
                    that.createNewScreen().then(function(result) {
                        // success
                        screens.push(result.id);
                        if (screens.length >= number) {
                            deferred.resolve({index: index, screens: screens});
                        }
                    }, function(error) {
                        // failure
                        deferred.resolve(error);
                    });
                };
            for (var i = 0; i < number; i++) {
                create();
            }
            return deferred.promise;
        },
        /**
         * Wrapper only....
         *
         * @param scope
         * @param $firebase
         * @returns {*}
         */
        getScreens: function(scope, $firebase) {
            var screensSync = globalFuncs.getScreens(scope, $firebase);

            return screensSync;
        }


    };
}]);

