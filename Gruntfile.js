require('babel/register')(require('./src/optimize/babelOptions').node);

module.exports = function (grunt) {
  var pkgConf = grunt.file.readJSON('package.json');

  // set the config once before calling load-grunt-config
  // and once during so that we have access to it via
  // grunt.config.get() within the config files
  var config = {
    pkg: pkgConf,
    root: __dirname,
    src: __dirname + '/src',
    build: __dirname + '/build', // temporary build directory
    plugins: __dirname + '/src/plugins',
    server: __dirname + '/src/server',
    target: __dirname + '/target', // location of the compressed build targets
    testUtilsDir: __dirname + '/src/testUtils',
    configFile: __dirname + '/src/config/kibana.yml',

    karmaBrowser: (function () {
      if (grunt.option('browser')) {
        return grunt.option('browser');
      }

      switch (require('os').platform()) {
        case 'win32':
          return 'IE';
        case 'darwin':
          return 'Chrome';
        default:
          return 'Firefox';
      }
    }()),

    nodeVersion: grunt.file.read('.node-version').trim(),

    kibanaVersion: pkgConf.version.split('-reshin-', 1)[0], // the base kibana version number in front of '-reshin-...'
    reshinVersion: pkgConf.version.split('-reshin-', 2)[1], // the reshin version after '-reshin-...'

    meta: {
      banner: '/*! <%= package.name %> - v<%= package.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= package.homepage ? " * " + package.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= package.author.company %>;' +
        ' Licensed <%= package.license %> */\n'
    },

    lintThese: [
      'Gruntfile.js',
      '<%= root %>/tasks/**/*.js',
      '<%= root %>/test/**/*.js',
      '<%= src %>/**/*.js',
      '!<%= src %>/fixtures/**/*.js',
      '!<%= root %>/test/fixtures/scenarios/**/*.js'
    ],
    deepModules: {
      'caniuse-db': '1.0.30000265',
      'chalk': '1.1.0',
      'glob': '4.5.3',
      'har-validator': '1.8.0',
      'json5': '0.4.0',
      'loader-utils': '0.2.11',
      'micromatch': '2.2.0',
      'postcss-normalize-url': '2.1.1',
      'postcss-reduce-idents': '1.0.2',
      'postcss-unique-selectors': '1.0.0',
      'postcss-minify-selectors': '1.4.6',
      'postcss-single-charset': '0.3.0',
      'regenerator': '0.8.36'
    },

    untar: {
      dist: {
        files: {
          '<%= target %>/kibana-<%= pkg.version %>-darwin-x64': '<%= target %>/kibana-<%= pkg.version %>-darwin-x64.tar.gz',
        }
      }
    },

    maven: {
      options: {
        groupId: 'org.reshin.kibana',
        artifactId: 'kibana-<%= kibanaVersion %>-reshin',
        version: '<%= reshinVersion %>',
        packaging: 'zip',
        injectDestFolder: false
      },
      install: {
        options: {
          goal: 'install'
        },
        expand: true,
        cwd: '<%= target %>/kibana-<%= pkg.version %>-darwin-x64/kibana-<%= pkg.version %>-darwin-x64/',
        src: [ '**/*' ],
        dest: 'kibana-<%= pkg.version %>'
      },
      deploy: {
        options: {
          goal: 'deploy',
          url: 'http://nexus.folge3.de/nexus/content/repositories/snapshots',
          repositoryId: 'folge3.nexus.snapshot'
        },
        expand: true,
        cwd: '<%= target %>/kibana-<%= pkg.version %>-darwin-x64/kibana-<%= pkg.version %>-darwin-x64/',
        src: [ '**/*' ],
        dest: 'kibana-<%= pkg.version %>'
      },
      release: {
        options: {
          goal: 'release',
          url: 'http://nexus.folge3.de/nexus/content/repositories/releases',
          repositoryId: 'folge3.nexus.release',
          gitpush: true,
          gitpushtag: true
        },
        expand: true,
        cwd: '<%= target %>/kibana-<%= pkg.version %>-darwin-x64/kibana-<%= pkg.version %>-darwin-x64/',
        src: [ '**/*' ],
        dest: 'kibana-<%= pkg.version %>'
      }
    }
  };

  grunt.config.merge(config);

  config.userScriptsDir = __dirname + '/build/userScripts';
  // ensure that these run first, other configs need them
  config.services = require('./tasks/config/services')(grunt);
  config.platforms = require('./tasks/config/platforms')(grunt);

  grunt.config.merge(config);

  // load plugins
  require('load-grunt-config')(grunt, {
    configPath: __dirname + '/tasks/config',
    init: true,
    config: config,
    loadGruntTasks: {
      pattern: ['grunt-*', '@*/grunt-*', 'gruntify-*', '@*/gruntify-*', 'intern']
    }
  });

  // load task definitions
  grunt.task.loadTasks('tasks');
  grunt.task.loadTasks('tasks/build');
  grunt.loadNpmTasks('grunt-untar', 'grunt-maven-tasks');
  grunt.registerTask('install', [ 'build', 'untar', 'maven:install' ]);
  grunt.registerTask('deploy', [ 'build', 'untar', 'maven:deploy' ]);
  grunt.registerTask('release', [ 'build', 'untar', 'maven:release' ]);
};
