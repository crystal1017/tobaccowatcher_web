// Generated on 2013-12-23 using generator-webapp 0.4.6
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // Configurable paths
            app: 'app',
            dist: 'dist'
        },

        app: {
            templates: '<%= yeoman.app %>/templates',
            scripts: '<%= yeoman.app %>/static/scripts',
            styles: '<%= yeoman.app %>/static/styles',
            images: '<%= yeoman.app %>/static/images',
            bowerComponents: '<%= yeoman.app %>/static/bower_components',
            jst: '<%= yeoman.app %>/static/scripts/templates'
        },

        dist: {
            templates: '<%= yeoman.dist %>/templates',
            scripts: '<%= yeoman.dist %>/static/scripts',
            styles: '<%= yeoman.dist %>/static/styles',
            images: '<%= yeoman.dist %>/static/images',
            bowerComponents: '<%= yeoman.dist %>/static/bower_components'
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>',
                    livereload: false
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        jst: {
            compile: {
                files: {
                    '.tmp/static/scripts/templates.js': ['<%= app.jst %>/*.ejs']
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= app.scripts %>/{,*/}*.js',
                '!<%= app.scripts %>/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
                }
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: '<%= app.styles %>',
                cssDir: '.tmp/static/styles',
                generatedImagesDir: '.tmp/static/images/generated',
                imagesDir: '<%= app.images %>',
                javascriptsDir: '<%= app.scripts %>',
                fontsDir: '<%= app.styles %>/fonts',
                importPath: '<%= app.bowerComponents %>',
                httpImagesPath: '/static/images',
                httpGeneratedImagesPath: '/static/images/generated',
                httpFontsPath: '/static/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= dist.images %>/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/static/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/static/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the HTML file
        'bower-install': {
            app: {
                html: '<%= app.templates %>/index.html',
                ignorePath: '<%= yeoman.app %>/'
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= dist.scripts %>/{,*/}*.js',
                        '<%= dist.styles %>/{,*/}*.css',
                        '<%= dist.images %>/{,*/}*.{gif,jpeg,jpg,png,webp}',
                        '<%= dist.styles %>/fonts/{,*/}*.*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>',
                flow: { steps: { js: ['concat'], css: ['concat', 'cssmin']}, post: {}}

            },
            html: '<%= app.templates %>/{base.html,trends.html}'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= dist.templates %>/{,*/}*.html'],
            css: ['<%= dist.styles %>/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.images %>',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= dist.images %>'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.images %>',
                    src: '{,*/}*.svg',
                    dest: '<%= dist.images %>'
                }]
            }
        },

        grunticon: {
            myIcons: {
                files: [{
                    expand: true,
                    cwd: '<%= app.images %>/svg_icons/',
                    src: ['*.svg', '*.png'],
                    dest: '<%= dist.images %>/output/'
                }],
                options: {
                    cssprefix: '.ico-',
                    enhanceSVG: true
                }
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/scripts.js': [
                        '<%= yeoman.dist %>/scripts/scripts.js'
                    ]
                }
            }
        },
        concat: {
            dist: {}
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        'static/*.{ico,png,txt}',
                        'static/images/{,*/}*.webp',
                        'static/images/en.png',
                        'static/images/cn.png',
                        'static/images/ru.png',
                        'static/images/es.png',
                        'templates/{,*/}*.{html,txt}',
                        'static/styles/fonts/{,*/}*.*',
                        'static/bower_components/bootstrap-sass/assets/fonts/bootstrap/*.*',
                        'static/bower_components/jquery-ui/themes/smoothness/images/*.*',
                        'static/bower_components/chosen/public/chosen-sprite.png',
                        'static/bower_components/select2/dist/**',
                        'static/bower_components/jquery-date-range-picker/*.{css,daterangepicker.js}',
                        'static/bower_components/moment/min/moment.min.js',
                        'static/bower_components/moment-range/dist/moment-range.min.js',
                        'static/bower_components/jQuery.dotdotdot/src/js/jquery.dotdotdot.min.js',
                        'static/email_assets/{,*/}*.*'
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= app.styles %>',
                dest: '.tmp/static/styles/',
                src: '{,*/}*.css'
            }
        },

        // Generates a custom Modernizr build that includes only the tests you
        // reference in your app
        modernizr: {
            devFile: '<%= app.bowerComponents %>/modernizr/modernizr.js',
            outputFile: '<%= dist.bowerComponents %>/modernizr/modernizr.js',
            files: [
                '<%= app.scripts %>/**/*.js',
                '<%= dist.styles %>/{,*/}*.css',
                '!<%= dist.scripts %>/vendor/*'
            ],
            extensibility: {
                'teststyles': true
            },
            uglify: true
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
                'jst',
                'compass:server',
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'jst',
                'compass',
                'copy:styles',
                'imagemin',
                'svgmin',
                'uglify'
            ]
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['<%= app.scripts %>/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            jst: {
                files: [
                    '<%= app.jst %>/*.ejs'
                ],
                tasks: ['jst']
            },
            jstest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['test:watch']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            compass: {
                files: ['<%= app.styles %>/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },
            styles: {
                files: ['<%= app.styles %>/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= app.templates %>/{,*/}*.html',
                    '.tmp/static/styles/{,*/}*.css',
                    '<%= app.images %>/{,*/}*.{gif,jpeg,jpg,png,svg,webp}'
                ]
            },
            liverebuild: {
                files: [
                    '<%= yeoman.app %>/**/*.*'
                ],
                tasks: ['build']
            }
        },
    });

    grunt.registerTask('createDefaultTemplate', function () {
        grunt.file.write('.tmp/static/scripts/templates.js', 'this.JST = this.JST || {};');
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);

        return null;
    });

    grunt.registerTask('test', function(target) {
        if (target !== 'watch') {
            grunt.task.run([
                'clean:server',
                'concurrent:test',
                'autoprefixer'
            ]);
        }

        grunt.task.run([
            'connect:test',
            'mocha'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'cssmin',
        'grunticon:myIcons',
        //'uglify',
        'copy:dist',
        'modernizr',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
