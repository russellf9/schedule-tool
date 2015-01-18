'use strict';

var ProjectListsPage = (function() {
    function ProjectListsPage() {



        // see: https://github.com/angular/protractor/issues/456
        this.findByText = function() {
            var using = arguments[0] || document,
                text = arguments[1],
                matches = [];

            function addMatchingLeaves(element) {
                if (element.children.length === 0 && element.textContent.match(text)) {
                    matches.push(element);
                }
                for (var i = 0; i < element.children.length; ++i) {
                    addMatchingLeaves(element.children[i]);
                }
            }

            addMatchingLeaves(using);
            return matches;
        };

        // set up the elements
        this.search = element(by.id('search'));

        // for the `sort` drop down
        this.sort = element(by.model('orderProp'));
        this.archived = element(by.id('archive'));
        this.add = element(by.id('add'));

        this.projects = element.all(by.repeater('project in projects'));


        this.waitForProjects = function() {
            browser.wait(function() {
                // Wait until condition is true.
                return this.projects.count()
                    .then(function(value) {
                        return value > 0;
                    });
            }, 10000);

        };

        this.searchSendKeys = function(keys) {
            this.search.sendKeys(keys);
        };

        this.selectAdd = function() {
            this.add.click();
        };

        // elements within the repeater
        this.selectViewButton = function(index) {
            var project = this.projects.get(index);
            project.element(by.linkText('View')).click();
        };
        this.selectEditButton = function(index) {
            var project = this.projects.get(index);
            project.element(by.linkText('Edit')).click();
        };


    }

    return ProjectListsPage;

})();

module.exports = new ProjectListsPage();