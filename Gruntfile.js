/**
 * Created by axel_zhang on 2016/9/6.
 */


module.exports = function(grunt) {
  grunt.initConfig({
    clean: ['dist'],
    uglify: {
      options: {
        report: 'none',
        beautify: true,
        compress: false,
        mangle: false,
        preserveComments: false
      },
      meeting: {
        files: [
          {
            dest: 'dist/js/vendor.js',
            src: [
              'js/vendor/modernizr-3.5.0.min.js',
              'js/vendor/jquery.min.js',
              'js/vendor/knockout.js',
              'js/vendor/swiper.min.js'
            ]
          }, {
            dest: 'dist/js/app.js',
            src: [
              'js/notation.js',
              'js/plugins.js',
              'js/main.js'
            ]
          }]
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'data',
            src: ['**/*'],
            dest: 'dist/data'
          }, {
            expand: true,
            cwd: '',
            src: ['index.html'],
            dest: 'dist'
          }]
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      style: {
        files: [
          {
            src: [
              'css/normalize.css',
              'css/main.css',
              'css/swiper.min.css',
              'css/style.css'
            ],
            dest: 'dist/css/style.css'
          }]
      }
    },
    rev: {
      files: {
        src: [
          'dist/js/**/*.js',
          'dist/css/**/*.css'
        ]
      }
    },
    useminPrepare: {
      css: {
        files: {
          src: ['dist/css/**/*.css']
        }
      },
      js: 'dist/js/*.js',
      html: ['dist/index.html']
    },
    usemin: {
      css: {
        files: {
          src: ['dist/css/**/*.css']
        }
      },
      js: 'dist/js/*.js',
      html: ['dist/index.html'],
      options: {
        assetsDirs: [
          'dist',
          'dist/img',
          'dist/css',
          'dist/js'
        ],
        patterns: {
          js: [
            [
              /(images(\/[a-zA-Z0-9-_]+)+\.(?:gif|jpeg|jpg|png|webp|svg))/gm,
              'Update the JS to reference our revved images'],
            [
              /(javascript(\/[a-zA-Z0-9-_]+)+\.js)/gm,
              'Update the JS to reference our revved images']
          ],
          html: [
            [
              /(images(\/[a-zA-Z0-9-_]+)+\.(?:gif|jpeg|jpg|png|webp|svg))/gm,
              'Update the JS to reference our revved images']]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-usemin');

  // Default task.
  grunt.registerTask('default', [
    'clean',
    'uglify',
    'copy',
    'cssmin',
    'rev',
    'usemin'
  ]);
};
