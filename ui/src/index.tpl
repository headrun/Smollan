<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="-1">

    <!-- vendor styles -->
    <link rel="stylesheet"
          href="<%= static("libs/font-awesome/css/font-awesome.min.css", true) %>" />
    <link rel="stylesheet"
          href="<%= static("libs/datatables/media/css/jquery.dataTables.min.css", true) %>" />
    <link rel="stylesheet"
          href="<%= static("libs/bootstrap/dist/css/bootstrap.min.css", true) %>"  />
    <link rel="stylesheet"
          href="<%= static("libs/bootstrap-daterangepicker/daterangepicker.css", true) %>" />    
    <link rel="stylesheet"
          href="<%= static("vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css", true) %>" />

    <!--<link href="<%= static("vendors/bower_components/bootstrap-select/dist/css/bootstrap-select.css" , true) %>" rel="stylesheet">-->
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
        <div class="loader_wrapper">
        <div class="preloader pls-red pl-xl">
              <svg class="pl-circular" viewBox="25 25 50 50">
                  <circle class="plc-path" cx="50" cy="50" r="20" />
              </svg>
        </div>
        </div>
      </div>
    </div>

    <script>
      ;(function () {

        window.BS = {"templateDir": "<%= templateDir %>"};
      }());
    </script>
    <!-- APP -->
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script src="<%= static("js/app.js") %>"></script>
    <script id="no_data_msg" type="template/text">
      <div class='empty_msg'>
        <div class='message'>
          <div class='card'>
            <div class='card-header'>
              <h2 class='text-info'>!Info</h2>
            </div>
            <div class='card-body card-padding'>
               No data available..
            </div>
          </div>
        </div>
      </div>
    </script>
  </body>
</html>
