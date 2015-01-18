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
