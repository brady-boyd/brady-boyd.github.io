var gulp = require('gulp');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass')(require('sass'));
var plumber = require('gulp-plumber');
var cp = require('child_process');
// Use dynamic import for gulp-imagemin
// var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');

var jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

gulp.task('jekyll-build', function (done) {
	return cp.spawn(jekyllCommand, ['build'], {stdio: 'inherit'})
		.on('close', done);
});

gulp.task('jekyll-rebuild', gulp.series(['jekyll-build'], function (done) {
	browserSync.reload();
	done();
}));

gulp.task('browser-sync', gulp.series(['jekyll-build'], function(done) {
	browserSync({
		server: {
			baseDir: '_site'
		}
	});
	done()
}));

gulp.task('sass', function() {
  return gulp.src('src/styles/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(csso())
		.pipe(gulp.dest('assets/css/'))
});

gulp.task('fonts', function() {
	return gulp.src('src/fonts/**/*.{ttf,woff,woff2}')
		.pipe(plumber())
		.pipe(gulp.dest('assets/fonts/'))
});

gulp.task('imagemin', function() {
	// Dynamically import gulp-imagemin when the task is run
	return import('gulp-imagemin')
		.then(({ default: imagemin }) => {
			return gulp.src('src/img/**/*.{jpg,png,gif}')
				.pipe(plumber())
				.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
				.pipe(gulp.dest('assets/img/'))
		});
});

gulp.task('js', function() {
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'))
});

gulp.task('watch', function() {
  gulp.watch('src/styles/**/*.scss', gulp.series(['sass', 'jekyll-rebuild']));
  gulp.watch('src/js/**/*.js', gulp.series(['js', 'jekyll-rebuild']));
  gulp.watch('src/fonts/**/*.{tff,woff,woff2}', gulp.series(['fonts']));
  gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series(['imagemin']));
  gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], gulp.series(['jekyll-rebuild']));
});

gulp.task('default', gulp.series(['js', 'sass', 'fonts', 'browser-sync', 'watch']));
