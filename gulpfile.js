/**   
** npm install gulp-bower gulp-livereload gulp-rename tiny-lr gulp-concat gulp-clean gulp-notify gulp-jshint gulp-minify-css gulp-autoprefixer gulp-cache gulp-uglify gulp-imagemin --save-dev 
*/
var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    bower = require('gulp-bower'),
    livereload = require('gulp-livereload');

    var EXPRESS_PORT = 4000,
	 	EXPRESS_ROOT = __dirname,
	 	LIVERELOAD_PORT = 35729;

// Let's make things more readable by
// encapsulating each part's setup
// in its own method
function startExpress() {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(EXPRESS_ROOT));
  app.listen(EXPRESS_PORT);
}

// We'll need a reference to the tinylr
// object to send notifications of file changes
// further down
var lr;
function startLivereload() {
 
  lr = require('tiny-lr')();
  lr.listen(LIVERELOAD_PORT);
}
 
// Notifies livereload of changes detected
// by `gulp.watch()` 
function notifyLivereload(event) {
 
  // `gulp.watch()` events provide an absolute path
  // so we need to make it relative to the server root
  var fileName = require('path').relative(EXPRESS_ROOT, event.path);
 
  lr.changed({
    body: {
      files: [fileName]
    }
  });
}

function notifyLivereload(event) {
  gulp.src(event.path, {read: false})
      .pipe(require('gulp-livereload')(lr));
}

gulp.task('bower', function() {
  bower()
    .pipe(gulp.dest('dist/js/lib/'))
});

//$ gulp styles
gulp.task('styles', function() {
  return gulp.src('src/css/*.css')
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(concat('style.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});

//$ gulp scripts
gulp.task('scripts', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(concat('main.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Scripts task complete' }));
});

//$ gulp lint
gulp.task('lint', function(){
    return gulp.src('src/js/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

gulp.task('images', function() {
   return gulp.src('src/images/**/*')
     .pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
     .pipe(gulp.dest('dist/img'))
     .pipe(livereload(server))
     .pipe(notify({ message: 'Images task complete' }));
});

//$ gulp clean
gulp.task('clean', function() {
  return gulp.src(['dist/css/*', 'dist/js/main.js', 'dist/js/lib/*', 'dist/img/*'], {read: false})
    .pipe(clean());
});

//$ gulp
gulp.task('default', ['clean'], function() {
    gulp.start('bower', 'styles', 'scripts', 'images');
});

gulp.task('livereload', function(){  
    server.listen(35729, function(err){
        if(err) return console.log(err);
    });
});

// Watch
gulp.task('dev', function() {

	startExpress();
  	startLivereload();

	gulp.watch('src/index.html', notifyLivereload);

    // Watch .scss files
    gulp.watch('src/css/**/*.css', ['styles']);

    // Watch .js files
    gulp.watch('src/js/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('src/img/**/*', ['images']);

});
