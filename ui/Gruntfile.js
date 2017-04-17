var fs     = require("fs"),
    uglify = require("uglify-js"),
    grunt  = require("grunt"),
    _      = require("underscore"),
    htmlMinify = require('html-minifier').minify,
    jsdom = require("jsdom").jsdom,
    serializeDocument = require("jsdom").serializeDocument;


var pkg = JSON.parse(fs.readFileSync("package.json")),
    isProd = pkg.environment === "production";

var uglifyJSOps = {

  "banner": "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
            "<%= grunt.template.today(\"yyyy-mm-dd\") %> */"
};

if (isProd) {

  _.extend(uglifyJSOps, {

    "stripBanners": true,
    "separator": ";",
    "process": function (src) {

      return uglify.minify(src, {

        "fromString": true,
        "compress": {

          "dead_code"    : true,
          "drop_console" : true,
          "drop_debugger": true,
          "unused"       : true,
          "join_vars"    : true
        },
        "mangle": {

          "toplevel": true
        }
      }).code;
    }
  });
} else {

  _.extend(uglifyJSOps, {

    "separator": "\n/*===================================*/\n",
    "process": function (src, filePath) {

      return "/* FILE: " + filePath + " */\n\n" + src;
    }
  });
}

function getLessCssOpts () {

  return {

    "plugins": [

      new (require('less-plugin-autoprefix'))({}),
      new (require('less-plugin-clean-css'))({})
    ],
    "compress": true
  };
}

function getHtmlOptions (staticUrl, templateParams, doNotParse) {

  var version = pkg.version;

  templateParams = templateParams || {};

  return {

    "process": function (template) {

      template = _.template(template)(_.extend({}, templateParams, {

        "title": null,
        "static": function (url, noVersioning) {

          return staticUrl + "/" + url +
                 (!noVersioning ? "?v=" + version : "");
        }
      }));

      if (!doNotParse) {

	/* parse script tags with type template and put actual
	 * content in 'em */
	var doc = jsdom(template, {}),
	    window = doc.defaultView,
	    document = window.document,
	    scripts = document.querySelectorAll('[type="template"]');

	_.each(scripts, function (el) {

	  var src = el.src;

	  src = fs.readFileSync(src);

	  el.innerHTML = src;
	  el.removeAttribute("src");
	});

        template = serializeDocument(doc);
      }

      return htmlMinify(template,
                        {
                          "processScripts": ["template"],
                          "removeComments": true,
                          "collapseWhitespace": true,
                          "sortAttributes": true,
                          "sortClassName": true
                        });
    }
  };
}

var config = {

  "pkg"        : pkg,
  "dist"       : "dist",
  "src"        : "src",
  "libsPath"   : "<%= src %>/libs",
  "vendorPath" : "<%= src %>/vendor",
  "jsPath"     : "<%= src %>/js",
  "awsCred"    : grunt.file.readJSON("aws-credentials.json"),
  "concat": {

    "js": {

      "options": uglifyJSOps,
      "src": ["<%= libsPath %>/angular/angular.min.js",
              "<%= libsPath %>/jquery/dist/jquery.min.js",
              "<%= libsPath %>/angular-ui-router/release/angular-ui-router.min.js",
              "<%= vendorPath %>/bower_components/bootstrap/dist/js/bootstrap.min.js",
              "<%= vendorPath %>/vendors/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js",
              "<%= vendorPath %>/vendors/bower_components/Waves/dist/waves.min.js",
              "<%= vendorPath %>/vendors/bootstrap-growl/bootstrap-growl.min.js",
              "<%= vendorPath %>/vendors/bower_components/bootstrap-sweetalert/lib/sweet-alert.min.js",
              "<%= jsPath %>/core/auth/auth.js",
              "<%= jsPath %>/core/auth/session.js",
              "<%= jsPath %>/core/auth/authEvents.js",
              "<%= jsPath %>/core/csrf/csrf.js",
              "<%= jsPath %>/core/poll.js",
              "<%= jsPath %>/login/login.module.js",
              "<%= jsPath %>/login/login.component.js",
              "<%= jsPath %>/logout/logout.module.js",
              "<%= jsPath %>/logout/logout.component.js",
              "<%= jsPath %>/header/header.module.js",
              "<%= jsPath %>/header/header.component.js",
              "<%= jsPath %>/chatbot/chatbot.module.js",
              "<%= jsPath %>/chatbot/chatbot.component.js",
              "<%= jsPath %>/attendance/attendance.module.js",
              "<%= jsPath %>/attendance/attendance.component.js",
              "<%= jsPath %>/osa/osa.module.js",
              "<%= jsPath %>/osa/osa.component.js",
              "<%= jsPath %>/promo/promo.module.js",
              "<%= jsPath %>/promo/promo.component.js",
              "<%= jsPath %>/map/map.module.js",
              "<%= jsPath %>/map/map.component.js",
              "<%= jsPath %>/reports/reports.module.js",
              "<%= jsPath %>/reports/reports.component.js",
              "<%= jsPath %>/footer/footer.module.js",
              "<%= jsPath %>/footer/footer.component.js",
              "<%= jsPath %>/dashboard/dashboard.module.js",
              "<%= jsPath %>/dashboard/dashboard.component.js",
              "<%= jsPath %>/app.js",
              "<%= jsPath %>/app.config.js"],
      "dest": "<%= dist %>/js/app.js"
    },
    "html": {

      "options": getHtmlOptions("",
                                {templateDir: "/views"}),
      "src": ["<%= src %>/index.tpl"],
      "dest": "<%= dist %>/index.html"
    },
    "compHtmlTmpl": {

      "options": getHtmlOptions("", null, true),
      "files": [{
        "expand": true,
        "flatten": true,
        "src"   : "<%= src %>/js/**/*.html",
        "dest"  : "<%= dist %>/views/"
      }]
    }
  },
  "less": {

    "css": {

      "options": getLessCssOpts(),
      "src": ["<%= src %>/less/app.less"],
      "dest": "<%= dist %>/css/app.css"
    }
  },
  "copy": {

    "assets": {

      "files": [
        {
          expand: true,
          cwd: "<%= src %>/",
          src: ["libs/**", "vendor/**", "img/**", "fonts/**"],
          dest: "<%= dist %>/"
        }
      ]
    },
  },
  "s3": {

    options: {

      accessKeyId    : "<%= awsCred.accessKeyId %>",
      secretAccessKey: "<%= awsCred.secretAccessKey %>",
      bucket         : "headrun-bootstrap-example",
      region         : "ap-south-1",
      cache          : "false",
      cacheTTL       : 0
    },

    "dist": {

      cwd: "dist/",
      src: "**",
      dest: ""
    }
  },
  "watch" : {

    css: {
      files: ["<%= src %>/less/**/*.less"],
      tasks: ["less:css"]
    },

    js: {
      files: ["<%= src %>/js/**/*.js"],
      tasks: ["concat:js"]
    },

    html: {
      files: ["<%= src %>/js/**/*.html",
              "<%= src %>/index.tpl"],
      tasks: ["concat:html", "concat:compHtmlTmpl"]
    }
  }
};

grunt.initConfig(config);

grunt.loadNpmTasks("grunt-contrib-concat");
grunt.loadNpmTasks("grunt-contrib-less");
grunt.loadNpmTasks("grunt-contrib-copy");
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks("grunt-aws");

grunt.registerTask("sourcefiles", ["concat:js", "less:css",
                                   "concat:html", "concat:compHtmlTmpl"]);
grunt.registerTask("deploy", ["s3"]);
grunt.registerTask("default", ["sourcefiles"]);
grunt.registerTask("init", ["copy:assets", "default"]);
