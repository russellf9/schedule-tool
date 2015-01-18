'use strict';

var ProjectCategoryPage = (function() {
    function ProjectCategoryPage() {

        //this.project_01 = require('./data/projects/project-01.json');
        //this.project_02 = require('./data/projects/project-02.json');

        // set up the elements
        this.search = element(by.id('search'));

        // for the `sort` drop down
        this.sort = element(by.model('orderProp'));
        this.archived = element(by.id('archive'));
        this.add = element(by.id('add'));

        this.selectAdd = function() {
            this.add.click();
        };
    }

    return ProjectCategoryPage;

})();

module.exports = new ProjectCategoryPage();
