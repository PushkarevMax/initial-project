// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    livereload = require('gulp-livereload');

// Styles
gulp.task('styles', function() {
    return gulp.src('assets/css/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dev/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('dev/css'));
});

// Scripts
gulp.task('scripts', function() {
    return gulp.src(['assets/js/vendor/*.js', 'assets/js/*.js'])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('dev/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('dev/js'));
});

// Images
gulp.task('images', function() {
    return gulp.src('assets/img/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dev/img'));
});

// Default task
gulp.task('default', function() {
    gulp.start('styles', 'scripts', 'images');
});

// Watch
gulp.task('dev', function() {

    // Watch .scss files
    gulp.watch('assets/css/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('assets/js/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('assets/img/**/*', ['images']);

    // Create LiveReload server
    livereload.listen();

    // Watch any files in dist/, reload on change
    gulp.watch(['dev/**']).on('change', livereload.changed);

});