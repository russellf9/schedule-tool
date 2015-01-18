// a simple wrapper on Firebase and AngularFire to simplify deps and keep things DRY
angular.module('firebase.utils', ['firebase'])
    .factory('fbutil', ['$window', '$firebase', 'globalFuncs', function($window, $firebase, globalFuncs) {
        'use strict';

        var FBURL = globalFuncs.getFirebaseUrl();

        return {
            syncObject: function(path, factoryConfig) {
                return syncData.apply(null, arguments).$asObject();
            },

            syncArray: function(path, factoryConfig) {
                return syncData.apply(null, arguments).$asArray();
            },

            ref: firebaseRef,

            syncObjectReference: function(value) {
                var ref = this.ref(value.path.toString());
                return $firebase(ref);
            }
        };

        function pathRef(args) {
            for (var i = 0; i < args.length; i++) {
                if (angular.isArray(args[i])) {
                    args[i] = pathRef(args[i]);
                } else if (typeof args[i] !== 'string') {
                    throw new Error('Argument ' + i + ' to firebaseRef is not a string: ' + args[i]);
                }
            }
            return args.join('/');
        }

        /**
         * Example:
         * <code>
         *    function(firebaseRef) {
         *       var ref = firebaseRef('path/to/data');
         *    }
         * </code>
         *
         * @function
         * @name firebaseRef
         * @param {String|Array...} path relative path to the root folder in Firebase instance
         * @return a Firebase instance
         */
        function firebaseRef(path) {
            var ref = new $window.Firebase(FBURL),
                args = Array.prototype.slice.call(arguments);
            if (args.length) {
                ref = ref.child(pathRef(args));
            }
            return ref;
        }

        /**
         * Create a $firebase reference with just a relative path. For example:
         *
         * <code>
         * function(syncData) {
         *    // a regular $firebase ref
         *    $scope.widget = syncData('widgets/alpha');
         *
         *    // or automatic 3-way binding
         *    syncData('widgets/alpha').$bind($scope, 'widget');
         * }
         * </code>
         *
         * Props is the second param passed into $firebase. It can also contain limit, startAt, endAt,
         * and they will be applied to the ref before passing into $firebase
         *
         * @function
         * @name syncData
         * @param {String|Array...} path relative path to the root folder in Firebase instance
         * @param {object} [props]
         * @return a Firebase instance
         */
        function syncData(path, props) {
            var ref = firebaseRef(path);
            props = angular.extend({}, props);
            angular.forEach(['limit', 'startAt', 'endAt'], function(k) {
                if (props.hasOwnProperty(k)) {
                    var v = props[k];
                    ref = ref[k].apply(ref, angular.isArray(v) ? v : [v]);
                    delete props[k];
                }
            });
            return $firebase(ref, props);
        }
    }]);


'use strict';

// Declare app level module which depends on views, and components
var tool = angular.module('schedule', [
    'ngRoute',
    'firebase.utils',
    'scheduleControllers',
    'scheduleFilters',
    'ui.checkbox',
    'scheduleServices',
    'ui.bootstrap',
    'firebase',
    'angularMoment',
    'taiPlaceholder',
    'ngOptionsDisabled',
    'ngSanitize',
    'ipCookie',
    'ngGrid',
    'ngCsv',
    'angularFileUpload'
]).config(['$routeProvider', function($routeProvider) {
    $routeProvider
        //PROJECTS
        .when('/project', {
            templateUrl: 'partials/projects-list.html',
            controller: 'ProjectsListCtrl',
            group: 'project'
        }).
        when('/project/view/:projectId', {
            templateUrl: 'partials/project.html',
            controller: 'ProjectDetailCtrl'
        }).
        when('/project/edit/:projectId', {
            templateUrl: 'partials/project-add.html',
            controller: 'ProjectEditCtrl',
            editmode: true
        }).
        when('/project/copy/:projectId', {
            templateUrl: 'partials/project-add.html',
            controller: 'ProjectEditCtrl',
            copymode: true
        }).
        when('/project/edit/:projectId/screen/:configIndex/:screenIndex', {
            templateUrl: 'partials/screens/screen-edit.html',
            controller: 'ScreenEditCtrl'
        }).
        when('/screen/:id', {
            templateUrl: 'partials/screens/screen-edit.html',
            controller: 'ScreenEditCtrl'
        }).
        when('/project/add', {
            templateUrl: 'partials/project-add.html',
            controller: 'ProjectEditCtrl'
        })
        //PRODUCTS
        .when('/product_category', {
            templateUrl: 'partials/product_category-list.html',
            controller: 'ProductListCtrl'
        }).
        when('/product_category/view/:productId', {
            templateUrl: 'partials/product_category.html',
            controller: 'ProductEditCtrl',
            editmode: true
        }).
        when('/product_category/add', {
            templateUrl: 'partials/product_category-add.html',
            controller: 'ProductEditCtrl'
        }).
        when('/product_category/edit/:productId', {
            templateUrl: 'partials/product_category-add.html',
            controller: 'ProductEditCtrl',
            editmode: true
        })
        //ASSETS
        .when('/asset', {
            templateUrl: 'partials/asset-list.html',
            controller: 'AssetListCtrl'
        })
        .when('/asset/view/:assetId', {
            templateUrl: 'partials/asset.html',
            controller: 'AssetEditCtrl',
            editmode: true
        })
        .when('/asset/add', {
            templateUrl: 'partials/asset-add.html',
            controller: 'AssetEditCtrl'
        }).
        when('/asset/edit/:assetId', {
            templateUrl: 'partials/asset-add.html',
            controller: 'AssetEditCtrl',
            editmode: true
        })
        //ARTWORK
        .when('/artwork', {
            templateUrl: 'partials/artwork-list.html',
            controller: 'ArtworkListCtrl'
        })
        .when('/artwork/view/:artworkId', {
            templateUrl: 'partials/artwork.html',
            controller: 'ArtworkEditCtrl',
            editmode: true
        })
        .when('/artwork/add', {
            templateUrl: 'partials/artwork-add.html',
            controller: 'ArtworkEditCtrl'
        }).
        when('/artwork/edit/:artworkId', {
            templateUrl: 'partials/artwork-add.html',
            controller: 'ArtworkEditCtrl',
            editmode: true
        })
        .otherwise({redirectTo: '/project'});
}]);
tool.run(['$rootScope', '$location', '$window', '_', function($rootScope, $location, $window, _) {
    $rootScope
        .$on('$viewContentLoaded',
        function(event) {
            if (!$window.ga) {
                return;
            }
            var page = $location.path(),
            // remove the id string if present
                index = page.indexOf('-');
            if (index > -1) {
                page = page.substr(0, index - 1);
            }

            $window.ga('send', 'pageview', {page: page});
        });
}]);
// I provide an injectable (and exteded) version of the underscore / lodash lib.
tool.factory(
    '_',
    function($window) {
        // Get a local handle on the global lodash reference.
        var _ = $window._;

        // OPTIONAL: Sometimes I like to delete the global reference to make sure
        // that no one on the team gets lazy and tried to reference the library
        // without injecting it. It's an easy mistake to make, and one that won't
        // throw an error (since the core library is globally accessible).
        // ALSO: See .run() block above.
        delete($window._);

        // ---
        // CUSTOM LODASH METHODS.
        // ---

        // I return the given collection as a natural language list.
        _.naturalList = function(collection) {
            if (collection.length > 2) {
                var head = collection.slice(0, -1),
                    tail = collection[collection.length - 1];
                return (head.join(', ') + ', and ' + tail);
            }

            if (collection.length === 2) {
                return (collection.join(' and '));
            }

            if (collection.length) {
                return (collection[0]);
            }
            return ('');
        };

        //
        _.mixin({
            findByValues: function(collection, property, values) {
                return _.filter(collection, function(item) {
                    if (item){
                        return _.contains(values, item[property]);
                    }
                });
            }
        });

        _.mixin({
            findByValue: function(collection, property, value) {
                return _.filter(collection, function(item) {
                    if (item){
                        return _.contains(value, item[property]);
                    }
                });
            }
        });

        // Return the [formerly global] reference so that it can be injected
        // into other aspects of the AngularJS application.
        return (_);
    }
);

tool.factory('projectList', ['fbutil', function(fbutil) {
    return fbutil.syncArray('projects');
}]);

tool.factory('screenList', ['fbutil', function(fbutil) {
    return fbutil.syncArray('screens');
}]);

tool.factory('productList', ['fbutil', function(fbutil) {
    return fbutil.syncArray('product_category');
}]);

tool.factory('artworkList', ['fbutil', function(fbutil) {
    return fbutil.syncArray('artwork');
}]);


'use strict';

/* Controllers */

var scheduleControllers = angular.module('scheduleControllers', []);

scheduleControllers.controller('globalFuncs', ['$scope', 'globalFuncs', '$route', '$firebase', '$location', '$routeParams', function($scope, globalFuncs, $route, $firebase, $location, $routeParams) {

    //nav selected state
    $scope.getClass = function(state) {
        return globalFuncs.navSelect($scope, $location, state);
    };

    $scope.saveArtWork = function(index) {
        console.log('saveArtWork');
    };


}]);


/***** PRODUCTS ****/
//list all products
scheduleControllers.controller('ProductListCtrl', ['$scope', '$firebase', 'globalFuncs',
    function($scope, $firebase, globalFuncs) {
        var sync = globalFuncs.getProducts($scope, $firebase);
        sync.$bindTo($scope, 'product_categorys');

        console.log('hi from the ProductListCtrl!');
    }]);


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
scheduleControllers.controller('ModalInstanceCtrl', function($scope, $modalInstance) {

    $scope.ok = function() {

        console.log('ok ', $scope.edit);

        if ($scope.edit){
            $modalInstance.close($scope.edit);
        } else {
            $modalInstance.close();
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.openModal = function() {
        console.log('open modal!');
    };
});

'use strict';

/* Filters */

angular.module('scheduleFilters', []).filter('checkmark', function() {
    return function(input) {
        return input ? '\u2713' : '\u2718';
    };
});


angular.module('scheduleFilters').filter('momentDay', function($filter) {
    return function(input) {
        if (!input || input === null || input === 'undefined' || input === '') {
            return '';
        }
        // will get the week day as a number
        var day = moment(input).day();
        return moment.weekdays(day);
    };
});



/**
 * TODO - there is a 'repeat` happening here which needs to be looked at
 */
angular.module('scheduleFilters').filter('momentDateFilter', function($filter) {
    return function(input) {
        if (!input || input === null || input === 'undefined' || input === '') {
            return '';
        }
        var _date = $filter('date')(new Date(input), 'EEE: yyyy-MM-dd');
        return _date;
    };
});


angular.module('scheduleFilters').filter('dateFilter', function($filter) {
    return function(input) {
        console.log('input', input);

        //var moment = moment(input);
        //
        //return moment;


        var _date = $filter('date')(new Date(input), 'EEE: yyyy-MM-dd');
        return _date;
    };
});


/**
 * @param input an Object
 * @param filterKey the key within the `input` object to find
 * @param filterVal the value of the `key` to match
 */
angular.module('scheduleFilters').filter('objectByKeyValFilter', function() {
    return function(input, filterKey, filterVal) {

        var isBoolean = function(value) {
                return (value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'false');
            },

            convertToBoolean = function(value) {
                return value.toString().toLowerCase() === 'true';
            },

            filteredInput = {};

        angular.forEach(input, function(value, key) {


            // check for null property as well!
            if (value && value.hasOwnProperty(filterKey)) {

                var compareBoolean = isBoolean(value[filterKey]),

                    keyValue;

                // if the filterKey is a boolean we must compare the boolean values
                if (compareBoolean) {
                    // 1. convert the key
                    keyValue = convertToBoolean(value[filterKey]);

                    // and the comparison
                    filterVal = convertToBoolean(filterVal);

                } else {

                    // we compare strings
                    keyValue = value[filterKey].toString().toLowerCase();

                    filterVal = filterVal.toString().toLowerCase();
                }

                if (keyValue !== filterVal) {
                    filteredInput[key] = value;
                }
            }
        });
        return filteredInput;
    };
});

angular.module('scheduleFilters').filter('objectKeyContainsVal', function() {
    return function(input, filterKey, filterVal) {

        // if the search item has not been set yet return all
        if (!filterVal) {
            return input;
        }

        var filteredInput = {};

        angular.forEach(input, function(value, key) {

            // check for null as well
            if (value && value[filterKey]) {

                // search without case
                var index = String(value[filterKey]).toLowerCase().indexOf(String(filterVal).toLowerCase());

                // if found add to the return value
                if (index > -1) {
                    filteredInput[key] = value;
                }
            }
        });
        return filteredInput;
    };
});

// filter using the classic JS sort
// sorts on the `field` parameter
angular.module('scheduleFilters').filter('orderObjectBy', function() {
    return function(items, field, reverse) {

        if (!field) {
            return items;
        }

        // utility function
        function isNumeric(num) {
            return !isNaN(num);
        }

        // test if first char is `-`
        if (field.indexOf('-') === 0) {
            field = field.substring(1);
            reverse = 'reverse';
        }

        var filtered = [];

        // push the items into an array
        angular.forEach(items, function(item, key) {
            filtered.push(item);
        });


        // seems to be working for all cases...

        // NOTE - should really check the key value - ie what `type` is in the item[field]
        if (!isNumeric(field)) {
            // now use string sort

            filtered.sort(function(a, b) {

                if (a[field].toString().toLocaleLowerCase() > b[field].toString().toLocaleLowerCase()) {
                    return 1;
                }
                if (a[field].toString().toLocaleLowerCase() < b[field].toString().toLocaleLowerCase()) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });


        } else {
            // now use the classic alpha-numeric sort

            filtered.sort(function(a, b) {

                if (a[field] > b[field]) {
                    return 1;
                }
                if (a[field] < b[field]) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });
        }

        if (reverse && reverse === 'reverse') {
            filtered.reverse();
        }

        return filtered;
    };
});

/**
 * Returns the supplied object as an array
 * Useful when we want to return the correct $index value
 */
angular.module('scheduleFilters').filter('arrayFilter', function() {
    return function(input) {

        if (!input) {
            return [];
        }

        var array = [];

        angular.forEach(input, function(item) {
            array.push(item);
        });

        var filteredInput = [];

        for (var i = 0; i < array.length; i++) {
            filteredInput.push(array[i]);
        }

        return filteredInput;
    };
});

/**
 * For returning an array of artworks, which do not include those with the supplied `id`
 * also, only returns artworks which are not `stitched`
 * // TODO make more generic
 */
angular.module('scheduleFilters').filter('arrayWithoutSelf', function() {
    return function(input, id) {

        if (!input) {
            return [];
        }

        var filteredInput = [];

        angular.forEach(input, function(item) {
            if (item.id !== id && item.stitched !== 'yes') {
                filteredInput.push(item);
            }
        });

        return filteredInput;
    };
});

/**
 * A filter for the checkbox type data, will compare the `yes` or `no` to
 * the `true` or `false` property.
 * @param filterKey the key within the `input` object to find
 * @param filterVal the value filter will be true or false
 */
angular.module('scheduleFilters').filter('booleanKeyValFilter', function() {

    var convertToBoolean = function(value) {
        return (value.toString().toLowerCase() === 'true') || (value.toString().toLowerCase() === 'yes');
    };

    return function(input, filterKey, filterVal) {

        if (!filterVal || filterVal === 'false') {
            return input;
        }
        var filteredInput = {};

        angular.forEach(input, function(value, key) {
            // double-check for null property as well!
            if (value && value.hasOwnProperty(filterKey)) {
                // we need to compare the checkbox flags
                if (filterVal && convertToBoolean(value[filterKey])) {
                    filteredInput[key] = value;

                } else if (!filterVal && !convertToBoolean(value[filterKey])) {
                    filteredInput[key] = value;
                }
            }
        });

        return filteredInput;
    };
});

/**
 * Removes items which have a $id which is undefined.
 */
angular.module('scheduleFilters').filter('nullFilter', function() {

    return function(input, filterKey, filterVal) {

        var filteredInput = [];

        angular.forEach(input, function(value, key) {
            if (value.$id && (value.$id !== 'undefined')) {
                filteredInput.push(value);
            }
        });

        return filteredInput;
    };
});

angular.module('scheduleFilters').filter('nl2br', function($filter) {
    return function(data) {
        if (!data) {
            return data;
        }
        return data.replace(/\n\r?/g, '<br />');
    };
});

angular.module('scheduleFilters').filter('sanitize', ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);

angular.module('scheduleFilters').filter('capitalizeAllWords', function() {
    return function(input, scope) {

        return input.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };
});



'use strict';

/* Services */

var scheduleServices = angular.module('scheduleServices', ['ngResource']);

scheduleServices.factory('globalFuncs', ['Blueprint', function(Blueprint) {

    // hard-coded values - be nice if they could be configured and injected perhaps

    // (for our test server)
    var stageUrl = 'https://mcd-dmb-schedule.firebaseio.com',

    //(for using locally)
    // devUrl = 'https://mcd-dmb-schedule-dev.firebaseio.com',
        devUrl = 'https://mcd-dmb-schedule-v2.firebaseio.com',

    //(for production)
        productionUrl = 'https://mcd-dmb-schedule-live.firebaseio.com',

        isDev = false,

    // use string for now, so value can be configured later
    //var mode = 'stageUrl';
        mode = 'devUrl';

    return {
        getFirebaseUrl: function() {
            var url = devUrl;
            switch (mode) {
                case 'devUrl':
                {
                    url = devUrl;
                    break;
                }
                case 'productionUrl':
                {
                    url = productionUrl;
                    break;
                }
                case 'stageUrl':
                {
                    url = stageUrl;
                    break;
                }
                default:
                {
                    console.log('Error - should have been one of the three defined types!');
                }
            }
            return url;
        },
        getProductsArray: function($scope, $firebase) {
            var ref = new Firebase(this.getFirebaseUrl() + '/product_category'),
                sync = $firebase(ref).$asArray();
            return sync;
        },
        getProducts: function($scope, $firebase, $routeParams) {
            var ref = new Firebase(this.getFirebaseUrl() + '/product_category'),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getScreens: function($scope, $firebase, $routeParams) {
            var ref = new Firebase(this.getFirebaseUrl() + '/screens'),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getProduct: function($scope, $firebase, $routeParams) {
            var ref = new Firebase(this.getFirebaseUrl() + '/product_category/' + $routeParams.productId),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getProjects: function($scope, $firebase) {
            var ref = new Firebase(this.getFirebaseUrl() + '/projects'),
                sync = $firebase(ref);
            $scope.projects = sync.$asObject();
            return $scope.projects;
        },
        getProject: function($scope, $firebase, $routeParams) {
            var ref = new Firebase(this.getFirebaseUrl() + '/projects/' + $routeParams.projectId),
                sync = $firebase(ref),
                projectSync = sync.$asObject();
            return projectSync;
        },
        getProjectFromId: function($scope, $firebase, id) {
            console.log('id:',id);
            var ref = new Firebase(this.getFirebaseUrl() + '/projects/' + id),
                sync = $firebase(ref),
                projectSync = sync.$asObject();
            return projectSync;
        },
        getProjectRef: function($scope, $firebase, $routeParams) {
            return new Firebase(this.getFirebaseUrl() + '/projects/' + $routeParams.projectId);
        },
        // TODO check if this is isn't needed
        //getScreens: function($scope, $firebase, $routeParams) {
        //    var url = this.getFirebaseUrl() + '/projects/' + $routeParams.projectId + '/configurations/' + $routeParams.configIndex + '/screens',
        //        ref = new Firebase(url),
        //        sync = $firebase(ref).$asObject();
        //    return sync;
        //},
        getScreensUrl: function($scope, $firebase, $routeParams, configId, screenId) {
            var url = this.getFirebaseUrl() + '/projects/' + $routeParams.projectId + '/configurations/' + configId + '/screens/' + screenId,
                ref = new Firebase(url);
            return ref;
        },
        //TODO
        getScreen: function($scope, $firebase, id) {
            var url = this.getFirebaseUrl() + '/screens/' + id,
                ref = new Firebase(url),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getConfig: function($scope, $firebase, $routeParams) {
            var url = this.getFirebaseUrl() + '/projects/' + $routeParams.projectId + '/configurations/' + $routeParams.configIndex,
                ref = new Firebase(url),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getAssets: function($scope, $firebase) {
            var ref = new Firebase(this.getFirebaseUrl() + '/asset'),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getAsset: function($scope, $firebase, $routeParams) {
            var ref = new Firebase(this.getFirebaseUrl() + '/asset/' + $routeParams.assetId),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getAssetsArray: function($scope, $firebase) {
            var ref = new Firebase(this.getFirebaseUrl() + '/asset'),
                sync = $firebase(ref).$asArray();
            return sync;
        },
        getArtworksArray: function($scope, $firebase) {
            var ref = new Firebase(this.getFirebaseUrl() + '/artwork'),
                sync = $firebase(ref).$asArray();
            return sync;
        },
        getArtworks: function($scope, $firebase) {
            var ref = new Firebase(this.getFirebaseUrl() + '/artwork'),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getArtwork: function($scope, $firebase, $routeParams) {
            var ref = new Firebase(this.getFirebaseUrl() + '/artwork/' + $routeParams.artworkId),
                sync = $firebase(ref).$asObject();
            return sync;
        },
        getTimes : function() {
            return ['5:00 - 10:30','10:30 - 11:30','11:30 - 14:30', '14:30 - 16:00', '16:00 - 20:00', '20:00 - end', 'ALL'];
        },
        getTimeSlots : function() {
            var times = this.getTimes();
            times.pop();
            return times;
        },
        // this `list` is an array which contains the number of screens for each screen type
        getScreenList : function() {
            return [5, 4, 5, 4, 1, 1, 1, 2, 2, 3, 3, 1, 1, 1, 1];
        },
        blueprints: function($scope) {

            //build the default blueprint object
            var daypartObj = [{time: 'mainday', artwork_id: ''}],
                dayObj = [{date: 'daily', day_parts: daypartObj}],
                productObj = [],
                screenObj = {
                    //4 products max
                    product_categorys: productObj,
                    days: dayObj,
                    run_daily: 'no',
                    day_type: 'mainday'
                };

            // { 5ML, 4ML, 5MP, 4MP, 1V, 1WE, 1WI, 2WE, 2WI, 3WE, 3WI }
            $scope.blueprint = {};

            /*[
             {
             name: 'menuboard(s)',
             display_orientation: true,
             orientation: 'landscape',
             notes: '',
             screens: [screenObj, screenObj, screenObj, screenObj, screenObj]
             },

             {
             name: 'menuboard(s)',
             display_orientation: true,
             orientation: 'landscape',
             notes: '',
             screens: [screenObj, screenObj, screenObj, screenObj]
             },

             {
             name: 'menuboard(s)',
             display_orientation: true,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj, screenObj, screenObj, screenObj, screenObj]
             },

             {
             name: 'menuboard(s)',
             display_orientation: true,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj, screenObj, screenObj, screenObj]
             },

             {
             name: 'vestibule',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj]
             },

             {
             name: 'window(s) external',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj]
             },

             {
             name: 'window(s) internal',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj]
             },

             {
             name: 'window(s) external',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj, screenObj]
             },

             {
             name: 'window(s) internal',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj, screenObj]
             },

             {
             name: 'window(s) external',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj, screenObj, screenObj]
             },

             {
             name: 'window(s) internal',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj, screenObj, screenObj]
             },

             {name: 'McCafe', display_orientation: true, orientation: 'portrait', notes: '', screens: [screenObj]},

             {name: 'McCafe', display_orientation: true, orientation: 'landscape', notes: '', screens: [screenObj]},

             {
             name: 'Price menuboard',
             display_orientation: false,
             orientation: 'portrait',
             notes: '',
             screens: [screenObj]
             }
             ];*/


            return $scope.blueprint;
        },
        navSelect: function($scope, $location, state) {
            var pathSearch = $location.url(),
                root = pathSearch.split('/'),
                selectedState = '';
            if (state == root[1]) {
                selectedState = 'selected';
            }
            return selectedState;
        }
    };
}]);



'use strict';

//controller for adding/editing artwork obj
scheduleControllers.controller('ArtworkEditCtrl', ['$scope', '$log', '$firebase', '$routeParams', '$route', '$location', '$timeout', 'globalFuncs', 'FirebaseSVC',
    function($scope, $log, $firebase, $routeParams, $route, $location, $timeout, globalFuncs, FirebaseSVC) {
        // for the assets
        var assetSync = globalFuncs.getAssetsArray($scope, $firebase);

        $scope.assetArr = assetSync;

        // for the artworks
        var artworkSync = globalFuncs.getArtworksArray($scope, $firebase);

        artworkSync.$loaded().then(function(data) {
            $scope.artworkArr = data;
        });

        //are we in editmode?
        $scope.editmode = !angular.isUndefined($route.current.editmode);

        //get data and sync with firebase
        var sync = globalFuncs.getArtwork($scope, $firebase, $routeParams);

        sync.$loaded().then(function(data) {
            // check the `stitched` property

            console.log('13:02 - ArtworkEditCtrl | $scope.editmode: ', $scope.editmode);
            if ($scope.editmode) {
                data.$bindTo($scope, 'artwork');

                if ($scope.artwork) {
                    $scope.artwork.$id = data.$id;
                }

                // check the `stitched` property
                // bit hackey but will populate the radio button property
                if (!data.stitched) {
                    data.stitched = 'no';
                }
            }

            /**
             *
             * @param key the index of the drop down
             */
            $scope.saveSelect = function(key) {
                // doNothing() - the syncing takes care of the update and repeats have been removed by the filter
                console.log('saveSelect: ', key);
            };
        });

        /**
         * Creates a new artwork and re-directs to the artwork page if successful
         *
         * @param fields
         */
        $scope.create = function(fields) {
            console.log('A CREATE ARTWORK');
            create(fields);
        };

        /**
         * A shared function which creates the new Artwork
         * @param fields
         * @param stitched
         * @returns {boolean}
         */
        var create = function(fields, stitched) {
            var pushdata = {},
                maxAssets = 4;
            $scope.master = angular.copy(fields);
            pushdata.assets = [];
            for (var i = 0; i < maxAssets; i++) {
                //ensure we don't create an empty array in firebase, it no likey
                pushdata.assets[i] = '-----';
            }

            if ($scope.master === undefined) {
                return false;
            }

            //check undefined variable, messy i know
            if ($scope.master.name === undefined) {
                return false;
            } else {
                pushdata.name = $scope.master.name;
            }
            if ($scope.master.path === undefined) {
                return false;
            } else {
                pushdata.path = $scope.master.path;
            }
            if ($scope.master.assets === undefined) {
                pushdata.assets = pushdata.assets;
            } else {
                //foreach this to have a clean array in firebase
                angular.forEach($scope.master.assets, function(value, key) {
                    pushdata.assets[key] = $scope.master.assets[key];
                });
            }

            pushdata.date_create = Firebase.ServerValue.TIMESTAMP;
            pushdata.id = '';
            pushdata.stitched = $scope.master.stitched ? $scope.master.stitched : 'no';
            pushdata.screen_code = ($scope.master.screen_code === undefined) ? '' : $scope.master.screen_code;
            pushdata.notes = ($scope.master.notes === undefined) ? '' : $scope.master.notes;
            pushdata.deleted = false;

            FirebaseSVC.createNewArtwork(pushdata).then(function(result) {
                // success
                $log.info('Artwork ', result.id, ' created.');

                if (!stitched) {
                    $location.path('/artwork');
                }

                return true;
            }, function(error) {
                // failure
                $log.error('Creation of new Artwork failed: ', error);
                return false;
            });
        };

        /**
         * Appends ths `stitched` signifier to the artwork name
         * @param artwork
         */
        $scope.toggleStitched = function(artwork) {

            // helper utility as we are using the strings `yes` and `no`
            var convertToBoolean = function(value) {
                return value.toString().toLowerCase() === 'yes';
            };

            if (!artwork.name) {
                return;
            }

            var name = artwork.name;

            if (convertToBoolean($scope.artwork.stitched) && $scope.editmode) {
                artwork.name = name;
                create(artwork, 'stitched');
            } else {
                // we just have to change the name of the `artwork`
                artwork.name = name;
            }
        };
    }]);

'use strict';

//list all artwork
scheduleControllers.controller('ArtworkListCtrl', ['$scope', '$firebase', 'globalFuncs',
    function($scope, $firebase, globalFuncs) {

        console.log('hi from the ArtworkListCtrl');

        var sync = globalFuncs.getArtworks($scope, $firebase);
        sync.$bindTo($scope, 'artworks');

        //lookup asset name from id
        $scope.assetArr = globalFuncs.getAssetsArray($scope, $firebase);

        $scope.artworkArr = globalFuncs.getArtworksArray($scope, $firebase);
    }]);

'use strict';


//controller for adding/editing assets obj
scheduleControllers.controller('AssetEditCtrl', ['$scope', '$log', '$firebase', '$routeParams', '$route', '$location', 'globalFuncs', 'FirebaseSVC','productList',
    function($scope, $log, $firebase, $routeParams, $route, $location, globalFuncs, FirebaseSVC, productList) {

        console.log('\n****    AssetEditCtrl    ****\n\n');
        //artworks
        $scope.artworksEls = globalFuncs.getArtworksArray($scope, $firebase);

        //are we in editmode?
        $scope.editmode = !angular.isUndefined($route.current.editmode);

        if ($scope.editmode) {
            //get data and sync with firebase
            var sync = globalFuncs.getAsset($scope, $firebase, $routeParams);
            sync.$bindTo($scope, 'asset');
        }

        // products
        productList.$loaded().then(function(data) {
            $scope.products = data;
        });

        /**
         *
         * @param fields
         * @returns {boolean}
         */
        $scope.create = function(fields) {

            console.log('Create! | fields: ', fields);

            var pushdata = {};
            $scope.master = angular.copy(fields);

            //check undefined variable, messy i know
            if ($scope.master === undefined) {
                return false;
            }
            if ($scope.master.name === undefined) {
                return false;
            } else {
                pushdata.name = $scope.master.name;
            }
            if ($scope.master.path === undefined) {
                return false;
            } else {
                pushdata.path = $scope.master.path;
            }

            pushdata.date_create = Firebase.ServerValue.TIMESTAMP;
            pushdata.id = 'some id';
            pushdata.notes = ($scope.master.notes === undefined) ? '' : $scope.master.notes;
            pushdata.deleted = 'false';
            pushdata.product_category = ($scope.master.product_category === undefined) ? '' : $scope.master.product_category;

            FirebaseSVC.createAsset(pushdata).then(function(result) {
                // success
                $log.info('Asset ', result.id, ' created.');
                //redirect to assets landing page
                $location.path('/asset');
                return true;
            }, function(error) {
                // failure
                $log.error('Creation of new Asset failed: ', error);
                return false;
            });
        };
    }]);

'use strict';


/***** ASSETS ****/
//list all assets
scheduleControllers.controller('AssetListCtrl', ['$scope', '$firebase', 'globalFuncs',
    function($scope, $firebase, globalFuncs) {

        console.log('hi from the AssetListCtrl');

        var sync = globalFuncs.getAssets($scope, $firebase);
        sync.$bindTo($scope, 'assets');

        //get products
        $scope.products = globalFuncs.getProductsArray($scope, $firebase);

        //artworks
        $scope.artworksEls = globalFuncs.getArtworksArray($scope, $firebase);

    }]);

'use strict';

/**
 * A directive used to handle links for both assets and artworks
 * Allows the firebase object to resolve before attaching the links
 */

tool.directive('assetLink', [function() {
    return {
        restrict: 'EA',
        replace: 'true',
        scope: {
            type: '@',
            index: '=',
            records: '=',
            item: '='
        },
        link: {
            post: function(scope, element, attr, ngModelController) {
                scope.records.$loaded(function(list) {
                    scope.record = scope.records.$getRecord(scope.item);
                });
            }
        },
        templateUrl: 'partials/shared/link.html'
    };
}]);

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


'use strict';

/**
 * A directive used to display the `blueprint`
 * Also using a directive rather than a `ng-include` will help with optimization
 */

tool.directive('blueprint', [function() {
    return {
        restrict: 'EA',
        templateUrl: 'partials/screens/blueprint.html'
    };
}]);


'use strict';


scheduleServices.factory('DaysSVC', function() {

    var times = ['05:00', '10:30', '11:30', '14:30', '16:00', '20:00', '05:00'],
        timeDisplay = ['05:00', '10:30', '11:30', '14:30', '16:00', '20:00', '05:00'],
        slots = ['breakfast', 'mainday', 'mainday', 'mainday', 'mainday', 'mainday'];

    return {

        /**
         * Populates the object with the set of `date slots`
         *
         05:00 - 10:30
         10:30 - 11:30
         11:30 - 14:30
         14:30 - 16:00
         16:00 - 20:00
         20:00 - close/5:00
         */


        getSlots: function() {
            var num = 6,
                array = [],
                obj = {};
            for (var i = 0; i < num; i++) {
                obj = {day_part_time: slots[i], artwork_id: ''};
                array.push(obj);
            }
            return array;
        },


        /**
         *
         * @param day_type
         * @param run_daily
         * @returns {Array}
         */
        getTimeSlots: function(day_type, run_daily) {
            var num = (day_type === 'all') ? 6 : 1,
                array = [],
                obj = {};
            for (var i = 0; i < num; i++) {

                if (day_type === 'mainday') {
                    obj = {time: 'mainday', artwork_id: ''};
                } else if (day_type === 'breakfast') {
                    obj = {time: 'breakfast', artwork_id: ''};
                } else if (day_type === 'all') {
                    obj = {startTime: times[i], endTime: times[i + 1], artwork_id: ''};
                } else { // the default if there is no day_type
                    obj = {time: 'mainday', artwork_id: ''};
                }

                array.push(obj);
            }

            return array;
        }
    };
});

'use strict';

/**
 * A directive used to display the `day` information
 * Also, using a directive rather than a `ng-include` will help with optimization
 */

tool.directive('days', [function() {
    return {
        restrict: 'EA',

        scope: {
            slot: '=',
            config: '=',
            configIndex: '=',
            screen: '=',
            dates: '=',
            screens: '=',
            products: '=',
            artworks: '=',
            // this function is just passed downwards to the productDisplay directive
            getScreenProducts: '&',
            addScreenFn: '&',
            screenIsDisabled: '&'

        },

        controller: function($scope) {
            /**
             * Returns the date from the collection with the supplied index
             * @param index from the first day of the campaign to the last
             */
            $scope.getDate = function(index) {
                return $scope.dates[index];
            };
            /**
             * Creates a new `Screen`
             * @param day
             * @param slot
             * @param index
             * @param config
             */
            $scope.addScreen = function(day, slot, index, config) {
                $scope.addScreenFn()(day, slot, index, config);
            };
            /**
             * Evaluates if the screen in the specified screen should be disabled
             * ( Only the first screen will be enabled )
             * @param screenId
             * @param day
             * @param slot
             * @param index
             * @param config
             * @returns {*}
             */
            $scope.evaluateScreenIsDisabled = function(screenId, day, slot, index, config) {
                return $scope.screenIsDisabled()(screenId, day, slot, index, config);
            };

            $scope.isDisabled = function(screenId, day, slot, index, config) {
                return $scope.screenIsDisabled()(screenId, day, slot, index, config);
            };

        },

        link: {
            post: function(scope, element, attr, ngModelController) {
            }
        },

        templateUrl: 'partials/screens/days.html'
    };
}]);

'use strict';

//controller for adding/editing a product obj
scheduleControllers.controller('ProductEditCtrl', ['$scope', '$log', '$firebase', '$routeParams', '$route', '$location', 'globalFuncs', 'FirebaseSVC',
    function($scope, $log, $firebase, $routeParams, $route, $location, globalFuncs, FirebaseSVC) {

        console.log('hi from the ProductEditCtrl!');

        //are we in editmode?
        $scope.editmode = !angular.isUndefined($route.current.editmode);

        //get data and sync with firebase
        if ($scope.editmode) {
            var sync = globalFuncs.getProduct($scope, $firebase, $routeParams);
            sync.$loaded().then(function(data) {
                data.$bindTo($scope, 'product_category');
            });
        }

        /**
         *
         * @param fields
         * @returns {boolean}
         */
        $scope.create = function(fields) {

            console.log('CREATE - FIELDS: ', fields);
            var pushdata = {};
            $scope.master = angular.copy(fields);

            if ($scope.master === undefined || $scope.master.name === undefined) {
                return false;
            } else {
                pushdata.name = $scope.master.name;
            }
            pushdata.date_create = Firebase.ServerValue.TIMESTAMP;
            pushdata.id = '';
            pushdata.deleted = 'false';


            FirebaseSVC.createProductCategory(pushdata).then(function(result) {
                // success
                $log.info('Product Category ', result.id, ' created.');
                //redirect to products landing page
                $location.path('/product_category');
                return true;
            }, function(error) {
                // failure
                $log.error('Creation of new Product Category failed: ', error);
                return false;
            });
        };
    }]);

'use strict';

/**
 * A directive used to display the screens product
 */
tool.directive('productDisplay', [function() {
    return {
        restrict: 'EA',
        scope: {
            screen: '@',
            screens: '=',
            fn: '&',
            getScreenProducts: '&'
        },

        link: {
            post: function(scope, element, attrs) {
                if (scope.screen) {
                    // get the available products for the specified `screen`
                    scope.products = scope.fn()(scope.screen, scope.screens, scope.products);
                }
            }
        },

        template: '<div style="display:inline;" ng-repeat="product in products track by $index"><span ng-class="{first: $first}">{{$index+1}}. {{product.name}} </span></div>'
    };
}]);


'use strict';

/**
 * Performs various operations on the project data client-side
 */

scheduleServices.factory('ProjectSVC', ['DaysSVC', 'fbutil', '$log', 'globalFuncs', 'FirebaseSVC', '$firebase', 'ScreenSVC', '$q', '_', 'projectList',
    function(DaysSVC, fbutil, $log, globalFuncs, FirebaseSVC, $firebase, ScreenSVC, $q, _, projectList) {

        var projects = projectList,
            currentProject,
            timeSlots = globalFuncs.getTimeSlots(),

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
                return ['Name', 'id', 'Date Created', 'Start Date', 'End Date', 'Deleted', 'Notes'];
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
                var array = [],
                    obj = {},
                    configurations = {},
                    screens = {},
                    configuration_names = [],
                    screen_notes = [],
                    artwork = [],
                // need to lose the opening `-` in the string,
                    removeInitialChar = function(value) {
                        return String(value).substring(1);
                    };
                // create the data explicitly
                obj.name = project.name;
                if (String(project.id)[0] === '-') {
                    obj.project_id = removeInitialChar(project.id);
                    // as excel interprets this as a minus symbol
                } else {
                    obj.project_id = String(project.id);
                }
                obj.date_create = new Date(project.date_create).toDateString();
                obj.date_start = new Date(project.date_start).toDateString();
                obj.date_end = new Date(project.date_end).toDateString();
                obj.deleted = String(project.deleted);
                obj.notes = String(project.notes);


                // objects in the following formats will work:
                ///{a: 1, b:2}, {a: ['russell'], b: ['grace', 'russell']}, {a: [['russell'],['russell']]}
                array.push(obj);

                array.push(configuration_names);

                array.push(artwork);

                angular.forEach(project.configurations, function(configuration, key) {
                    configuration_names[key] = configuration.name + ' ' + configuration.orientation;

                    angular.forEach(configuration.screens, function(screen, screenKey) {
                        angular.forEach(screen.days, function(day, dayKey) {
                            angular.forEach(day.day_parts, function(day_part, dayPartKey) {
                                if (day_part.hasOwnProperty('artwork_id') && day_part.artwork_id !== '') {
                                    artwork[key] = removeInitialChar(day_part.artwork_id);
                                }
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


            addDays : function(dateOne, days) {
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

'use strict';

/**
 * Used to select a date value on a separate date service.
 * Will perform a function according to the result from the service.
 *
 */
tool.directive('dateInput', ['$filter', '$parse', 'dateFilter', 'DateSVC', function($filter, $parse, dateFilter, DateSVC) {

    var isSet = false;

    return {
        require: 'ngModel',
        template: '<input type="string"></input>',

        replace: true,

        link: function(scope, elm, attrs, ngModelCtrl) {
            ngModelCtrl.$formatters.unshift(function(modelValue) {
                if (modelValue) {
                    //  TODO - see if this initialisation can be done differently
                    DateSVC.setInitialValue(attrs.name, modelValue);
                    return dateFilter(new Date(modelValue), 'yyyy-MM-dd');
                }
            });

            ngModelCtrl.$parsers.unshift(function(viewValue) {
                if (viewValue) {
                    var date = new Date(viewValue),
                        obj = DateSVC.setValue(attrs.name, date.getTime()),
                        invoker;

                    if (obj.code === 'ERROR') {
                        invoker = $parse(attrs.ctrlFn);
                        invoker(scope)(obj);
                    } else {
                        invoker = $parse(attrs.updateFn);
                        invoker(scope)(obj);
                    }
                    return obj.date;
                }
            });
        }
    };
}]);


'use strict';

/**
 * A very simple directive used to call a supplied function
 */

tool.directive('dateButton', [function() {
    return {
        restrict: 'EA',

        scope: {
            method: '&',
            type: '@'
        },

        controller: function($scope) {
            /**
             *
             * @param event
             * @param type a string of value `dt_start` or `dt_end`
             * @param date the new date
             */
            $scope.open = function(event, type, date) {
                $scope.method()(event, $scope.type);
            };
        },

        templateUrl: 'partials/date/date-button.html'
    };
}]);

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

'use strict';

scheduleControllers.controller('ProjectsListCtrl', ['$scope', '$firebase', '$filter', 'globalFuncs',
    function($scope, $firebase, $filter, globalFuncs) {

        $scope.projects = globalFuncs.getProjects($scope, $firebase);

        $scope.screen_products = [];

        console.log('B hi from the ProjectsListCtrl!');

    }]);

'use strict';

//controller for single project view
scheduleControllers.controller('ProjectDetailCtrl', ['$scope', '$log', '$firebase', '$routeParams', 'globalFuncs', '_', 'ScreenSVC', 'ProjectSVC', 'productList', 'screenList',
    function($scope, $log, $firebase, $routeParams, globalFuncs, _, ScreenSVC, ProjectSVC, productList, screenList) {
        console.log('\n****    ProjectDetailCtrl    ****\n\n');

        //get artworks for dropdowns
        var  artworkSync = globalFuncs.getArtworksArray($scope, $firebase),

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

            if (!screenId || screenId === ''){
                return false;
            }

            var screen = $scope.getScreen(screenId),
                project = screen.projects[0];

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

'use strict';

/**
 * A directive used to import Project data
 */
tool.directive('projectImport', ['ProjectSVC', 'FileUploader', 'storageSVC', function(ProjectSVC, FileUploader, storageSVC) {
    return {
        restrict: 'EA',
        scope: {
            project: '='
        },
        controller: function($scope) {
            var uploader = $scope.uploader = new FileUploader({
                url: '/upload.php',
                autoUpload: true
            });
            uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };
            uploader.onAfterAddingFile = function(data) {
                console.log('add - item: ',data.file);
               // console.log('add -' , uploader);
                $scope.loading = true;
               // ProjectSVC.create(data.file);
            };
            uploader.onProgressItem = function(fileItem, progress) {
                console.info('onProgressItem', fileItem, progress);
            };
            uploader.onSuccessItem = function(fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
            };
            uploader.onCompleteAll = function() {
                console.info('onCompleteAll');
                $scope.loading = false;
            };
            uploader.onBeforeUploadItem = function(data) {
                console.log('WILL REPLACE UPLOADER WITH API CALL!');
            };
        },
        link: {
            post: function(scope, element, attr) {
                if (!storageSVC.canImportData()){
                    element.remove();
                }
            }
        },
        template: '<input role="button" id="files" class="hidden" type="file" title=" " nv-file-select="" uploader="uploader" />' +
                    '<label class="btn btn-default btn-sm" for="files" ng-disabled="loading">Import</label>'
     };
}]);

'use strict';

/**
 * This Service just keeps the values of the start and end date
 */

scheduleServices.factory('DateSVC', [function() {

    // currently using Date
    var startTime,
        endTime;

    return {

        /**
         * Resets the date to the supplied value
         * Note: - Being set by the directive, doesn't feel like the correct approach
         * @param type
         * @param value
         */
        setInitialValue: function(type, value) {
            if (type === 'dt_start' && !startTime) {
                startTime = new Date(value).getTime();

            } else if (type === 'dt_end' && !endTime) {
                endTime = new Date(value).getTime();
            }
        },

        // clears both values, used when a new project is in view
        reset: function() {
            startTime = endTime = undefined;
        },

        getStartTime: function() {
            return startTime;
        },

        getEndTime: function() {
            return endTime;
        },


        /**
         * Sets the either the startTime or endTime property
         * @param type a string which defines the startTime or endTime
         * @param newValue
         */
        setValue: function(type, newValue) {
            var oldValue;

            if (type === 'dt_start') {
                oldValue = startTime;
                if ((newValue && newValue <= endTime) || !endTime) {
                    // ok to update, so set the new value and return it
                    startTime = newValue;
                    return {newValue: startTime, oldValue: oldValue, type: type, code: 'OK'};

                } else {
                    // return error code so the end user can reset to the oldValue
                    return {oldValue: oldValue, newValue: newValue, type: type, code: 'ERROR'};
                }
            } else if (type === 'dt_end') {
                oldValue = endTime;
                if (newValue && newValue >= startTime || !startTime) {
                    // ok to update, so set the new value and return it
                    endTime = newValue;
                    return {newValue: endTime, oldValue: oldValue, type: type, code: 'OK'};

                } else {
                    // return error code so the end user can reset to the oldValue
                    return {oldValue: oldValue, newValue: newValue, type: type, code: 'ERROR'};
                }
            }
        }
    };
}]);

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
            project: '=',
            id: '@',
            screens: '='
        },
        controller: function($scope) {
        },
        link: {
            post: function(scope, elem, attr) {
                // have to watch the update to the attribute as it's value relies on the `interpolation`
                scope.$watch('id', function(value) {
                    if (value) {
                        scope.screen = Number(value) + 1;
                    }
                });
                scope.$watch('project', function(value) {
                    if (value) {
                        console.log('config: ', value)
                    }
                });
            }
        },
        templateUrl: 'partials/screen/title.html'
    };
}]);

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


'use strict';

tool.directive('aDisabled', function($compile) {
    return {
        scope: {
            disabled: '='
        },
        link: {
            post: function(scope, element, attr) {
                element.on('aDisabled click', function(e) {
                    if (scope.disabled){
                        e.preventDefault();
                    }
                });
            }
        }
    };
});

'use strict';

/**
 * A directive used to add the text `Archived` to the set mark-up
 */

tool.directive('archived', [function() {

    var evaluateAsBoolean = function(value) {

        if (typeof value === 'string') {
            // 1. for string
            return value.toLowerCase() === 'true';
        } else if (typeof value === 'boolean') {
            // 2. for boolean
            return value;
        }
        return false;
    };


    return {
        restrict: 'EA',
        scope: {
            theStyle: '@',
            deleted: '='
        },
        controller: function($scope) {
            $scope.isDeleted = function(value) {
                return evaluateAsBoolean(value);
            };
        },
        link: function(scope, element, attrs) {
        },
        templateUrl: 'partials/shared/archived.html'
    };
}]);

'use strict';


/**
 * General-purpose Fix IE 8 issue with parent and detail controller.

 * @example <select sk-ie-select="parentModel">
 *
 * @param sk-ie-select require a value which depend on the parent model, to trigger rendering in IE8
 */
tool.directive('ieSelectFix', [
    function() {

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attributes, ngModelCtrl) {
                var isIE = document.attachEvent;
                if (!isIE) {
                    return;
                }

                var control = element[0];
                //to fix IE8 issue with parent and detail controller, we need to depend on the parent controller
                scope.$watch(attributes.ieSelectFix, function() {
                    //this will add and remove the options to trigger the rendering in IE8
                    var option = document.createElement('option');
                    control.add(option, null);
                    control.remove(control.options.length - 1);
                });
            }
        };
    }
]);

'use strict';

/**
 * A simple directive to use the browser history to implement `back` behaviour
 */

tool.directive('backButton', ['$window', function($window) {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            // note `timeout` required due to IE9 bug
            element.bind('click', function() {
                setTimeout(function() {
                    $window.history.back();
                }, 10);
            });
        }
    };
}]);

'use strict';

/**
 * A simple directive which will remove the attributes' element according to the value of `editMode`
 * from the relevant service
 */
tool.directive('editMode', ['storageSVC', function(storageSVC) {
    return {
        restrict: 'A',
        link: {
            post: function(scope, element, attr) {
                if (!storageSVC.isEditMode()) {
                    element.hide();
                }
                scope.$watch(
                    function() {
                        return storageSVC.isEditMode();
                    },
                    function(newValue, oldValue) {
                        if (newValue === false) {
                            element.hide();
                        } else {
                            element.show();
                        }
                    },
                    true
                );
            }
        }
    };
}]);


'use strict';

/**
 * A simple directive which set the value of `editMode` of the relevant service
 */
tool.directive('editButton', ['storageSVC', function(storageSVC) {
    return {
        restrict: 'A',
        link: {
            pre: function(scope, element, attr) {
                scope.editMode = storageSVC.isEditMode();
            },
            post: function(scope, element, attr, ngModelController) {
                scope.ready = true;
                element.bind('click', function() {
                    scope.$apply(function() {
                        if (storageSVC.isEditMode()) {
                            storageSVC.setEditMode('false');
                        } else {
                            storageSVC.setEditMode('true');
                        }
                        scope.editMode = storageSVC.isEditMode();
                    });
                });
            }
        }
    };
}]);


'use strict';

/**
 *  A service responsible for saving and getting values from local storage
 */
scheduleServices.factory('storageSVC', ['$log', function($log) {
    return {
        visited: function() {
            // keep the values as strings
            return (localStorage.visited) ? (localStorage.visited && localStorage.visited === 'true') : false;
        },

        setVisited : function(value) {
            localStorage.setItem('visited', value);
        },

        canImportData : function() {
            return false;
        },

        canExportData : function() {
            return this.isEditMode();
        },

        isEditMode : function() {
            return (localStorage.editMode) ? (localStorage.editMode && localStorage.editMode === 'true') : false;
        },
        /**
         * Sets the property of the edit mode to the supplied value
         * If the new value is undefined will set the property to false
         * @param value
         */
        setEditMode : function(value) {
            if (value && value.toLowerCase() === 'true') {
                localStorage.setItem('editMode', 'true');
            } else if (!value || value.toLowerCase() === 'false') {
                localStorage.setItem('editMode', 'false');
            } else {
                $log.error('Can only set `editMode` to `true` or `false` - not: ', value);
            }
        }
    };
}]);


'use strict';

/**
 * A service used to perform various CRUD operations on the Firebase database
 */


scheduleServices.factory('FirebaseSVC', ['fbutil', 'globalFuncs', '$firebase', '$q', function(fbutil, globalFuncs, $firebase, $q) {

    /**
     *
     * @param error
     */
    var onComplete = function(error) {
        if (error) {
            console.log('Date Synchronization failed');
        } else {
            console.log('Date Synchronization succeeded');
        }
    };

    return {

        /**
         * Returns a promise for the creation of a new Project
         * @param data the new Project's data
         * @returns {*} the promise which contains the id of the new Project or contains the error message
         */
        createNewProject: function(data) {

            var ref = new Firebase(globalFuncs.getFirebaseUrl() + '/projects'),

                sync = $firebase(ref),

                deferred = $q.defer(),

                project = sync.$push(data).then(function(ref) {

                sync = $firebase(ref);

                var updateId = {id: ref.key()};

                sync.$update(updateId).then(function(ref) {

                    deferred.resolve(updateId);

                },function(error) {
                    deferred.resolve(error);
                });
            }, function(error) {
                deferred.resolve(error);
            });

            return deferred.promise;
        },

        /**
         * Updates the supplied key value pair to the firebase data
         * @param projectRef
         * @param obj the new data
         * @returns {*} the promise which either contains the key of the reference modified or contains the error message
         */
        update : function(projectRef, obj) {

            var deferred = $q.defer();

            $firebase(projectRef).$update(obj).then(function(ref) {
                deferred.resolve(ref.key());
            }, function(error) {
                deferred.resolve(error);
            });

            return deferred.promise;
        },

        /**
         * Creates a new Artwork in the Firebase db
         * @param data
         * @returns {*} the promise which contains the id of the new Artwork or contains the error message
         */
        createNewArtwork : function(data) {

            console.log('C CREATE ARTWORK');

            var artworkRef = new Firebase(globalFuncs.getFirebaseUrl() + '/artwork'),

                deferred = $q.defer(),

                newObj;

            newObj = artworkRef.push(data, function(error, result) {
                if (error) {
                    console.log('E CREATE ARTWORK -- ERROR! :-(');
                    deferred.resolve(error);
                } else {

                    console.log('E CREATE ARTWORK -- SUCCESS! :-)');
                    var objUid = newObj.key(),
                        updateId = {id: objUid},
                        updateObj = artworkRef.child(objUid).update(updateId);
                    deferred.resolve(updateId);
                }
            });

            return deferred.promise;
        },

        /**
         * Creates a new Product Category in the Firebase db
         * @param data the data
         * @returns {*} the promise which contains the id of the new Product or contains the error message
         */
        createProductCategory : function(data) {

            var dataRef = new Firebase(globalFuncs.getFirebaseUrl() + '/product_category'),

                deferred = $q.defer(),
                newObj;

            newObj = dataRef.push(data, function(error, result) {
                if (error) {
                    deferred.resolve(error);
                } else {
                    var objUid = newObj.key(),
                        updateId = {id: objUid},
                        updateObj = dataRef.child(objUid).update(updateId);
                    deferred.resolve(updateId);
                }
            });

            return deferred.promise;
        },

        /**
         * Creates a new Asset in the Firebase db
         * @param data the new asset data
         * @returns {*} the promise which contains the id of the new Asset or contains the error message
         */
        createAsset : function(data) {

            var dataRef = new Firebase(globalFuncs.getFirebaseUrl() + '/asset'),

                deferred = $q.defer(),
                newObj = dataRef.push(data, function(error, result) {
                if (error) {
                    deferred.resolve(error);
                } else {
                    var objUid = newObj.key(),
                        updateId = {id: objUid},
                        updateObj = dataRef.child(objUid).update(updateId);
                    deferred.resolve(updateId);
                }
            });

            return deferred.promise;
        }
    };
}]);
