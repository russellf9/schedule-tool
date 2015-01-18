'use strict';

var ProjectCategoryAddPage = (function() {
    function ProjectCategoryAddPage() {
        // set up the elements
        this.name = element(by.id('name'));

        // for non-edit
        //this.deleted = element(by.model('product_category.deleted'));
        //this.view = element(by.id('view'));

        this.createButton = element(by.id('create'));

        this.selectCreate = function() {
            this.createButton.click();
        };

        this.setCategoryName = function(name) {
            this.name.sendKeys(name);
        };
    }

    return ProjectCategoryAddPage;
})();

module.exports = new ProjectCategoryAddPage();
