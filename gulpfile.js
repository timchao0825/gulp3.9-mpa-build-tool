var gulp = require('gulp'),
    rename = require('gulp-rename'), // 檔案重新命名
    // concat = require('gulp-concat'), // 合併檔案（一整個資料夾合併）- 目前不使用
    notify = require('gulp-notify'), // 通知訊息
    del = require('del'), // 清除檔案

    sass = require('gulp-sass'),// [css] Sass 編譯
    autoprefixer = require('gulp-autoprefixer'), // [css] CSS自動前綴
    cleancss = require('gulp-clean-css'), // [css] CSS壓縮
    jshint = require('gulp-jshint'), // [JS] JS檢查錯誤
    uglify = require('gulp-uglify'), // [JS] 壓縮JS
    babel = require('gulp-babel'), // [JS] 轉換ES6為ES5，將ES6語法轉換成瀏覽器能讀的ES5
    gulpif = require('gulp-if'), // 就是 if ಠ_ಠ
	inject = require('gulp-inject-string'), // HTML 插入 code
	removeCode = require('gulp-remove-code'), // gulp 移除code

    imagemin = require('gulp-imagemin'), // [IMG] Image壓縮
    imageminPngquant = require('imagemin-pngquant'), // [IMG] PNG壓縮
	imageminGifsicle = require('imagemin-gifsicle'), // [IMG] GIF壓縮
	imageminJpegRecompress = require('imagemin-jpeg-recompress'), // [IMG] JPG壓縮

    plumber = require('gulp-plumber'), // [例外處理] gulp發生編譯錯誤後仍然可以繼續執行，不會被切斷
    changed = require('gulp-changed'), // [例外處理] 找出哪些檔是被修改過的
	extender = require('gulp-html-extend'), // [HTML] html 編譯 （HTML模板）
	pug = require('gulp-pug'),// [HTML / PUG] 編譯 PUG（PUG模板）
    sourcemaps = require('gulp-sourcemaps'), // [檔案追蹤] 來源編譯
    gulpIgnore = require('gulp-ignore'), // [例外處理] 無視指定檔案
    iconfont = require('gulp-iconfont'), // [ICON FONT] 編譯font檔案
    consolidate = require('gulp-consolidate'), // [ICON FONT] 編譯Demo html + icon.scss
    browserSync = require('browser-sync').create(); // 建立同步虛擬伺服器
    var log = require('fancy-log'), // Gulp團隊推薦console.log套件，用法： console('要顯示的文字')
   		debug = require('gulp-debug');
/* Icon Font settings */
// --------------------------------------------------------
/* 如何使用 (How to Used): from Reginna
	1. 將svg圖放入 src/images/font_svg/ 資料夾內
		SVG處理建議：線段要展開轉路徑（AI:物件>展開）

	2. 載入SCSS (Import Scss File): 
		@import "vendor/font/icons";

	3. HTML程式碼使用示範 (HTML Code): 
		Templete: 
		* fontClassName ：觀看下方定義值
		* svgFileName ：svg檔案名稱
		<i class="{{fontClassName}} {{fontClassName}}-{{svgFileName}}"></i>

		Example:
		<i class="be-icon be-icon-agriculture"></i>
	
	* 如果新增新的svg icon，編譯後發現瀏覽器顯示不正確icon
	  解決方式：「清除快取」可正常顯示
*/
var fontName = 'icon',				// set name of your symbol font
	fontClassName = 'be-icon';		// Class Name 可依專案名稱修改，建議不要取"icon"單字，CSS編寫上容易衝突

gulp.task('iconfont:build', function(){
	gulp.src(['src/images/font_svg/*.svg'], {base: './src/'})
		.pipe(changed('src/images/font_svg/*.svg',{
			extension: '.svg',
			hasChanged: changed.compareLastModifiedTime
		}))
		.pipe(iconfont({
			fontName: fontName,
			formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
			appendCodepoints: true,
			appendUnicode: false,
			normalize: true,
			fontHeight: 1000,
			centerHorizontally: true
		}))
		.on('glyphs', function (glyphs, options) {
			// 生成 ICON SCSS
			var nowTime = new Date().getTime();
			gulp.src('src/sass/vendor/font/templates/_icons.scss')
				.pipe(consolidate('underscore', {
					glyphs: glyphs,
					fontName: options.fontName,							// 使用的font-family
					fontPath: '../fonts/icons/',						// 生成的SCSS讀取font檔案讀取位置
					fontDate: nowTime,									// 避免有快取問題
					cssClass: fontClassName								// 使用的class名稱: <i class="{{fontClassName}} {{fontClassName}}-{{svg file name}}"></i>
				}))
				.pipe(gulp.dest('src/sass/vendor/font'));				// 生成SCSS位置

			// 生成 ICON CSS (Demo HTML使用)
			gulp.src('src/sass/vendor/font/templates/_icons.scss')
				.pipe(consolidate('underscore', {
					glyphs: glyphs,
					fontName: options.fontName,
					fontPath: '',
					fontDate: nowTime,
					cssClass: fontClassName
				}))
				.pipe(rename({basename: "icons", extname: '.css'}))
				.pipe(gulp.dest('dist/fonts/icons'))

			// 生成 Demo CSS (Demo HTML使用)
			gulp.src('src/sass/vendor/font/templates/_iconfont-demo.scss')
				.pipe(rename({basename: "iconfont-demo", extname: '.css'}))
				.pipe(gulp.dest('dist/fonts/icons'))

			// 生成Demo HTML
			gulp.src('src/sass/vendor/font/templates/_index.html')
				.pipe(consolidate('underscore', {
					glyphs: glyphs,
					fontName: options.fontName,
					cssClass: fontClassName,
					fontYYYY: new Date().getYear() + 1900
				}))
				.pipe(rename({basename: 'index'}))
				.pipe(gulp.dest('dist/fonts/icons'));
		})
		.pipe(gulp.dest('dist/fonts/icons/'));							//生成的font檔案
});
gulp.task('iconfont', ['iconfont:build'], function() {
    gulp.start('css');
    notify('Font icon Task Complete!');
});

/* CSS process setting */
// --------------------------------------------------------
/*Custom display error function */
var displayError = function(error) {
    var errorString = '[' + error.plugin + ']';
		errorString += ' ' + error.message.replace("\n",'\n'); 
	var last_error_str = 
		'\n============[Error Message]============\n\n' + 
		errorString + 
		'\n=======================================\n';
	var error_msg = 
		"<!--removeIf(production)-->" +
		"<div class='_error-msg_' style='position:relative;z-index:9999;font-size:18px;white-space: pre;font-family: monospace;padding:'><div class='_text_' style='display:flex;justify-content:center;padding:20px;'>" +
		String(last_error_str) +	
		"</div></div>" +	
		"<!--endRemoveIf(production)-->";
	gulp.src('dist/*.html')
		.pipe(inject.after('</head>', error_msg))
        .pipe(gulp.dest('dist'));
}
/* end display error function */
sass.compiler = require('node-sass');
gulp.task('css:build', function () {
	gulp.src('dist/*.html')
		.pipe(removeCode({ production: true }))
		.pipe(gulp.dest('dist'));

    gulp.src('src/sass/vendor/**/*.css')
        .pipe(changed('dist/css', {
            extension: '.css',
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('dist/css/vendor'))

	gulp.src('src/sass/**/*.+(scss|sass)')
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(sass.sync().on('error', function(err){
			displayError(err);/* custom function */
			// console.error(err.message);
			this.emit('end'); 
		}))
    	.pipe(changed('dist/css', {
            extension: '.css',
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(autoprefixer('last 2 version', 'ie 11', 'ios 8', 'android 4'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleancss({ rebase: false }))
		.pipe(sourcemaps.write('maps', {
            includeContent: false,
		    sourceRoot: 'src/sass'
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream())
    	.pipe(notify('CSS Task Complete!'))
});
/* CSS reload setting */
// --------------------------------------------------------
gulp.task('css', ['css:build'], function(done){
	// browserSync.reload();
	done();
});

/* image setting */
// --------------------------------------------------------
gulp.task('pic:build', function () {
	return gulp.src('src/images/**/*')
		.pipe(plumber())
		.pipe(changed('dist/images/*',{
			hasChanged: changed.compareLastModifiedTime
		}))
		
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			// imagemin.jpegtran({progressive: true}),
			// [jpg] quality setting
			// 原設定數字：Max: 95, min: 40
			imageminJpegRecompress({
				quality: 'veryhigh',
				progressive: true,
				max: 75,/* 符合google speed 範疇 */
				min: 60
			}),
			// [png] quality setting
			// 原設定數字：Type: Array<min: number, max: number>
			// imageminPngquant({quality: [0.8, 0.9]})

			// [svg] quality setting
			// svg壓縮怕會壓縮到不該壓縮的程式碼，導致動畫無法製作
			// 目前需自行壓縮整理處理svg檔案
			// SVG線上壓縮：https://jakearchibald.github.io/svgomg/
			// imagemin.svgo({plugins: [{removeViewBox: false}]}) 
        ]))
		.pipe(gulp.dest('dist/images'))
		.pipe(browserSync.stream())
        .pipe(notify('Pic task Compressed!'));
});
/* image setting */
// --------------------------------------------------------
gulp.task('pic', ['pic:build'], function(done){
	done();
});

/* js min setting */
// --------------------------------------------------------
gulp.task('js:build', function () {
    return gulp.src([
            'src/js/*.js',
            '!src/js/**/_*.js',
            '!src/js/{vendor,lib,plugin,plugins,foundation}/**/*.js',
		])
		.pipe(plumber())
        .pipe(babel())
        .pipe(jshint())
        .pipe(changed('dist/js', {
            extension: '.js',
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulpIgnore.exclude('vendor/**/*.*'))
        .pipe(gulp.dest('dist/js'))
        // Minify
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream())
        .pipe(notify('JS Task Complete!'));
});
gulp.task('js:vendor', function() {
	return gulp.src([
            'src/js/{vendor,lib,plugin,plugins,foundation}/*.js',
            '!src/js/{vendor,lib,plugin,plugins,foundation}/**/*.min.js',
            '!src/js/{vendor,lib,plugin,plugins,foundation}/**/*-min.js'
        ])
		.pipe(plumber())
		.pipe(jshint())
		.pipe(changed('dist/js',{
			extension: '.js',
			hasChanged: changed.compareSha1Digest
        }))
        // Minify
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream())
		.pipe(notify('JS Plugin Task Complete!'));
});
gulp.task('js:vendor:min', function() {
	return gulp.src([
            'src/js/{vendor,lib,plugin,plugins,foundation}/**/*.min.js',
            'src/js/{vendor,lib,plugin,plugins,foundation}/**/*-min.js'
        ])
		.pipe(plumber())
		.pipe(jshint())
		.pipe(changed('dist/js',{
			extension: '.js',
			hasChanged: changed.compareSha1Digest
        }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream())
		.pipe(notify('JS Plugin Task Complete!'));
});
/* js setting */
// --------------------------------------------------------
gulp.task('js', ['js:build','js:vendor','js:vendor:min'], function(done){
	done();
});

/* html 模板 setting */
// --------------------------------------------------------
gulp.task('extend:build', function () {
	return gulp.src(['src/*.pug' , '!src/_*.pug'])
	  .pipe(plumber())
	  .pipe(pug({
		pretty: true
	  }))
	  .pipe(gulp.dest('dist'))
	  .pipe(browserSync.stream())
	  .pipe(notify('HTML / PUG Task Complete!'));
});
gulp.task('extend-before', ['extend:build'], function(done){
	done();
});

/* 清除 setting */
// --------------------------------------------------------
gulp.task('clean', function () {
    return del.sync([
        'dist/css',
		'dist/js',
		'dist/images'
    ]);
});

// 先將 dist clean 清除後，再執行全部 task 任務
// --------------------------------------------------------
gulp.task('default', ['clean'], function () {
    gulp.start('extend-before','iconfont','css','pic','js','watch');
});

/* 監看 setting */
// --------------------------------------------------------
gulp.task('watch', function () {
    browserSync.init({
		open:false,
        server: {
            baseDir: "./dist",
            online: false
        }
    });
	gulp.watch('src/sass/**/*.+(scss|sass)', ['css']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/images/**/*', ['pic']);
    gulp.watch('src/images/font_svg/*.svg', ['iconfont']);
    gulp.watch('src/sass/vendor/font/templates/_icons.scss', ['iconfont']);
    // Watch .html files
	// gulp.watch(['src/**/*.html'], ['extend']);
	gulp.watch(['src/**/*.pug'], ['extend-before']);
});