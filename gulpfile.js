"use strict";

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	cssnano = require('cssnano'),
	nunjucksRender = require('gulp-nunjucks-render'),
	concat = require('gulp-concat'),
	server = require("browser-sync"),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	del = require('del'),
	rename = require('gulp-rename'),
	runSequence = require('run-sequence').use(gulp);

gulp.task('layout', function () {
	nunjucksRender.nunjucks.configure(['src/njc/templates/']);
	return gulp.src(['src/njc/pages/**/*.+(html|njc)'])
		.pipe(nunjucksRender())
		.pipe(gulp.dest('build'))
		.pipe(server.reload({stream: true}));
});

gulp.task('styles', function () {
	var processors = [
		autoprefixer({
			browsers: ['last 2 versions']
		}),
		cssnano
	];
	return gulp.src('src/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/css'))
		.pipe(server.reload({stream: true}));
});

gulp.task('images', function () {
	return gulp.src('src/img/**/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('build/img'))
		.pipe(server.reload({stream: true}));
});

gulp.task('scripts', function () {
	return gulp.src([
			'bower_components/jquery/dist/jquery.js',
			'bower_components/modernizr-min/src/modernizr-build.js',
			'src/js/*.js'
		])
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('build/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('build/js'))
		.pipe(server.reload({stream: true}));
});

gulp.task('clean', function () {
	del('build/*');
});

gulp.task('build', function(callback) {
	runSequence('clean','layout','styles','scripts','images',callback)
});

gulp.task("serve", ['layout','styles','scripts','images'], function() {
	server.init({
		server: "build",
		notify: false,
		open: true,
		ui: false
	});

	gulp.watch("src/**/*.{scss,sass}", ["styles"]);
	gulp.watch("src/**/*.+(html|njc)", ["layout"]);
	gulp.watch("src/**/*.js", ["scripts"]);
	gulp.watch("src/**/*.+(jpg,png,svg)", ["images"]);
});