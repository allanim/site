'use strict';

// Include gulp & tools we'll use
const yml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const historyApiFallback = require('connect-history-api-fallback');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const changed = require('gulp-changed');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const size = require('gulp-size');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const htmlminify = require("gulp-html-minify");
const uglify = require('gulp-uglify');

// markdown to json
const mdToJson = require('gulp-markdown-to-json');
const marked = require('marked');
marked.setOptions({
    pedantic: true,
    smartypants: true
});

// Site config
var config = yml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Task for stylesheet
var cssOptimizeTask = function (cssPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, cssPath, source);
    })).pipe(plumber())
        .pipe(changed(cssPath, {extension: '.css'}))
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest(path.join(config.temporary, cssPath)))
        .pipe(cssmin())
        // .pipe(concat('style.css'))
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.join(config.publish, cssPath)))
        .pipe(size({title: 'css path : ' + path.join(config.publish, cssPath)}));
};

// Task fo image optimize
var imageOptimizeTask = function (imagePath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, imagePath, source);
    })).pipe(plumber())
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(path.join(config.publish, imagePath)))
        .pipe(size({title: 'image optimized path : ' + path.join(config.publish, imagePath)}));
};

var markdownConvertTask = function (markdownPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, markdownPath, source);
    })).pipe(plumber())
        .pipe(mdToJson(marked))
        .pipe(gulp.dest(path.join(config.temporary, markdownPath)))
        .pipe(gulp.dest(path.join(config.publish, markdownPath)))
        .pipe(size({title: 'markdown converted path : ' + path.join(config.publish, markdownPath)}));
};

var htmlOptimizeTask = function (htmlPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, htmlPath, source);
    })).pipe(plumber())
        .pipe(htmlminify())
        .pipe(gulp.dest(path.join(config.publish, htmlPath)))
        .pipe(size({title: 'html optimized path : ' + path.join(config.publish, htmlPath)}));
};

var jsTask = function (jsPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, jsPath, source);
    })).pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(path.join(config.publish, jsPath)))
        .pipe(size({title: 'js path : ' + path.join(config.publish, jsPath)}));
};

// Build css
gulp.task('build:css', function (cb) {
    return cssOptimizeTask("css", ['768.css', 'align.css', 'animations.css', 'main.css']);
});

// build font css
gulp.task('font-css', function () {
    return cssOptimizeTask("fonts", ['**/*.css']);
});

// copy font
gulp.task('build:fonts', ['font-css'], function () {
    return gulp.src([config.source + '/fonts/**/*.{eot,svg,ttf,woff,woff2}'])
        .pipe(gulp.dest(config.publish + '/fonts'))
        .pipe(size({title: 'fonts'}));
});

// copy images
gulp.task('build:images', function () {
    return imageOptimizeTask('images', ['**/*']);
});

// copy html
gulp.task('build:html', function () {
    return htmlOptimizeTask('', ['**/*.html']);
});

// copy html
gulp.task('build:js', function () {
    return jsTask('js', ['main.js']);
});

// markdown convert to json
gulp.task('build:markdown', function () {
    return markdownConvertTask('contents', ['**/*.md']);
});

gulp.task('library', function () {
    var css = gulp.src(config.source + '/css/bootstrap.min.css')
        .pipe(gulp.dest(config.publish + '/css'));
    var js = gulp.src([config.source + '/js/**/*.js', '!' + config.source + '/main.js'])
        .pipe(gulp.dest(config.publish + '/js'));
});

// Clean output directory
gulp.task('clean', function (cb) {
    return gulp.src([config.temporary, config.publish], {read: false})
        .pipe(clean());
});

// Build production files, the default task
gulp.task('default', function (cb) {
    runSequence('clean', 'library',
        ['build:css', 'build:fonts', 'build:images', 'build:html', 'build:js', 'build:markdown'],
        cb);
});


// Watch files for changes & reload
gulp.task('serve', ['build:css', 'build:js', 'build:markdown'], function () {
    browserSync({
        port: 5000,
        notify: false,
        logPrefix: 'dev.allanim.com',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function (snippet) {
                    return snippet;
                }
            }
        },
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
            baseDir: ['.tmp', config.source],
            middleware: [historyApiFallback()],
            routes: {
                //'/lib': filePath.bowerComponents
            }
        }
    });

    gulp.watch([config.source + '/**/*.html'], reload);
    gulp.watch([config.source + '/css/**/*.css'], reload);
    gulp.watch([config.source + '/js/main.js'], reload);
    gulp.watch([config.source + '/images/**/*'], reload);
    gulp.watch([config.source + '/contents/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
    browserSync({
        port: 5001,
        notify: false,
        logPrefix: 'allanim.com',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function (snippet) {
                    return snippet;
                }
            }
        },
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: [config.publish],
        middleware: [historyApiFallback()]
    });
});
