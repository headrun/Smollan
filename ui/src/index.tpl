<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="-1">

    <!-- vendor styles -->
    <link rel="stylesheet"
          href="<%= static("libs/font-awesome/css/font-awesome.min.css", true) %>" />
    <!-- application specific styles -->
    <link rel="stylesheet"
      href="<%= static("css/admin.css") %>"/>
    <link rel="stylesheet"
          href="<%= static("css/app.css") %>"/>
  </head>

  <body>
    <div ng-app="bootstrap" class="app">
      <div ui-view autoscroll="false" class="content">
      </div>
      <!-- Loading overlay, which block screen unless everything is rendered -->
      <div ng-if="loading" class="loading-overlay">
        <div><span>Loading...</span></div>
      </div>
    </div>

    <script>
      ;(function () {

        window.BS = {"templateDir": "<%= templateDir %>"};
      }());
    </script>
    <!-- APP -->
    <script src="<%= static("js/app.js") %>"></script>
  </body>
</html>