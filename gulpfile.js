'use strict';

// Include gulp & tools we'll use
const yml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const runSequence = require('run-sequence');
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
var cssTask = function (cssPath, sources) {
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

var markdownConvert = function (markdownPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, markdownPath, source);
    })).pipe(plumber())
        .pipe(mdToJson(marked))
        .pipe(gulp.dest(path.join(config.publish, markdownPath)))
        .pipe(size({title: 'markdown converted path : ' + path.join(config.publish, markdownPath)}));
}

// Build css
gulp.task('css', function (cb) {
    return cssTask("css", ['**/*.css'])
});

// build font css
gulp.task('font-css', function () {
    return cssTask("fonts", ['**/*.css'])
});

// copy font
gulp.task('copy-fonts', function () {
    return gulp.src([config.source + '/fonts/**/*.{eot,svg,ttf,woff,woff2}'])
        .pipe(gulp.dest(config.publish + '/fonts'))
        .pipe(size({title: 'fonts'}));
});

// copy images
gulp.task('copy-images', function () {
    return imageOptimizeTask('images', ['**/*']);
});

// markdown convert to json
gulp.task('md-convert', function () {
    return markdownConvert('contents', ['**/*.md']);
});

// Clean output directory
gulp.task('clean', function (cb) {
    return gulp.src([config.temporary, config.publish], {read: false})
        .pipe(clean());
});

// Build production files, the default task
gulp.task('default', function (cb) {
    runSequence('clean',
        ['css', 'font-css'],
        ['copy-fonts', 'copy-images'],
        'md-convert',
        cb);
});