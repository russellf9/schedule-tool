# McD's - Digital Screens Schedule Tool

This project is based on the _angular-seed_, see: [AngularJS](http://angularjs.org/).



## Getting Started

To get you started you can simply clone the Screens Schedule Tool repository and install the dependencies:

### Prerequisites

You need git to clone the Screens Schedule Tool repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test angular-seed. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone Screens Schedule Tool

Clone the Screens Schedule Tool repository using [git][git]:

```
git clone git@codebasehq.com:tms/mcds-digital-screens-schedule-tool/schedule-tool.git
cd schedule-tool
```

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
angular-seed changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Dependencies

Various bower modules have been implemented in the project including:

1. [angularMoment](https://github.com/urish/angular-moment) - [moment.js](http://momentjs.com/) has been used to perform date operations like difference.
2. [taiPlaceholder](https://github.com/tests-always-included/angular-placeholder) provides placeholder support for IE9
3. [ngOptionsDisabled](https://github.com/knivets/angular-options-disabled) used to disable ng-options
4. [angular-bootstrap-checkbox](https://github.com/sebastianha/angular-bootstrap-checkbox) used to improve the look of the checkboxes.



### Run the Application

We have pre-configured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.



## Directory Layout

The js files are ordered largely by feature, although the layout is not perfect!

```
app/                    --> all of the source files for the application
  app.css               --> default stylesheet
  components/           --> app specific modules
    version/              --> version related components
      version.js                 --> version module declaration and basic "version" value service
      version_test.js            --> "version" value service tests
      version-directive.js       --> custom directive that returns the current app version
      version-directive_test.js  --> version directive tests
      interpolate-filter.js      --> custom interpolation filter
      interpolate-filter_test.js --> interpolate filter tests
  data/
    blueprint.json      --> Data for the screen
  img/                  --> image files
  js/
    artwork/
      edit.ctrl.js      --> the controller for artwork
      list.ctrl.js      --> the controller for the artwork list
    asset/
      edit.ctrl.js      --> the controller for the assets
      list.ctrl.js
    blueprint/
      blueprint.svc.js  --> used to get the `blueprint.json`
      blueprint.dir.js  --> a simple directive which loads the `blueprint.html` template, useful for optimization
    date/
      date.svc.js       --> a service which holds the values for the start or end date
    days/
      days.dir.js       --> a directive used to display the `day` information with the template `days.html`
      days.svc.js       --> a service used to populate the time slots in the day parts
    edit/
      button.dir.js     --> the directive for the button which toggles the value of the edit mode
      mode.dir.js       --> A simple directive which will remove the attributes' element according to the value of `editMode`
    firebase/
      firebase.svc.js   --> a service which updates values to the firebase database
      firebase.utils.js --> a utility firebase wrapper to keep things DRY
      (not very DRY there is plenty of duplication !)
    product/
      edit.ctrl.js      --> the controller for the Product/Category
      product.dir.js    --> a directive used for the screen's products, uses an `inline` template
    project/
      dateButton.dir.js --> for the button used by the date selection
      dateInput.dir.js  --> provides a bridge between the date ui and the date service
      deliverables.dir.js --> the code for the UI for the deliverables
      detail.ctrl.js    --> the controller for the Project detail
      edit.ctrl.js      --> the controller for the Project
      export.dir.js     --> a directive for the exporting of CSV data
      import.dir.js     --> a directive for the importing of CSV data
      list.ctrl.js      --> the controller for the Project List
      project.svc.js    --> performs various operations on the project data client-side
      screenCodes.dir.js  --> a directive used to evaluate the percentage of total number of screens which have a valid artwork assigned
    screen/
      edit.js           --> the controller for screen edit
      screen.svc.js     --> a service used to perform various operations with the screen data
      title.dir         --> A directive used to decorate the title field of the Screen
    shared/
      aDisabled.dir.js   --> a directive used to disable anchor elements
      archived.dir.js   --> appends the text "Archived"
      backButton.dir.js --> A directive which uses the $window history to return to the previous page
      bnHref.dir.js     --> Ben Nadel's directive to optimize links ( There was an issue with this directive not working in Safari so uses have been removed. )
      filePath.dir.js   --> A directive to modify a supplied path to Windows or UNIX format
      isSelectFix.dir.js --> General-purpose Fix IE 8/9 for the Select element
      link.dir.js     --> a directive used to handle links for both assets and artworks
    storage/
      localStorage.svc.js --> a service responsible for saving and getting values from local storage
    controllers.js    --> App controllers which haven't got their own folder
    filters.js        --> filters used for dates and for ng-options in select items
    services.js       --> service module
  partials/ --> html pages used by the routes and directives
    date/
      date-button.html  --> used by the "dateButton.dir.js"
    modal/
      project-copy.html  -->
      project-error-modal.html --> the mark-up for the modal
    project/
      export.html
    screen/
      title.html
    screens/
      blueprint.html
      day.html
      deliverables.html
      product.html
      screen-codes.html
      screen-edit.html
    shared/
      archived.html
      link.html
    artwork.html
    artwork-add.html
    artwork-list.html
    asset.html
    asset-add.html
    asset-list.html
    product_category.html
    product_category-add.html
    product_category-list.html
    project.html
    project-add.html
    project-list.html
  template/         --> template files for the date picker
    datepicker/
      datepicker.html
      day.html
      month.html
      popup.html
      year.html
    modal/
      backdrop.html
      window.html
  app.js                --> main application module ( defines the routes )
  index.html            --> app layout file (the main html template file of the app)
  index-async.html      --> just like index.html, but loads js files asynchronously
  robots.txt
karma.conf.js         --> config file for running unit tests with Karma
gulpfile.js           --> file for the build tasks
e2e-tests/            --> end-to-end tests
  protractor-conf.js    --> Protractor config file
  scenarios.js          --> end-to-end scenarios to be run by Protractor
node_modules
dist                  --> the distribution files ( created by the gulp task )
.jscsrc           --> defines the rules for JSCS
.jshint           --> defines the rules for JSHINT
```

## Code style

I've used [Webstorm 9](https://www.jetbrains.com/webstorm/) to write the Application as this has numerous powerful features and am using Gulp for automating tasks.

I'm using standards to enforce a uniform coding style incorporating both [JSHint](http://jshint.com/docs/) and [JSCS](https://github.com/jscs-dev/node-jscs) in both Webstorm and the relevant Gulp tasks.

I've a `.jshintrc` and a `.jscsrc` file which provide the rules for `jshint` and `JSCS` respectively.

These can be linked to Webstorm here:

_Webstorm_ -> _Preferences_ -> _Languages and Frameworks_ -> JavaScript -> Code Quality Tools


To save one of most useful features is the ability to auto format- **⌥⌘L**, I had to make a minor adjustment:


_Webstorm_ -> _Preferences_ -> _Code style_ -> JavaScript - Turn off - In function expression to match the jscs rule.


## Modes
There are there modes for the application:

1. staging
2. dev
3. production

Each references a different firebase URL. Currently these values are hard-coded in the `ap/js/services.js` file.


## Build

[Gulp](http://gulpjs.com/) can be used to produce distribution files for the Application.

From the app location run:

```
gulp build
```

## Gulp tasks

The gulp task has also been set up to run automatically simply run:

```
gulp
```

This will set up a watch task which will trigger the default tasks if any changes are made to the js files.

The default will run the `lint` task and `jscs` task before the `build` task

The `lint`, [gulp-jshint](https://www.npmjs.com/package/gulp-jshint/) task, runs [jshint](http://jshint.com/docs/) which helps to enforce coding standards.

#### Testing in Gulp

I've set up the End to end testing to be launched by Gulp.

Simply run:

```

# ensure the app is running in the local host
npm start

gulp test

```

The chromeDriver and seleniumServerJar are required for this task. They are installed within the protractor node module, the protractor.conf.js points to their locations.


## Testing


There are two kinds of tests in the angular-seed application: Unit tests and End to End tests.

### Running Unit Tests

Unit tests have not been set up for this application!

( Ths following instructions are from the original seed ).

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to end testing

The angular-seed app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

There is a small suit of E2E tests in the Digital Screens Schedule Tool App.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The angular-seed
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
  npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


## Updating angular framework library code and tools

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


## Loading Angular Asynchronously

The angular-seed project supports loading the framework and application scripts asynchronously.  The
special `index-async.html` is designed to support this style of loading.  For it to work you must
inject a piece of Angular JavaScript into the HTML page.  The project has a predefined script to help
do this.

```
npm run update-index-async
```

This will copy the contents of the `angular-loader.js` library file into the `index-async.html` page.
You can run this every time you update the version of Angular that you are using.


## Serving the Application Files

While angular is client-side-only technology and it's possible to create angular webapps that
don't require a backend server at all, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### The following notes are from the original seed project...

### Running the App during Development

The angular-seed project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


### Running the App in Production

This really depends on how complex your app is and the overall infrastructure of your system, but
the general rule is that all you need in production are all the files under the `app/` directory.
Everything else should be omitted.

Angular apps are really just a bunch of static html, css and js files that just need to be hosted
somewhere they can be accessed by browsers.

If your Angular app is talking to the backend server via xhr or other means, you need to figure
out what is the best way to host the static files to comply with the same origin policy if
applicable. Usually this is done by hosting the files by the backend server or through
reverse-proxying the backend server(s) and webserver(s).
