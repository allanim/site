// Include gulp & tools we'll use
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
const cssmin = require('gulp-minify-css');
const rename = require('gulp-rename');
const size = require('gulp-size');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const htmlminify = require("gulp-html-minify");
const processhtml = require('gulp-processhtml');
const uglify = require('gulp-uglify');
const ejs = require('gulp-ejs');
const gutil = require('gulp-util');


// markdown to json
const mdToJson = require('gulp-markdown-to-json');
const marked = require('marked');
marked.setOptions({
    pedantic: true,
    smartypants: true
});

// build config
const config = {
    source: 'src',
    contents: 'contents',
    publish: 'dist',
    temporary: '.tmp',
    bowerComponents: 'bower_components',
    css: {
        files: ['./src/css/style*.css']
    },
    asserts: ['./src/fonts*/**/*.{eot,svg,ttf,woff,woff2}', './src/images*/**']
};

const AUTOPREFIXER_BROWSERS = [
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
const cssOptimizeTask = function (cssPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, cssPath, source);
    })).pipe(plumber())
        .pipe(changed(cssPath, {extension: '.css'}))
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(cssmin())
        .pipe(gulp.dest(path.join(config.publish, cssPath)))
        .pipe(size({title: 'css path : ' + path.join(config.publish, cssPath)}));
};

// Task fo image optimize
const imageOptimizeTask = function (imagePath, sources) {
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

const markdownConvertTask = function (markdownPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.contents, source);
    })).pipe(plumber())
        .pipe(gutil.buffer())
        .pipe(mdToJson(marked, 'resume.json'))
        .pipe(gulp.dest(path.join(config.temporary, markdownPath)))
        .pipe(gulp.dest(path.join(config.publish, markdownPath)))
        .pipe(size({title: 'markdown converted path : ' + path.join(config.publish, markdownPath)}));
};

const htmlOptimizeTask = function (htmlPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, htmlPath, source);
    })).pipe(plumber())
        .pipe(htmlminify())
        .pipe(gulp.dest(path.join(config.publish, htmlPath)))
        .pipe(size({title: 'html optimized path : ' + path.join(config.publish, htmlPath)}));
};

const jsTask = function (jsPath, sources) {
    return gulp.src(sources.map(function (source) {
        return path.join(config.source, jsPath, source);
    })).pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(path.join(config.publish, jsPath)))
        .pipe(size({title: 'js path : ' + path.join(config.publish, jsPath)}));
};

gulp.task('build-css', function () {
    return cssOptimizeTask("css", ['768.css', 'align.css', 'animations.css', 'main.css']);
});

gulp.task('build-font-css', function () {
    return cssOptimizeTask("fonts", ['**/*.css']);
});

gulp.task('build-fonts', ['build-font-css'], function () {
    return gulp.src([config.source + '/fonts/**/*.{eot,svg,ttf,woff,woff2}'])
        .pipe(gulp.dest(config.publish + '/fonts'))
        .pipe(size({title: 'fonts'}));
});

gulp.task('build-images', function () {
    return imageOptimizeTask('images', ['**/*']);
});

gulp.task('build-html', function () {
    return htmlOptimizeTask('', ['**/*.html']);
});

gulp.task('build-js', function () {
    return jsTask('js', ['main.js', 'language.js']);
});

gulp.task('build-markdown', function () {
    return markdownConvertTask('contents', ['**/*.md']);
});

gulp.task("build-ejs", function () {
    // var pages = ['index', '404'];
    const pages = [
        {source: 'allan', target: 'index', layout: 'one-page'},
        {source: '404', target: '404', layout: 'single-page'}
    ];
    for (let i = 0, length = pages.length; i < length; i++) {
        gulp.src([config.source + "/_layout-" + pages[i].layout + ".ejs"])
            .pipe(plumber())
            .pipe(ejs({content: pages[i].source}))
            .pipe(rename(pages[i].target + ".html"))
            .pipe(gulp.dest(config.temporary))
            .pipe(processhtml())
            // .pipe(htmlminify())
            .pipe(gulp.dest(config.publish));
    }
});

gulp.task('build-asserts', function () {
    // // css library
    // gulp.src(config.source + '/css/bootstrap.min.css')
    //     .pipe(gulp.dest(config.publish + '/css'));
    //
    // // js library
    // gulp.src([config.source + '/js/**/*.{js,css,svg}',
    //     '!' + config.source + '/main.js',
    //     '!' + config.source + '/language.js'])
    //     .pipe(gulp.dest(config.publish + '/js'));

    gulp.src([config.bowerComponents + '/jquery/dist/jquery.*',
        config.bowerComponents + '/jquery-migrate/jquery-migrate.*',
        config.bowerComponents + '/jquery.cookie/jquery.cookie.*',
        config.bowerComponents + '/respond/dest/respond.*',
        config.bowerComponents + '/selectivizr/selectivizr.*'])
        .pipe(gulp.dest(config.publish + '/libs'))
        .pipe(size({title: 'copy asserts'}));

    gulp.src([config.bowerComponents + '/jquery.cookie/jquery.cookie.js',
        config.bowerComponents + '/selectivizr/selectivizr.js'])
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.publish + '/libs'))
        .pipe(size({title: 'copy asserts'}));

    // gulp.src([config.bowerComponents + '/jquery.cookie/*.js'])
    //     .pipe(gulp.dest(config.temporary + '/libs'))
    //     .pipe(plumber())
    //     .pipe(uglify())
    //     .pipe(gulp.dest(config.publish + '/libs'))
    //     .pipe(size({title: 'copy asserts'}));
});

// Clean output directory
gulp.task('clean', function () {
    return gulp.src([config.temporary, config.publish], {read: false})
        .pipe(clean());
});

// Build production files, the default task
gulp.task('build', function (cb) {
    runSequence('clean', 'build-asserts',
        ['build-css', 'build-fonts', 'build-images', 'build-js', 'build-markdown', 'build-ejs'],
        cb);
});

gulp.task('default', ['build']);

// Watch files for changes & reload
gulp.task('serve', ['build-markdown', 'build-ejs'], function () {
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
                '/libs': config.bowerComponents
            }
        }
    });

    gulp.watch([config.source + '/**/*.ejs'], ['build-ejs', reload]);
    gulp.watch([config.source + '/css/**/*.css'], reload);
    gulp.watch([config.source + '/js/main.js'], reload);
    gulp.watch([config.source + '/contents/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve-dist', ['default'], function () {
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
