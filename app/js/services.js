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


