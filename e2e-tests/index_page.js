'use strict';

var IndexPage = (function() {
    function IndexPage() {

        // set up the assets
        this.title = element.all(by.css('h3')).get(0);

        // set up the anchors for the menu items
        this.projectsAnchor = element(by.linkText('Projects'));
        this.productCategoryAnchor = element(by.partialLinkText('Category'));
        this.artworkAnchor = element(by.linkText('Final artwork'));
        this.assetsAnchor = element(by.linkText('Assets'));

        // set up the button which sets the edit mode
        this.editButton = element(by.id('edit-mode'));

        this.navigate = function(page) {
            browser.get('index.html#/' + page);
        };

        this.select = function(action) {

            switch (action) {
                case 'projects':
                {
                    this.projectsAnchor.click();
                    break;
                }
                case 'productCategory':
                {
                    this.productCategoryAnchor.click();
                    break;
                }
                case  'artwork':
                {
                    this.artworkAnchor.click();
                    break;
                }
                case 'assets':
                {
                    this.assetsAnchor.click();
                    break;
                }
                case 'edit':
                {
                    this.editButton.click();
                    break;
                }
            }
        };
    }

    return IndexPage;

})
();

module.exports = new IndexPage();