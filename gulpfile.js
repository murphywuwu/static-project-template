
// 基础变量配置
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({ pattern: '*' });
var reload = plugins.browserSync.reload;
var path = require('path');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var glob = require('glob');
var es = require('event-stream');
var browserify = require('browserify');
var del = require('del');
var through = require('through2');
var gutil   = require('gulp-util');
var log     = gutil.log;
var colors  = gutil.colors;
var fs = require('fs');

var config = {
    path: {
        ejs: './src/pages/*.ejs',
        less: './src/less/*.less',
        sprites_less: './src/less/sprites/sprites.less',
        img: './src/img/*.*',
        icon:'./src/img/icon/*.svg',
        sprites: './src/img/sprites/*.png',
        js: './src/js/*.js'
    },
    dev: {        
        html: './dev/html/',
        css: './dev/css/',
        img: './dev/img/',
        iconfont: './dev/fonts',
        sprites: './dev/img/',
        js: './dev/js/'
    },
    dist: {
        css: './dist/css/',
        img: './dist/img/',
        iconfont: './dist/fonts',
        js: './dist/js/'
    },
    rev: {
        css: './rev/css/',
        img: './rev/img/',
        js: './rev/js/'
    },
    autoprefixerBrowsers: [
        'ie >= 9',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 2.3',
        'bb >= 10'
    ]
};

/*----------  公共函数  ----------*/
function getFilePath ( file_type, route ) {
  var path;

  if ( typeof route == 'string' ) {
    path = route
  }
  else {
    if ( typeof file_type == 'string' ) {
      switch ( file_type ) {
        case 'less':
          path = config.path.less
          break;
        case 'js':
          path = config.path.js
          break;
        case 'ejs':
          path = config.path.ejs
          break;
        }
      }
    }
    return path;
}

/*----------  功能函数  ----------*/

/**
 * [compileLess]
 * @return {[object]}
 */
function compileLess () {
  var args = Array.prototype.slice.call(arguments);
  var path = getFilePath('less', args[0]);

  return gulp.src(path)
  .pipe(plugins.sourcemaps.init({
    loadMaps: true
  }))
  .pipe(plugins.plumber({
    errorHandler: function ( err ) {
      console.log(err);
      this.emit('end');
    }
  }))
  .pipe(plugins.less())
  .pipe(plugins.autoprefixer({ browsers: config.autoprefixerBrowsers }))
  .pipe(plugins.cssnano())
  .pipe(plugins.rename({
    suffix: '.min'
  }))
  .pipe(plugins.sourcemaps.write('../../maps/css', {addComment: true}))
  .pipe(gulp.dest(config.dev.css))
  .pipe(reload({ stream: true }))
  .pipe(plugins.notify({
    message: 'css编译压缩完成'
  }));
};
gulp.task('dev-css', compileLess)

/**
 * [compileEs6]
 * @param  {Function} done
 * @return {[object]}  
 */

function compileEs6 () {
  var args = Array.prototype.slice.call(arguments);
  var js_path = getFilePath('js', args[0]);

  return glob(js_path, function ( err, files ) {
    if( err ) {
      done( err );
    }
    const tasks = files.map(entry => {
      var file = path.basename(entry);

      return browserify({
        debug: true,
        entries: [entry],
        extension: ['.js']
      })
      .transform(babelify)
      .bundle()
      .on('error', function ( err ) {
        console.log(err);
      })
      .pipe(source(file))
      .pipe(buffer())
      .pipe(plugins.sourcemaps.init({
        loadMaps: true
      }))
      .pipe(plugins.uglify())
      .pipe(plugins.rename({
        suffix: '.min'
      }))
      .pipe(plugins.sourcemaps.write('../../maps/js', {addComment: true}))
      .pipe(gulp.dest(config.dev.js))
      .pipe(reload({stream:true}))
      .pipe(plugins.notify({
        message: 'js编译压缩完成'
      }))
    });
  })
};
gulp.task('dev-js', compileEs6);

/**
 * [compileEjs]
 * @return {[object]}
 */
function compileEjs () {
  var args = Array.prototype.slice.call(arguments);
  var path = getFilePath('ejs', args[0]);

  return gulp.src(path)
  .pipe(plugins.plumber({
    errorHandler: function ( err ) {
      console.log(err);
      this.emit('end');
    }
  }))
  .pipe(plugins.ejs({}, {ext: '.html'}))
  .pipe(gulp.dest(config.dev.html))
  .pipe(reload({stream:true}))
  .pipe(plugins.notify({
    message : 'ejs编译输出html完成'
  }));
}
gulp.task('dev-html', compileEjs);

/**
 * [imagemin]
 * @return {[object]}
 */
function imagemin () {
  return gulp.src(config.path.img)
  .pipe(plugins.imagemin())
  .pipe(gulp.dest(config.dev.img))
  .pipe(reload({ stream : true }))
  .pipe(plugins.notify({
    message : '图片压缩完成'
  }));
}
gulp.task('dev-img', imagemin);

/**
 * [generateIconFont]
 * @return {[object]}
 */
function generateIconFont () {
  return gulp.src(config.path.icon)
  .pipe(plugins.iconfontCss({
    fontName: 'iconFont',
    targetPath: '../../src/less/iconfont/iconfont.less',
    fontPath: 'https://images.mepai.me/web/fonts/'
  }))
  .pipe(plugins.iconfont({
    fontName: 'iconFont',
    formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
    normalize: true,
    fontHeight: 1001
  }))
  .pipe(gulp.dest(config.dev.iconfont))
  .pipe(plugins.notify({
    message: 'svg图标生成完成'
  }));
}
gulp.task('dev-svg-icon', generateIconFont);

/**
 * [sprites]
 * @param  {Function} done 
 * @return {[object]}   
 */
function sprites ( done ) {
  var spriteData = [];

  // 合并图片
  function spriteImg ( path, name ) {
     return gulp.src(path)
     .pipe(plugins.spritesmith({
       'imgName': name + '.png',
       'imgPath': '../img/' + name + '.png',
       'cssName': name + '.less',
       'cssFormat' : 'less'
    }));
  };
  spriteData.push(spriteImg(config.path.sprites, 'sprites'));
  // 输出图片
  for(var i = 0,len=spriteData.length; i < len; i++) {
      spriteData[i].img
          .pipe(plugins.buffer())
          .pipe(plugins.imagemin())
          .pipe(gulp.dest('./src/img/')) // 输出icon合图
          .pipe(reload({ stream : true }))
          .pipe(plugins.notify({
            message : '精灵图片合并输出完成'
          }));
      spriteData[i].css
          .pipe(gulp.dest('./src/less/sprites/')) // 输出icon.less
          .pipe(plugins.notify({
            message : '精灵图less文件输出完成'
          }));
  };
  done();
}
gulp.task('dev-sprites', sprites);

/**
 * [serve]
 * @return {[object]}
 */
function serve () {
  plugins.browserSync({
      server: {
          baseDir:'./'
      },
      startPath: config.dev.html
  });
  watchFile();
}
gulp.task('dev-serve', serve);

/**
 * [watchFile]
 *
 */
function watchFile () {
  var watch_less = gulp.watch(config.path.less, function () {
    console.log('less文件变化监听启动');
  });
  var watch_js = gulp.watch(config.path.js, function () {
    console.log('js文件变化监听启动');
  });
  var watch_ejs = gulp.watch(config.path.ejs, function () {
    console.log('ejs文件变化监听启动');
  });
  var watch_img = gulp.watch(config.path.img, gulp.parallel(imagemin));
  var watch_icon = gulp.watch(config.path.icon, gulp.series(generateIconFont, compileLess));
  var watch_sprites = gulp.watch(config.path.sprites, gulp.parallel(sprites, imagemin, compileLess));

  // 监听文件内容变化
  watch_less.on('change', function ( e ) {
    var file_path = path.resolve(e);
    compileLess(file_path);
  });
  watch_js.on('change', function ( e ) {
    var file_path = path.resolve(e);
    compileEs6(file_path);
  });
  watch_ejs.on('change', function ( e ) {
    var file_path = path.resolve(e);
    compileEjs(file_path);
  })

  // 监听删除文件
  watch_less.on('unlink', function ( route ) {
    var base = path.basename(route, '.less');
    var minFile = './dev/css/' + base + '.min.css';
    plugins.del.sync(minFile);
  });
  watch_js.on('unlink', function ( route ) {
    var base = path.basename(route);
    var minFile = './dev/js/' + path.basename(route, '.js') + '.min.js';
    plugins.del.sync(minFile);
  });
  watch_ejs.on('unlink', function ( route ) {
    var base = path.basename(route, 'ejs');
    var file = './dev/html/' + base + 'html';
    plugins.del.sync(file);
  });
  watch_img.on('unlink', function ( route ) {
    var base = path.basename(route);
    var file = './dev/img/' + base;
    plugins.del.sync(file);
  });
  watch_icon.on('unlink', function () {
    gulp.series(generateIconFont)();
  });
  watch_sprites.on('unlink', function () {
    gulp.series(sprites)();
  });
}
gulp.task('dev-watch', watchFile);


/*----------  发布  ----------*/
function revJs () {
  return gulp.src(['./dev/js/*.js'])
      .pipe(plugins.rev())
      .pipe(gulp.dest(config.dist.js))
      .pipe(plugins.rev.manifest())
      .pipe(gulp.dest(config.rev.js));
}
gulp.task('rev-js', revJs);
function revImg () {
  return gulp.src(['./dev/img/*.*'])
      .pipe(plugins.rev())
      .pipe(gulp.dest(config.dist.img))
      .pipe(plugins.rev.manifest())
      .pipe(gulp.dest(config.rev.img));
}
gulp.task('rev-img', revImg);
function revCss () {
  return gulp.src(['./dev/css/*.*'])
      .pipe(plugins.rev())
      .pipe(gulp.dest(config.dist.css))
      .pipe(plugins.rev.manifest())
      .pipe(gulp.dest(config.rev.css));
}
gulp.task('rev-css', revCss);

function replaceHtmlRev () {
  return gulp.src(['./rev/**/*.json', './dev/html/*.html'])
      .pipe(plugins.revCollector({
        replaceReved: true,
        dirReplacements: {
          '../css': './css',
          '../js': './js',
          '../img': 'http://images.mepai.me/web/www/images'
        }
      }))
      .pipe(gulp.dest('./dist/html/'))
      .pipe(reload({ stream: true }))
      .pipe(plugins.notify({
        message: 'html内缓存文件替换成功'
      }))
}
gulp.task('dev-replace-html-rev', replaceHtmlRev);
function replaceCssRev () {
  return gulp.src(['./rev/**/*.json', './dist/css/*.css'])
      .pipe(plugins.revCollector({
        replaceReved: true,
        dirReplacements: {
          '../img': 'https://images.mepai.me/web/img'
        }
      }))
      .pipe(gulp.dest('./dist/css/'))
      .pipe(plugins.notify({
        message: 'css内缓存文件替换成功'
      }))
}
gulp.task('dev-replace-css-rev', replaceCssRev);

function clean ( cb ) {
  del('dist/**', {force:true});
  cb();
}
gulp.task('clean', clean);

// 开发
gulp.task('build_dev', gulp.series(
  compileEjs,
  compileEs6,
  generateIconFont,
  sprites,
  imagemin,
  compileLess,
  serve
));

// 发布
gulp.task('build_dist', gulp.series(
  clean,
  revJs,
  revImg,
  revCss,
  replaceCssRev,
  replaceHtmlRev
));
