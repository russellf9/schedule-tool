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

