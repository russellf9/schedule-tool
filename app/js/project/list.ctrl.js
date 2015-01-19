'use strict';

scheduleControllers.controller('ProjectsListCtrl', ['$scope', '$firebase', '$filter', 'globalFuncs', 'ProjectSVC',
    function($scope, $firebase, $filter, globalFuncs, ProjectSVC) {

        $scope.projects = globalFuncs.getProjects($scope, $firebase);

        $scope.screen_products = [];

        console.log('\n**21:19 - ProjectsListCtrl!**');

        ProjectSVC.getArtworks().then(function(data) {
            console.log('\n**art: ', data);
        });

    }]);
