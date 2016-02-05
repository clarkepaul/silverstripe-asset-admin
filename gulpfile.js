var gulp = require('gulp'),
	browserify = require('browserify'),
	babelify = require('babelify'),
	source = require('vinyl-source-stream'),
	sass = require('gulp-sass'),
	packageJSON = require('./package.json'),
	semver = require('semver'),
	notify = require('gulp-notify');

var PATHS = {
	JAVASCRIPT_DIST: './javascript/dist',
	JAVASCRIPT_SRC: './javascript/src/**/*.js',
	SCSS: './javascript/src/**/*.scss',
	IMAGES: './javascript/src/img/**'
};

var isDev = typeof process.env.npm_config_development !== 'undefined';

var nodeVersionIsValid = semver.satisfies(process.versions.node, packageJSON.engines.node);

var browserifyOptions = { entries: './javascript/src/boot/index.js' };

if (!nodeVersionIsValid) {
	console.error('Invalid Node.js version. You need to be using ' + packageJSON.engines.node);
	process.exit();
}

if (isDev) {
	browserifyOptions.debug = true;
}

gulp.task('js', function () {
	return browserify(browserifyOptions)
		.transform(babelify)
		.external('react')
		.external('jQuery')
		.external('i18n')
		.external('silverstripe-component')
		.external('react-dom')
		.external('react-addons-test-utils')
		.external('react-redux')
		.external('redux')
		.external('redux-thunk')
		.external('page.js')
		.bundle()
		.on('error', notify.onError({ message: 'Error: <%= error.message %>' }))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest(PATHS.JAVASCRIPT_DIST));
});

gulp.task('sass', function () {
	return gulp.src('./javascript/src/styles/main.scss')
		.pipe(sass().on('error', notify.onError({ message: 'Error: <%= error.message %>' })))
		.pipe(gulp.dest(PATHS.JAVASCRIPT_DIST));
});

gulp.task('images', function () {
	return gulp.src(PATHS.IMAGES)
		.pipe(gulp.dest(PATHS.JAVASCRIPT_DIST + '/img'));
});

gulp.task('default', ['js', 'sass', 'images'], function () {
	if (isDev) {
		gulp.watch(PATHS.JAVASCRIPT_SRC, ['js']);
		gulp.watch(PATHS.SCSS, ['sass']);
	}
});
