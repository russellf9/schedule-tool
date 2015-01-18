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
