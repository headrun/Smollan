;(function (angular, global) {
  "use strict";

  angular.module("login")
         .component("login", {

           "templateUrl" : global.templateDir + "/login.html",
           "controller"  : ["$rootScope", "Auth", "AUTH_EVENTS",

             function ($rootScope, Auth, AUTH_EVENTS) {

              $('body').addClass('login-content sw-toggled');

              var that = this;

              this.credentials = {

                "username": "",
                "password": ""
              };

              this.errorMsg = "";
              this.loadingText = "Login";

              this.onSubmit = function (credentials) {

                this.loadingText = "Verifying...";
                this.viewSubmit = "disabled";

                Auth.login(credentials).then(function () {

                  $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                }, function () {

                  that.loadingText = "Login";
                  that.errorMsg = "Invalid Credentials";
                  that.viewSubmit = "";
                });
              };
            }]
        });

}(window.angular, window.BS));
