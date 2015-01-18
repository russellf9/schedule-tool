'use strict';

// Include gulp
var gulp = require('gulp'),

// Define node modules
    del = require('del'),

// Include Our Plugins
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    minifyCss = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    browserify = require('gulp-browserify'),
    imagemin = require('gulp-imagemin'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    gulpFilter = require('gulp-filter'),
    lazypipe = require('lazypipe'),
    jscs = require('gulp-jscs'),
    protractor = require('gulp-protractor').protractor,
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    git = require('gulp-git'),
    webdriver_standalone = require('gulp-protractor').webdriver_standalone;

gulp.task('webdriver_standalone', webdriver_standalone);


var paths = {
    scripts: ['app/js/**/*.js', '!app/bower_components'],
    images: 'app/img/**/*',
    html: ['app/**/*.html', '!app/bower_components/**/*.html'],
    robots: 'app/robots.txt',
    fonts: 'app/bower_components/bootstrap/fonts/*'
};

// Git tasks

// Other actions that do not require a Vinyl
gulp.task('log', function() {
    git.exec({args: 'log -10'}, function(err, stdout) {
        if (err) {
            throw err;
        } else if (stdout) {
            console.log(stdout);
        }
    });
});

// Create a new git branch
// Uses the default name as: dev-{YYMMDD}
gulp.task('branch', function() {
    var today = new Date(),
        month = String((today.getMonth() + 1 >= 10) ? (today.getMonth() + 1) : ('0' + String(today.getMonth() + 1))),
        date = String((today.getDate() >= 10) ? (today.getDate()) : ('0' + (today.getDate()))),
        year = String(today.getFullYear()),
        shortYear = year.substr(year.length - 2, 2),
        dateString = shortYear + month + date,
        branchName = 'dev-' + dateString;

    git.checkout(branchName, {args: '-b'}, function(err) {
        if (err) {
            throw err;
        } else {
            console.log('Git branch - ', branchName, ' created.');
        }
    });
});


// Lint Task
gulp.task('lint', function() {
    return gulp.src('app/js/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});


// Style Task
gulp.task('jscs', function() {
    return gulp.src('app/js/**/*.js')
        .pipe(jscs())
        .pipe(notify({
            title: 'JSCS',
            message: 'JSCS Passed. Let it fly!'
        }));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('css'));
});


// Copy all static images
// add the second parameter as a dependant task
gulp.task('images', ['clean'], function() {
    return gulp.src(paths.images)
        // Pass in options to the task
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('dist/img'));
});

// Move the robots
// add the second parameter as a dependant task
gulp.task('robots', ['clean'], function() {
    return gulp.src(paths.robots)
        .pipe(gulp.dest('dist'));
});

// Move the fonts
// add the second parameter as a dependant task
gulp.task('fonts', ['clean'], function() {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('dist/fonts'));
});

// cleams the distribution directory
gulp.task('clean', function(cb) {
    del(['dist'], {force: true}, cb);
});

// create a filter for the specified file type
function getFilter(type) {
    return gulpFilter('**/*.' + type);
}


// THIS BUILDS SEEMS TO BE WORKING!
/**
 *
 * uglify() causes an error with a vendor file!
 *
 */
gulp.task('deploy', ['clean', 'images', 'fonts', 'robots'], function() {
    var assets = useref.assets(),

    // create filter instance inside task function
        filter = gulpFilter(['**/*.html', '!app/index.html']),
        jsFilter = getFilter('js'),
        cssFilter = getFilter('css'),
        htmlFilter = getFilter('html');

    return gulp.src(paths.html)
        .pipe(assets)
        .pipe(gulpif('site.css', minifyCss()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist')).on('error', errorHandler);
});

/**     TODO
 *   // filter a subset of the files
 .pipe(filter)
 .pipe(minifyHTML())
 .pipe(filter.restore())
 */

gulp.task('test', function() {
    return gulp.src(['./e2e-tests/*.js'])
        .pipe(protractor({
            configFile: './e2e-tests/protractor.conf.js',
            args: ['--baseUrl', 'http://localhost:8000/app/index.html'] // 'http://127.0.0.1:8000' // http://127.0.0.1:4444/wd/hub
        })).on('error', errorHandler);
});


// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('app/js/**/*.js', ['build']);
});


// Clean & Deploy
gulp.task('build', function() {
    runSequence('jscs', 'lint', function() {
        gulp.start('deploy');
    });
});

// Default Task
gulp.task('default', ['build', 'watch']);

// Handle the error
function errorHandler(error) {
    console.log(error.toString());
    this.emit('end');
}

