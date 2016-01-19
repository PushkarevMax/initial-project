// Load plugins
var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	cssnano = require('gulp-cssnano'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	connect = require('gulp-connect'),
	layout = require('gulp-nunjucks-render');

// Styles
gulp.task('styles', function () {
	return gulp.src('assets/css/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('dev/css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssnano())
		.pipe(gulp.dest('dev/css'))
		.pipe(connect.reload());
});

// Scripts
gulp.task('scripts', function () {
	return gulp.src(['assets/js/vendor/*.js', 'assets/js/*.js'])
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('dev/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('dev/js'))
		.pipe(connect.reload());
});

// Images
gulp.task('images', function () {
	return gulp.src('assets/img/**/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('dev/img'))
		.pipe(connect.reload());
});

// Layout
gulp.task('layout', function () {
	return gulp.src(['assets/templates/*.html'])
		.pipe(layout())
		.pipe(gulp.dest('dev'))
		.pipe(connect.reload());
});

// Connect
gulp.task('connect', function () {
	connect.server({
		root: 'dev',
		livereload: true
	});
});

// Default task
gulp.task('build', function () {
	gulp.start('styles', 'scripts', 'images');
});

// Watch
gulp.task('watch', function () {

	// Watch .scss files
	gulp.watch('assets/css/**/*.scss', ['styles']);

	// Watch .js files
	gulp.watch('assets/js/**/*.js', ['scripts']);

	// Watch image files
	gulp.watch('assets/img/**/*', ['images']);

	// Watch hmtl files
	gulp.watch('assets/**/*.html', ['layout']);

});

gulp.task('default', ['connect', 'watch']);