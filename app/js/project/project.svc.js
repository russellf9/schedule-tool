'use strict';

/**
 * Performs various operations on the project data client-side
 */

scheduleServices.factory('ProjectSVC', ['DaysSVC', 'fbutil', '$log', 'globalFuncs', 'FirebaseSVC', '$firebase', 'ScreenSVC', '$q', '_', 'projectList', 'artworkList',
    function(DaysSVC, fbutil, $log, globalFuncs, FirebaseSVC, $firebase, ScreenSVC, $q, _, projectList, artworkList) {

        var projects = projectList,
            currentProject,
            timeSlots = globalFuncs.getTimeSlots(),
            artworks,

            /**
             * A utility which returns the default day_parts object
             * @returns {Array}
             */
            getDayParts = function() {
                var day_parts = [],
                    day_part = {time_slot: '', artwork_id: ''};

                for (var i = 0; i < timeSlots.length; i++) {
                    var item = {time_slot: timeSlots[i], artwork_id: '', screen: ''};
                    day_parts.push(item);
                }
                return {day_parts: day_parts};
            };
        return {

            /**
             * Sets a property in the service
             * @param project
             */
            setCurrentProject: function(project) {
                currentProject = project;
            },

            getArtworks : function() {

                var deferred = $q.defer();
                artworkList.$loaded().then(function(data) {

                    //1 as object

                    if (data) {
                        deferred.resolve(data);
                    }

                    artworks = data;
                    // TODO -
                    // reject(error);
                });
                return deferred.promise;
            },


            /**
             * Creates a object contains a moment date for each day of the campaign
             * @param project
             * @returns {*[moment]}
             */
            createDateObject: function(project) {
                var duration = this.getDuration(project.date_start, project.date_end),
                    momentDateStart = moment.utc(project.date_start).startOf('day'),
                // create an array of dates..
                    dates = [momentDateStart],
                    newDate = angular.copy(moment(momentDateStart));
                for (var i = 1; i < duration; i++) {
                    newDate = newDate.add(1, 'days');
                    dates.push(newDate);
                    newDate = angular.copy(newDate);
                }
                return dates;
            },

            /**
             * Defines the available Products for the screen with the supplied id
             * @param id screen id
             */
            getScreenProducts: function(id, screens, availableProducts) {

                var getProduct = function(id) {
                    return _.findByValue(availableProducts, 'id', id)[0];
                };
                //  console.log('ProjectSVC::getScreenProducts | id: ', id, ' | screens: ',screens);

                if (!id || id === '' || !screens) {
                    return;
                }

                var screen = _.findByValue(screens, 'id', id)[0],
                    products = [];

                if (!screen || !screen.screen_products) {
                    return;
                }

                // using old school for in loop as other methods were not working
                for (var i = 0; i < screen.screen_products.length; i++) {
                    if (screen.screen_products[i]) {
                        products.push(getProduct(screen.screen_products[i]));
                    }
                }

                return products;
            },

            getProject: function(projectId) {
                var deferred = $q.defer();
                projectList.$loaded().then(function(data) {
                    projects = data;
                    //1 as object
                    var project = _.where(projects, {id: projectId})[0];

                    currentProject = project;

                    // 2 as firebase object
                    // TODO tidy this up if possible
                    var url = globalFuncs.getFirebaseUrl() + '/projects/' + projectId,
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
             * Updates the `day-part` values of the supplied Project
             * @param project passed as reference so it can be directly manipulated
             * @param screen
             */
            updateDayParts: function(project, screen) {

                var projectData = screen.projects[0],

                // need config, slot, dayIndex
                    days = project.configurations[projectData.configId].screens[projectData.slot].days,

                    dayIndex = projectData.day;

                // If the repeat is `today` we want to:
                // remove from other days first
                if (screen.repeat === 'today') {

                    var day;

                    // 1. clear all the days first
                    angular.forEach(days, function(day, key) {
                        angular.forEach(day.day_parts, function(day_part, key) {
                            day_part.screen = '';
                        });
                    });

                    // modify
                    day = days[dayIndex];

                    // 2. now run through the day's day_part object and match the screens
                    angular.forEach(day.day_parts, function(day_part, key) {
                        if (screen.day_parts[key]) {
                            day_part.screen = screen.id;
                        } else {
                            day_part.screen = '';
                        }
                    });


                } else if (screen.repeat === 'daily') {
                    angular.forEach(days, function(day, key) {
                        angular.forEach(day.day_parts, function(day_part, key) {
                            if (screen.day_parts[key]) {
                                day_part.screen = screen.id;
                            }
                        });
                    });
                } else if (screen.repeat === 'weekly') {

                    // 1. clear all the days first
                    angular.forEach(days, function(day, key) {
                        angular.forEach(day.day_parts, function(day_part, key) {
                            day_part.screen = '';
                        });
                    });

                    var weekDays = [];
                    // 2. create an array of days to modify
                    angular.forEach(days, function(day, key) {
                        var theDay = key % 7;
                        if (theDay === dayIndex) {
                            weekDays.push(day);
                        }
                    });

                    // 3. modify those days
                    angular.forEach(weekDays, function(day, key) {
                        angular.forEach(day.day_parts, function(day_part, key) {
                            if (screen.day_parts[key]) {
                                day_part.screen = screen.id;
                            } else {
                                day_part.screen = '';
                            }
                        });
                    });
                }
            },

            /**
             * Creates a set of `headers` for a CSV file
             * @param project
             * @returns {string[]}
             */
            getProjectHeaders: function(project) {
                return ['Project Name', 'Start Date', 'End Date', 'Screen Configuration Name', 'Screen Orientation', 'TMS artwork name', 'TMS artwork ID', 'Stock Code'];
            },

            /**
             * Generates a file name for the exported CSV file
             * @param project
             * @returns {string}
             */
            getFileName: function(project) {
                // replace spaces in the name with an underscore
                return String(project.name).replace(/\s+/g, '_') + '.csv';
            },

            /**
             * Export the project data CSV conversion
             * @param project
             */
            getProjectData: function(project) {

                console.log('A artworks: ', artworks);

                artworks.$loaded().then(function(data) {
                    console.log('B artworks: ', data);
                });


                var array = [],
                    obj = {},
                    config = {},
                    configurations = {},
                    screens = {},
                    configuration_names = [],
                    screen_notes = [],
                    artwork = [],


                // need to lose the opening `-` in the string,
                    removeInitialChar = function(value) {
                        return String(value).substring(1);
                    },
                    getArtwork = function(id) {
                        return _.findByValue(artworks, 'id', id);
                    },
                    getArtworkName = function(id) {
                        var artwork =  getArtwork(id);
                        // bit messy here! ( should really wait for the list to properly load!
                        if (artwork && artwork[0] && artwork[0].hasOwnProperty('name')) {
                            console.log('artwork: ',artwork[0]);
                            console.log('artwork: ',artwork[0].name);
                            return artwork[0].name;
                        } else if (artwork && artwork.hasOwnProperty('name')){
                            return artwork.name;
                        }
                    };

                // create the data explicitly
                obj.name = project.name;
                obj.date_start = new Date(project.date_start).toDateString();
                obj.date_end = new Date(project.date_end).toDateString();


                // objects in the following formats will work:
                ///{a: 1, b:2}, {a: ['russell'], b: ['grace', 'russell']}, {a: [['russell'],['russell']]}
                array.push(obj);

                //array.push(configuration_names);
                //
                //array.push(artwork);
                // artwork.name

                // artworks.$getRecord(day_part.artwork_id).screen_code

                angular.forEach(project.configurations, function(configuration, key) {
                    var configName = configuration.name,
                        orientation = configuration.orientation;

                    angular.forEach(configuration.screens, function(screen, screenKey) {
                        angular.forEach(screen.days, function(day, dayKey) {
                            angular.forEach(day.day_parts, function(day_part, dayPartKey) {
                                array.push({
                                    a: '',
                                    b: '',
                                    c: '',
                                    name: configName,
                                    orientation: orientation,
                                    artworkName: getArtworkName(day_part.artwork_id),
                                    artworkId: removeInitialChar(day_part.artwork_id)
                                });
                            });
                        });
                    });
                });

                return array;
            },


            /**
             * A utility which calculates the inclusive days between two supplied dates
             * @param dateStart
             * @param dateEnd
             * @returns {*}
             */
            getDuration: function(dateStart, dateEnd) {
                return this.getDateDifference(dateStart, dateEnd) + 1;
            },
            /**
             * A utility which calculates the exclusive days between two supplied dates
             * @param dateOne
             * @param dateTwo
             * @returns {*}
             */
            getDateDifference: function(dateOne, dateTwo) {
                var momentOne = moment.utc(dateOne).startOf('day'),
                    momentTwo = moment.utc(dateTwo).startOf('day');
                return momentTwo.diff(momentOne, 'days');
            },


            addDays: function(dateOne, days) {
                var momentOne = moment.utc(dateOne).startOf('day'),
                    newDate = momentOne.add(days, 'days');
                return new Date(newDate.toDate()).getTime();
            },
            /**
             *
             * @param id the projects firebase id
             */
            createScreens: function($firebase, id) {
                // add a set of screens for each configuration

                // screen numbers
                // 0 - menuboard(s) - landscape - 5
                // 1 - menuboard(s) - landscape - 4
                // 2 - menuboard(s) - portrait - 5
                // 3 - menuboard(s) - portrait - 4
                // 4 - vestibule - portrait - 1
                // 5 - window(s) external - portrait - 1
                // 6 - window(s) internal - portrait - 1
                // 7 - window(s) external - portrait - 2
                // 8 - window(s) internal - portrait - 2
                // 9 - window(s) external - portrait - 3
                // 10 - window(s) internal - portrait - 3
                // 11 - McCafe - portrait - 1
                // 12 - McCafe - landscape - 1
                // 13 - Price menuboard - portrait - 1
                // 14 - Additional Screen - landscape - 1


                var list = globalFuncs.getScreenList(),
                    ref = new Firebase(globalFuncs.getFirebaseUrl() + '/projects/' + id + '/configurations'),
                    screen = {screen: 'screen-id'},

                    timeSlots = globalFuncs.getTimeSlots(),

                    day_parts = [],

                    days = [],

                    projectRef = new Firebase(globalFuncs.getFirebaseUrl() + '/projects/' + id),

                    date_start_ref = fbutil.ref(projectRef.path.toString() + '/date_start'),
                    date_end_ref = fbutil.ref(projectRef.path.toString() + '/date_end'),
                    date_start,
                    date_end,
                    duration,
                    that = this;

                // 1. Set the start date property
                date_start_ref.once('value', function(date) {
                    date_start = date.val();
                    console.log('create date_start: ', date_start);
                    setEndDate();
                });

                // 2. Set the end date property
                function setEndDate() {
                    // get the `snapshot` of the references data
                    date_end_ref.once('value', function(date) {
                        date_end = date.val();
                        set();
                    });
                }


                // 3. Now, create the new ....
                function set() {

                    duration = that.getDuration(date_start, date_end);

                    var day_part = {time_slot: '', artwork_id: ''};

                    for (var i = 0; i < timeSlots.length; i++) {
                        var item = {time_slot: timeSlots[i], artwork_id: '', screen: ''};
                        day_parts.push(item);
                    }

                    var days = [],
                        day = {day_parts: day_parts};

                    for (i = 0; i < duration; i++) {
                        days.push(day);
                    }

                    console.log('CC create - using set... days: ', days);

                    ref.once('value', function(snapshot) {
                        var index = 0,
                            configRef;

                        snapshot.forEach(function(item) {
                            var configuration = item.val(),

                                screens = [];

                            for (var i = 0; i < list[index]; i++) {
                                screens.push({days: days});
                            }

                            configRef = new Firebase(ref + '/' + index + '/screens/');

                            configRef.set(screens);


                            index = index + 1;
                        });
                    });
                }
            },
            /**
             * TODO - might be nice not to create the reference ID
             * @param $firebase
             * @param projectId
             * @param slotId
             * @param configId
             * @param data
             * @returns {*}
             */
            addScreenId: function($firebase, projectId, slotId, configId, data) {
                var ref = new Firebase(globalFuncs.getFirebaseUrl() + '/projects/' + projectId + '/configurations/' + configId + '/screens/' + slotId + '/screens/'),

                    sync = $firebase(ref),

                    deferred = $q.defer(),

                    screen = sync.$push(data).then(function(ref) {

                        sync = $firebase(ref);

                        var obj = {id: data};

                        sync.$update(obj).then(function(ref) {

                            deferred.resolve(obj);

                        }, function(error) {
                            deferred.resolve(error);
                        });
                    }, function(error) {
                        deferred.resolve(error);
                    });

                return deferred.promise;
            },


            /**
             * Makes a deep copy of the supplied project
             * Necessary as there was an issue with copying in IE9
             * Caveat - Might have to be updated if there are new properties with nested objects are added to the Project
             *
             * @param project the project to copy
             * @returns {object}
             */
            copyProject: function(project, clear) {

                var copy = {};
                if (clear) {
                    copy.configurations = angular.copy(this.updateConfigurations(project.configurations));
                } else {
                    copy.configurations = angular.copy(this.cleanData(project.configurations));
                }


                // add properties one by one, using key value pair
                angular.forEach(project, function(value, key) {
                    if (key !== 'configurations') {
                        copy[key] = angular.copy(value);
                    }
                });

                return copy;
            },

            /**
             * Resets the Project's start and end dates
             * Has the side effect of re-setting all of the screens with the default data :-(
             * @param obj contains the original request information, type and original value
             * @param projectRef
             * @param projectId
             * @param $scope
             * @param $firebase
             * @param $routeParams
             */
            updateDates: function(project, obj, projectRef, projectId, $scope, $firebase, $routeParams) {

                // get a self reference for the anonymous functions
                var that = this,

                // this reference will get the configurations
                    ref = fbutil.ref(projectRef.path.toString() + '/configurations'),
                    date_start_ref = fbutil.ref(projectRef.path.toString() + '/date_start'),
                    date_end_ref = fbutil.ref(projectRef.path.toString() + '/date_end'),
                    date_start,
                    date_end,
                    records = $firebase(fbutil.ref(projectRef.path.toString())).$asArray();

                date_start = records.$getRecord('date_start'); // record with $id === 'foo' or null

                // 1. Set the start date property
                date_start_ref.once('value', function(date) {
                    date_start = date.val();
                    setEndDate();
                });

                // 2. Set the end date property
                function setEndDate() {
                    // get the `snapshot` of the references data
                    date_end_ref.once('value', function(date) {
                        date_end = date.val();
                        evaluateNewScreens(projectId);
                    });
                }

                /**
                 * 3. For modifying the days within the screens
                 * @param projectId
                 */
                function evaluateNewScreens(projectId) {
                    // get the date difference
                    var diff = that.getDateDifference(obj.oldValue, obj.newValue);
                    if (obj.type === 'dt_start') {
                        //console.log('ProjectSVC::evaluateNewScreens | start | diff: ', diff);
                        // if the difference is -ve we need to add that number to the beginning
                        // if the difference is +ve we need to remove that number from the beginning
                        if (diff < 0) {
                            obj.unshift = diff; // add to the beginning of the list
                        } else if (diff > 0) {
                            obj.shift = diff; // remove from the beginning of the list
                        }
                    } else if (obj.type === 'dt_end') {
                        // console.log('ProjectSVC::evaluateNewScreens | end | diff: ', diff);
                        // if the difference is -ve we need to remove that number from the end
                        // if the difference is +ve we need to add that number to the end
                        if (diff < 0) {
                            obj.pop = diff; // add to the beginning of the list
                        } else if (diff > 0) {
                            obj.push = diff; // remove from the beginning of the list
                        }
                    }
                    // the reference for the configurations
                    var ref = new Firebase(globalFuncs.getFirebaseUrl() + '/projects/' + projectId + '/configurations'),

                    // the `sync` for the configurations
                        sync = $firebase(ref),
                        configurations,
                        daysRef,
                        dayPath,
                        daysSync;

                    fbutil.syncArray(ref.path.toString()).$loaded().then(function(data) {
                        configurations = data;
                        _.forEach(configurations, function(configuration, configId) {
                            _.forEach(configuration.screens, function(screen, screenIndex) {
                                // path for the days object
                                dayPath = ref.path.toString() + '/' + configId + '/screens/' + screenIndex + '/days/',
                                    // the ref for the days object
                                    daysRef = fbutil.ref(dayPath),
                                    // the sync for the days object
                                    daysSync = fbutil.syncObjectReference(daysRef);

                                // the collection as a $firebase array
                                var list = daysSync.$asArray(),
                                    items = [],
                                    number;

                                list.$loaded(
                                    function(data) {
                                        // $log.info('list loaded');
                                        // evaluate task
                                        //obj.unshift = diff; // add to the beginning of the list
                                        //obj.shift = diff; // remove from the beginning of the list
                                        //obj.pop = diff; // remove from the end of the list
                                        //obj.push = diff; // add to the end of the list

                                        // add to the beginning of the list
                                        if (obj.hasOwnProperty('unshift')) {
                                            //console.log('unshift', obj.unshift);
                                            number = obj.unshift * -1; // we have to reverse the sign
                                            items = [];
                                            for (var l = 0; l < number; l++) {
                                                items.push(list[l]);
                                            }
                                            // copy the original list
                                            var originalList = angular.copy(list);
                                            // remove all the items in the current list
                                            _.forEach(list, function(value, key) {
                                                var item = list[key];
                                                list.$remove(item).then(function(ref) {
                                                    var id = ref.key();
                                                    // $log.info('unshift removed record with id ' + id);
                                                });
                                            });
                                            // add the new items
                                            _.forEach(items, function(value, key) {
                                                list.$add(getDayParts()).then(function(ref) {
                                                    var id = ref.key();
                                                    // $log.info('unshift added record with id ' + id);
                                                });
                                            });
                                            //
                                            // add back the items from the original list
                                            _.forEach(originalList, function(value, key) {
                                                list.$add(value).then(function(ref) {
                                                    var id = ref.key();
                                                    // $log.info('unshift added record with id ' + id);
                                                });
                                            });
                                        } else if (obj.hasOwnProperty('shift')) {
                                            // shift - remove from the beginning of the list
                                            console.log('10:13 shift', obj.shift);
                                            items = [];
                                            for (var i = 0; i < obj.shift; i++) {
                                                items.push(list[i]);
                                            }
                                            _.forEach(items, function(value, key) {
                                                var item = list[key];
                                                list.$remove(item).then(function(ref) {
                                                    var id = ref.key();
                                                    // $log.info('shift removed record with id ' + id);
                                                });
                                            });
                                        } else if (obj.hasOwnProperty('pop')) {
                                            // pop - remove from the end of the list
                                            console.log('10:49 - pop', obj.pop);
                                            number = obj.pop * -1; // we have to reverse the sign
                                            items = [];
                                            var len = list.length;
                                            for (var j = 0; j < number; j++) {
                                                items.push(list[j]);
                                            }
                                            console.log('10:49 - pop len: ', items.length);
                                            _.forEach(items, function(value, key) {
                                                var item = list[len - (key + 1)];
                                                list.$remove(item).then(function(ref) {
                                                    var id = ref.key();
                                                    // $log.info('pop removed record with id ' + id);
                                                });
                                            });
                                        } else if (obj.hasOwnProperty('push')) {
                                            console.log('11:05 push', obj.push);
                                            items = [];
                                            for (var k = 0; k < obj.push; k++) {
                                                items.push(list[k]);
                                            }
                                            _.forEach(items, function(value, key) {
                                                list.$add(getDayParts()).then(function(ref) {
                                                    var id = ref.key();
                                                    // $log.info('push added record with id ' + id);
                                                });
                                            });
                                        }
                                    }, function(error) {
                                        $log.error('Error: ', error);
                                    });
                            });
                        });
                    });
                }
            },

            /**
             * Drill down to the `day_part` level and remove any `artwork_id` values
             * @param configurations
             * @returns {*}
             */
            resetConfigurations: function(value, clear) {

                if (!value) {
                    return {};
                }
                // clean the data first
                var configurations = angular.copy(value);

                configurations.forEach(function(configuration, k) {
                    // break if not object
                    if (!configuration || !angular.isObject(configuration)) {
                        return false;
                    }

                    if (!configuration.screens) {
                        return false;
                    }

                    configuration.screens.forEach(function(screen, k) {
                        if (!angular.isObject(screen)) {
                            return false;
                        }
                        if (!screen.days) {
                            return false;
                        }
                        screen.days.forEach(function(day, k) {
                            day.day_parts.forEach(function(day_part, k) {
                                if (day_part && day_part.hasOwnProperty('artwork_id')) {
                                    day_part.artwork_id = '';
                                }
                            });
                        });
                    });
                });

                // var endTime = performance.now();
                //console.log('updateConfigurations() - It took ' + (endTime - startTime) + ' ms.');

                return configurations;
            },

            /**
             * Drill down to the `day_part` level and remove any `artwork_id` values
             * @param configurations
             * @returns {*}
             */
            updateConfigurations: function(value, clear) {

                if (!value) {
                    return {};
                }
                // clean the data first
                var configurations = angular.copy(this.cleanData(value));

                configurations.forEach(function(configuration, k) {
                    // break if not object
                    if (!configuration || !angular.isObject(configuration)) {
                        return false;
                    }

                    if (!configuration.screens) {
                        return false;
                    }

                    configuration.screens.forEach(function(screen, k) {
                        if (!angular.isObject(screen)) {
                            return false;
                        }
                        if (!screen.days) {
                            return false;
                        }
                        screen.days.forEach(function(day, k) {
                            day.day_parts.forEach(function(day_part, k) {
                                if (day_part && day_part.hasOwnProperty('artwork_id')) {
                                    day_part.artwork_id = '';
                                }
                            });
                        });
                    });
                });

                // var endTime = performance.now();
                //console.log('updateConfigurations() - It took ' + (endTime - startTime) + ' ms.');

                return configurations;

            },

            /**
             * A function to deal with errors like:
             *  `configurations.0.screens.0.screen_products.1`
             *
             * @param value
             */
            cleanData: function(configurations) {

                if (!configurations) {
                    return configurations;
                }

                //var startTime = performance.now();

                configurations.forEach(function(configuration, k) {
                    if (!configuration || !angular.isObject(configuration) || !configuration.screens || !angular.isObject(configuration.screens)) {
                        return false;
                    }
                    // screen
                    configuration.screens.forEach(function(screen, k) {
                        if (!angular.isObject(screen)) {
                            return false;
                        }
                        var screen_products = [];

                        screen.screen_products = angular.copy(screen.screen_products);

                        if (!screen.screen_products || !angular.isObject(screen.screen_products) || !screen.screen_products.hasOwnProperty('forEach')) {
                            // doNothing();
                            $log.info('doNothing()');
                        } else {
                            screen.screen_products.forEach(function(screen_product, k) {
                                if (screen_product && screen_product !== undefined) {
                                    screen_products.push(screen_product);
                                }
                            });
                        }
                        screen.screen_products = screen_products;

                    });
                });
                // var endTime = performance.now();
                // console.log('cleanData - It took ' + (endTime - startTime) + ' ms.');

                return configurations;
            }
        };
    }]);


