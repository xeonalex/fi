var gulp = require('gulp'),
    concat = require('gulp-concat'),// Склейка файлов
    browserSync  = require('browser-sync'), // BrowserSync
    pug = require('gulp-pug'), // Pug обработчик html
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssnano = require('gulp-cssnano'), //Минификация CSS
    autoprefixer = require('gulp-autoprefixer'), // Автопрефиксы CSS
    imagemin = require('gulp-imagemin'),// Сжатие JPG, PNG, SVG, GIF
    uglify = require('gulp-uglify'), // Минификация JS
    plumber = require('gulp-plumber'),
    shorthand = require('gulp-shorthand'), // шорт код
    uncss = require('gulp-uncss'), // удаление не используемых стилей
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    changed = require('gulp-changed'),
    rigger = require('gulp-rigger'), // іморт файлів в файл like //="../../../bower_components/...
    gcmq = require('gulp-group-css-media-queries'), // обєднує media з однаковими breakpoint
    zip = require('gulp-zip'); // обєднує media з однаковими breakpoint

var path = {
    name: "boiler",
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        server: 'build/',
        html: 'build/',
        libs: 'build/static/libs/',
        css: 'build/static/css/',
        img: 'build/static/img/',
        fonts: 'build/static/fonts/',
        favicon: 'build/static/favicon/',
        jsVendor: 'build/static/libs/js',
        js: 'build/static/js',
        bootstrap: 'src/static/libs/bootstrap/css/'
    },
    src: { //Пути откуда брать исходники
        pug: ['src/pug/pages/*.pug'], //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/static/js/**/*.js',//В стилях и скриптах нам понадобятся только main файлы
        jsVendor: 'src/js/vendor/*.js',//В стилях и скриптах нам понадобятся только main файлы
        scss: ['src/scss/*.scss','!src/scss/_*.scss'],
        bootstrap: 'src/scss/bootstrap/bootstrap.scss',
        img: ['src/static/img/**/*.*','!src/static/img/**/*.tmp'],//  Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/static/fonts/*',
        favicon: 'src/static/favicon/*',
        libs: 'src/static/libs/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        pug: './src/pug/pages/*.pug',
        pugIncludes: ['./src/pug/modules/**/*.pug','./src/pug/layout/*.pug'],
        js: './src/static/js/*.js',
        jsVendor: './src/js/vendor/*.js',
        scss: ["./src/scss/**/*.scss",'./src/scss/_*.scss','!./src/scss/bootstrap/**'],
        img: './src/static/img/**/*',
        favicon: './src/static/favicon/*',
        fonts: './src/static/fonts/*',
        libs: './src/static/libs',
        bootstrap: 'src/scss/bootstrap/**/*.*'
    }
};

// робимо архів нашого білда
gulp.task('zip', () => {
    return gulp.src([path.build.server+'**/*','!'+path.build.server+'**/*.zip'])
        .pipe(zip('build_'+path.name+'.zip'))
        .pipe(gulp.dest(path.build.server));
});
// очищаемо від невикористовуваних стилів
gulp.task('uncss', function() {
  return gulp.src('build/css/styles.css')
    .pipe(uncss({
      html: ['build/*.html']
    }))
    .pipe(gcmq())
    .pipe(shorthand())
    .pipe(rename('main.css'))
    .pipe(gulp.dest(path.build.css));
});
//Собираем Pug ( html )
gulp.task('pug-includes', function() {
  return gulp.src(path.src.pug)
    .pipe(plumber())
    .pipe(pug({
       pretty: true
    }))
    .on('error', console.log)
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
  });
//Собираем только изменившийся файл Pug ( html )
gulp.task('pug-templates', function() {
  return gulp.src(path.src.pug)
    .pipe(changed(path.build.html, {extension: '.html'}))
    .pipe(plumber())
    .pipe(pug({
    }))
    .on('error', console.log)
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
});
// Собираем CSS из SASS файлов
gulp.task('sass-dev', function() {
  return gulp.src(path.src.scss)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rigger())
    .pipe(sass({
      style: 'compressed',
      errLogToConsole: true,
      sourcemaps : false
      }))
    // .pipe(gcmq())
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 15 versions'],
      cascade: true
     }))
    .pipe(cssnano({
        discardComments: {
          removeAll: true
        }
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
});
// Собираем CSS из SASS файлов
gulp.task('bootstrap', function() {
  return gulp.src(path.src.bootstrap)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rigger())
    .pipe(sass({
      style: 'compressed',
      errLogToConsole: true,
      sourcemaps : true
      }))
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 15 versions'],
      cascade: true
     }))
    .pipe(cssnano({
        discardComments: {
          removeAll: true
        }
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.bootstrap))
    .pipe(browserSync.stream());
});

//Сжатие изображений
gulp.task('libs', function() {
  return gulp.src(path.src.libs)
    .pipe(gulp.dest(path.build.libs));
});
//Сжатие изображений
gulp.task('img', function() {
  return gulp.src(path.src.img)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true}))
    .pipe(gulp.dest(path.build.img));
});
//Копируем JS
gulp.task('js', function(){
  return gulp.src(path.src.js)
  .pipe(plumber())
  // .pipe(rigger())
  .pipe(uglify())
  .pipe(gulp.dest(path.build.js))
  .pipe(browserSync.stream());
});
//Копируем JS-vendor
gulp.task('js-vendor', function(){
  return gulp.src(path.src.jsVendor)
  .pipe(plumber())
  .pipe(rigger())
  .pipe(uglify())
  .pipe(concat('vendor.js'))
  .pipe(gulp.dest(path.build.jsVendor))
  .pipe(browserSync.stream());
});
// Favicon
gulp.task('favicon', function(){
  return gulp.src(path.src.favicon)
  .pipe(changed(path.build.favicon))
  .pipe(plumber())
  .pipe(gulp.dest(path.build.favicon))
  .pipe(browserSync.stream());
});
// Fonts
gulp.task('fonts', function(){
  return gulp.src(path.src.fonts)
  .pipe(changed(path.build.fonts))
  .pipe(plumber())
  .pipe(gulp.dest(path.build.fonts))
  .pipe(browserSync.stream());
});

// WATCH
gulp.task('default', ['pug-includes','sass-dev','img','js-vendor','js','bootstrap','libs','favicon','fonts'], function () {

    browserSync.init({
      server : path.build.server
    });
    watch(path.watch.pugIncludes, function() {
      gulp.start('pug-includes');
    });

    watch(path.watch.pug, function() {
      gulp.start('pug-templates');
      // gulp.start('uncss');
    });

    watch(path.watch.scss, function() {
      gulp.start('sass-dev');
    });
    watch(path.watch.bootstrap, function() {
      gulp.start('bootstrap');
    });
    watch(path.watch.libs, function() {
      gulp.start('libs');
    });

    watch(path.watch.js, function() {
      gulp.start('js');
    });

    watch(path.watch.jsVendor, function() {
      gulp.start('js-vendor');
    });

    watch(path.watch.img, function() {
      gulp.start('img');
    });

    watch(path.watch.favicon, function() {
      gulp.start('favicon');
    });

    watch(path.watch.fonts, function() {
      gulp.start('fonts');
    });
});
