var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var client = require('firebase-tools');



gulp.task("compile", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("./"));
});


gulp.task('deploy', ['compile'], function (){
	client.deploy({
		project: 'gruvcast-af95b',
		token: process.env.FIREBASE_TOKEN,
		cwd: '../'
	}).then(function() {
		console.log('Rules have been deployed!')
		process.exit(0);
	}).catch(function(err) {
		// handle error
		console.log(err);
		process.exit(1);
	});	
})

gulp.task('default', ['compile', 'deploy']);

