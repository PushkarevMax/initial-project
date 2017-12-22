"use strict";

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),
  concat = require('gulp-concat'),
  server = require("browser-sync"),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  del = require('del'),
  rename = require('gulp-rename'),
  spritesmith = require('gulp.spritesmith'),
  merge = require('merge-stream'),
  twig = require('gulp-twig'),
  runSequence = require('run-sequence').use(gulp);

gulp.task('templates', function () {
  return gulp.src('src/view/*.twig')
    .pipe(twig())
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

gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/icons/*.png').pipe(spritesmith({
    imgName: '../img/sprite.png',
    cssName: 'sprite.scss',
    algorithm: 'top-down'
  }));
  var imgStream = spriteData.img
    .pipe(gulp.dest('build/img'));

  var cssStream = spriteData.css
    .pipe(gulp.dest('src/scss/'));

  return merge(imgStream, cssStream);
});

gulp.task('scripts', function () {
  return gulp.src([
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
  runSequence('clean','templates','styles','scripts','images','sprite',callback)
});

gulp.task("serve", ['templates','styles','scripts','images','sprite'], function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("src/**/*.{scss,sass}", ["styles"]);
  gulp.watch("src/**/*.+(html|twig)", ["templates"]);
  gulp.watch("src/**/*.js", ["scripts"]);
  gulp.watch("src/**/*.+(jpg,png,svg)", ["images"]);
});