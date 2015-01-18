'use strict';

var ProjectAddPage = (function() {
    function ProjectAddPage() {

        this.project_01 = require('./data/projects/project-01.json');
        this.project_02 = require('./data/projects/project-02.json');

        // NOTE will have to differentiate between edit mode and no edit mode
        // there will only be one rendered at any one time
        // so this element can have either text
        this.title = element.all(by.css('h3')).get(0);

        // the name input
        this.name = element(by.model('project.name'));

        // START DATE
        // the input
        this.startDate = element(by.model('dt_start_string'));
        // the button
        this.startDateButton = element(by.id('start-date-button'));

        this.selectStartDateButton = function() {
            this.startDateButton.click();
        };

        // END DATE
        // the input
        this.endDate = element(by.model('dt_end_string'));
        // the button
        this.endDateButton = element(by.id('end-date-button'));

        this.notes = element(by.id('notes'));

        this.archivedCheckbox = element(by.model('project.deleted'));

        // only visible if edit mode is true
        this.createButton = element(by.id('create'));

        // only visible if edit mode is false
        this.copyButton = element(by.id('copy'));

        this.setProjectName = function(name) {
            this.name.sendKeys(name);
        };

        this.setNotes = function(value) {
            this.notes.sendKeys(value);
        };

        this.selectCreate = function() {
            this.createButton.click();
        };

        this.addData = function(id) {
            var data = this['project_' + id];
            this.setProjectName(data.name);
            this.setNotes(data.notes);
        };
    }

    return ProjectAddPage;

})();

module.exports = new ProjectAddPage();
