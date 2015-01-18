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

