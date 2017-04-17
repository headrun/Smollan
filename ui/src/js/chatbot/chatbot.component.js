;(function (angular, global) {
  "use strict";

  angular.module("chatbot")
         .component("chatbot", {
           "templateUrl": global.templateDir + "/chatbot.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

               that.hideLoading();

             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
