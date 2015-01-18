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

