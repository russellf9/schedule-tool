'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('The McD`s Schedule app.', function() {

    var indexPage = require('./index_page.js'),
        projectListsPage = require('./project_lists_page.js'),
        projectAddPage = require('./project_add_page.js'),
        projectCategoryPage = require('./project_category_page.js'),
        projectCategoryAddPage = require('./project_category_add_page.js'),
        indexURI = 'index.html',
        projectAddURI = '#/project/add',
        editSelected = false,

    // a utility function which sets the edit mode button if it has not been selected before
        selectEdit = function() {
            if (editSelected === true) {
                return;
            } else {
                editSelected = true;
                indexPage.select('edit');
            }
        };

    // the rudimentary navigation
    xdescribe('The Index page', function() {
        beforeEach(function() {
            browser.get(indexURI);
        });
        it('should have a title', function() {
            expect(browser.getTitle()).toEqual('Campaign Planner');
        });
        it('should automatically redirect to the `project` path when location hash is empty', function() {
            expect(browser.getLocationAbsUrl()).toContain('/project');
        });
        it('should open the Projects view', function() {
            indexPage.select('projects');
            expect(browser.getLocationAbsUrl()).toMatch('/project');
        });
        it('should open the Product Category view', function() {
            indexPage.select('productCategory');
            expect(browser.getLocationAbsUrl()).toMatch('/product_category');
        });
        it('should open the Artwork view', function() {
            indexPage.select('artwork');
            expect(browser.getLocationAbsUrl()).toMatch('/artwork');
        });
        it('should open the Assets view', function() {
            indexPage.select('assets');
            expect(browser.getLocationAbsUrl()).toMatch('/asset');
        });
    });
    xdescribe('The Projects Lists page', function() {
        beforeEach(function() {
            browser.get(indexURI);
            indexPage.select('projects');
        });
        it('should have a search item', function() {
            expect(projectListsPage.search.isPresent()).toBe(true);
        });
        it('should have a sort dropdown', function() {
            expect(projectListsPage.sort.isPresent()).toBe(true);
        });
        it('should have an add button', function() {
            expect(projectListsPage.add.isPresent()).toBe(true);
        });
        it('should have an projects list which is originally empty', function() {
            projectListsPage.projects.count().then(function(value) {
                expect(value).toEqual(0);
            });
        });
        it('should have a button to set the Edit Mode', function() {
            expect(indexPage.editButton.isPresent()).toBe(true);
        });
    });
    xdescribe('The Project Add page', function() {
        beforeEach(function() {
            // have to use URI as the select button wont work
            browser.get(projectAddURI);
            //indexPage.select('projects');
            //projectListsPage.selectAdd();
        });
        describe('Basic functionality', function() {
            it('should have a title', function() {
                expect(projectAddPage.title.isPresent()).toBe(true);
                expect(projectAddPage.title.getText()).toEqual('Create new project');
            });
            it('should have an start date button which is active by default', function() {
                expect(projectAddPage.startDateButton.isPresent()).toBe(true);
                expect(projectAddPage.startDateButton.isEnabled()).toEqual(true);
            });
            it('should have an end date button which is not active by default', function() {
                expect(projectAddPage.endDate.isPresent()).toBe(true);
                expect(projectAddPage.endDate.isEnabled()).toEqual(true);
            });
            it('should have a notes input field which is empty by default', function() {
                expect(projectAddPage.notes.isPresent()).toBe(true);
                expect(projectAddPage.notes.getText()).toBe('');
            });
            it('should have a create button which is in-active by default', function() {
                expect(projectAddPage.createButton.isPresent()).toBe(true);
                expect(projectAddPage.createButton.getAttribute('disabled')).toEqual('true');
            });
        });
    });
    xdescribe('The project list functionality', function() {
        beforeEach(function() {
            browser.get(indexURI);
            indexPage.select('projects');
            browser.wait(function() {
                return projectListsPage.projects.count()
                    .then(function(value) {
                        return value > 0;
                    });
            }, 10000);
        });
        it('should be able to selects a project`s View from the list', function() {
            projectListsPage.selectViewButton(0);
            expect(browser.getLocationAbsUrl()).toMatch('/project/view/*');
        });
        xit('should be able to selects a project`s Edit View from the list', function() {
            // issue with the `edit` button not being found
            projectListsPage.selectEditButton(0);
            expect(browser.getLocationAbsUrl()).toMatch('/project/edit/*');
        });
    });
    xdescribe('The creation of a new project', function() {
        beforeEach(function() {
            browser.get(indexURI);
            indexPage.select('edit');
            indexPage.select('projects');
        });
        xit('should add to the list ', function() {
            var projectCount,
                count;
            browser.wait(function() {
                // Wait until condition is true.
                return projectListsPage.projects.count()
                    .then(function(value) {
                        projectCount = value;
                        return value > 0;
                    });
            }, 10000).then(function(value) {

                projectListsPage.selectAdd();

                expect(browser.getLocationAbsUrl()).toMatch('/project/add');

                projectAddPage.addData('02');

                projectAddPage.selectCreate();

                browser.wait(function() {
                    // Wait until condition is true.
                    return projectListsPage.projects.count()
                        .then(function(value) {
                            count = value;
                            return value > 0;
                        });
                }, 10000).then(function(value) {
                    expect(count).toBeGreaterThan(projectCount);
                });
            });
        });
    });

    xdescribe('The Product Category Page', function() {
        beforeEach(function() {
            browser.get(indexURI);
            selectEdit();
            indexPage.select('productCategory');
        });
        it('should have a search item', function() {
            expect(projectCategoryPage.search.isPresent()).toBe(true);
        });
        it('should have a sort dropdown', function() {
            expect(projectCategoryPage.sort.isPresent()).toBe(true);
        });
        it('should have an add button', function() {
            expect(projectCategoryPage.add.isPresent()).toBe(true);
        });
        it('should have a button to set the Edit Mode', function() {
            expect(indexPage.editButton.isPresent()).toBe(true);
        });
        describe('The Product Category Creation', function() {
            it('should open the add page', function() {
                projectCategoryPage.selectAdd();
                expect(browser.getLocationAbsUrl()).toMatch('/product_category/add');
            });
        });
    });
    describe('The Product Category Add Page', function() {
        var getText = function(element, callback) {
            element.getText().then(function(text) {
                callback(text);
            });
        };
        beforeEach(function() {
            browser.get(indexURI);
            selectEdit();
            indexPage.select('productCategory');
            projectCategoryPage.selectAdd();
        });
        it('should have a name field which is empty by default', function() {
            expect(projectCategoryAddPage.name.isPresent()).toBe(true);
        });
        it('should have a create button which is disabled by default', function() {
            expect(projectCategoryAddPage.createButton.isPresent()).toBe(true);
            expect(projectCategoryAddPage.createButton.getAttribute('disabled')).toEqual('true');
        });
        // NOTE: I wasn't able to test ths value of the input
        xit('should be able to set the name of the new category', function() {
            var string = 'New Category';
            projectCategoryAddPage.setCategoryName(string);
            var callback = function(value) {
                console.log('call back - ',value);
                expect(value).toEqual(string);
            };
            getText(projectCategoryAddPage.name, callback);
            browser.pause();
        });
        it('should open the open the list page on creation', function() {
            var string = 'New Category';
            projectCategoryAddPage.setCategoryName(string);
            projectCategoryAddPage.selectCreate();
            expect(browser.getLocationAbsUrl()).toMatch('/product_category');
        });
    });
});
