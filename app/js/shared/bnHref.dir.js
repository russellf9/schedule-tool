'use strict';

/**
 * A directive to optimize angular loading times
 * See: http://www.bennadel.com/blog/2704-deferring-attribute-interpolation-in-angularjs-for-better-performance.htm
 */

tool.directive('bnHref',  function($interpolate) {

    // When we compile the directive, we have to remove the pre-interpolation
    // value so that the watcher will not be created during the pre-linking
    // phase of the native AngularJS attribute-interpolation directive.
    function compile(tElement, tAttributes) {

        // Compute the interpolation function.
        var interpolation = $interpolate(tAttributes.bnHref);

        // Clear the attribute since we no longer need it once we have the
        // computed interpolation function.
        tAttributes.$set('bnHref', null);

        // Set up an empty href so that the link CSS styles will take place.
        tElement.attr('href', '');

        // I link the JavaScript events to the current scope.
        function link(scope, element, attributes) {
            // Since the link behavior is activated based on element
            // interaction, we can defer interpolation until the user
            // focuses the element (either with mouse or keyboard).
            element.on(
                'focus',
                function handleFocusEvent(event) {
                    element.attr('href', interpolation(scope));
                }
            );
        }

        // Return the linking function.
        return (link);
    }

    // Return the directive configuration.
    return ({
        compile: compile,
        restrict: 'A'
    });
});

