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

