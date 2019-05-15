"use strict";

let gulp = require('gulp'),
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
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin');

function styles() {
    let processors = [
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
}

function templates() {
    return gulp.src('src/view/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('build'))
        .pipe(server.reload({stream: true}));
}

function images() {
    return gulp.src('src/img/**/*.+(jpg,png,svg)')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/img'))
        .pipe(server.reload({stream: true}));
}

function sprite() {
    let spriteData = gulp.src('src/img/icons/*.png').pipe(spritesmith({
        imgName: '../img/sprite.png',
        cssName: 'sprite.scss',
        algorithm: 'top-down'
    }));
    let imgStream = spriteData.img
        .pipe(gulp.dest('build/img'));

    let cssStream = spriteData.css
        .pipe(gulp.dest('src/scss/'));

    return merge(imgStream, cssStream);
}

function svg() {
    return gulp.src('src/img/svg/*.svg')
        .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("build/img/svg"))
        .pipe(server.reload({stream: true}));
}

function scripts() {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/swiper/dist/js/swiper.js',
        'src/js/vendor/*.js',
        'src/js/*.js'
    ])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'))
        .pipe(server.reload({stream: true}));
}

function clean() {
    del('build/*');
}

function watch() {
    serve();

    server.init({
        server: "build",
        notify: false,
        open: true,
        ui: false
    });

    gulp.watch("src/**/*.{scss,sass}", styles);
    gulp.watch("src/**/*.+(html|twig)", templates);
    gulp.watch("src/**/*.js", scripts);
    gulp.watch("src/**/*.+(jpg,png,svg)", images);
}

function copy() {
    return gulp.src('src/fonts/*')
        .pipe(gulp.dest('build/fonts/'));
}

gulp.task('templates', templates);

gulp.task('styles', styles);

gulp.task('images', images);

gulp.task('sprite', sprite);

gulp.task("svg", svg);

gulp.task('scripts', scripts);

gulp.task('clean', clean);

gulp.task('copy', copy);

let build = gulp.series(clean, templates, styles, scripts, images, sprite, svg, copy);

let serve = gulp.series(templates, styles, scripts, images, sprite, svg);

gulp.task('build', build);

gulp.task("serve", watch);