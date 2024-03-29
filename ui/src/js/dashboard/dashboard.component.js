;(function (angular, global) {
  "use strict";

  // Decalare Pages that are available in this component
  var pages = {
                 "chat": {

                   "name"    : "chat",
                   "fullName": "dashboard.chat",
                   "text"    : "chatbot",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "attendance": {

                   "name"    : "attendance",
                   "fullName": "dashboard.attendance",
                   "text"    : "Attendance",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "osa": {

                   "name"    : "osa",
                   "fullName": "dashboard.osa",
                   "text"    : "OSA",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "promo": {

                   "name"    : "promo",
                   "fullName": "dashboard.promo",
                   "text"    : "PROMO",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "map": {

                   "name"    : "map",
                   "fullName": "dashboard.map",
                   "text"    : "Map",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "reports": {

                   "name"    : "reports",
                   "fullName": "dashboard.reports",
                   "text"    : "Reports",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "cca": {

                   "name"    : "cca",
                   "fullName": "dashboard.cca",
                   "text"    : "cca",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "npd": {

                   "name"    : "npd",
                   "fullName": "dashboard.npd",
                   "text"    : "Npd",
                   "state"   : {},
                   "stateStr": "{}"
                 },
                 "pop": {

                   "name"    : "pop",
                   "fullName": "dashboard.pop",
                   "text"    : "Pop",
                   "state"   : {},
                   "stateStr": "{}"
                 }                 
              };


  // If one uses a menu bar, the order of appearance is here
  var pagesOrder = ["chat", "attendance", "osa", "promo", "map", "reports", "cca", "npd", "pop"];


  //Atributes shared across each page component created from above dict
  var sharedProps = [{"name": "show-loading",
                      "value": "$ctrl.showLoading()"},
                     {"name": "hide-loading",
                      "value": "$ctrl.hideLoading()"}];

  angular.module("dashboard")
         .component("dashboard", {

           "templateUrl": global.templateDir + "/dashboard.html",
           "controller" : ["Session", "$state", "$rootScope",

             function (Session, $state, $rootScope) {

               $('body').removeClass('login-content sw-toggled');

               var stateName = $state.current.name.split(".")[1];

               var that = this;

               // Storing user data in scope
               this.user = Session.get();


               // Loading scree will be shown when its true
               this.isLoading = true;

               this.showLoading = function () {

                 this.isLoading = true;
               };

               this.hideLoading = function () {

                 this.isLoading = false;
               };

               this.pages = pages;
               this.pagesOrder = pagesOrder;

               // Update URL without refresh (maintaining state in URL)
               function updateUrl (pageName) {

                 $state.go("dashboard." + pageName,
                           {"state" : that.pages[pageName].stateStr},
                           {"notify": false});
               }

               // The current page that is being displayed
               this.activePage = this.pagesOrder[0];

               this.setActivePage = function (pageName) {

                 this.activePage = pageName;
               };

               // Update the state of the page, and also the URL
               this.updateState = function (pageName, state) {

                 state = state || {};

                 var tab = this.pages[pageName];

                 tab.state = state;
                 tab.stateStr = JSON.stringify(state);

                 this.setActivePage(pageName);
                 updateUrl(pageName);
               };

               // on navigation, update the state of current page
               function onNavigation (event, next, params) {

                 if (next.name !== "dashboard") {

                   that.updateState(next.name.split(".")[1],
                                    JSON.parse(params.state || "{}"));
                 }
               }

               var bindedEvents = [];

               function bindEvents () {

                 bindedEvents.push($rootScope.$on("$stateChangeStart", onNavigation));
               }

               function unbindEvents () {

                 angular.forEach(bindedEvents, function (unbindFunc) {

                   unbindFunc();
                 });
               }

               this.$onInit = bindEvents;

               this.$onDestroy = unbindEvents;

               if (!stateName) {

                 $state.go("dashboard." + this.pagesOrder[0]);
                 return;
               }

               // Update the state of current page when the component is rendered
               this.updateState(stateName,
                                JSON.parse($state.params.state || "{}"));
             }]
         });

         angular.module("dashboard")
                .config(["$locationProvider", "$stateProvider",
                  "$httpProvider", "$urlRouterProvider",

           function ($lp, $sp, $hp, $urp) {

             angular.forEach(pagesOrder, function (page) {

               var template = "<" + page + " ";

               angular.forEach(sharedProps, function (prop) {

                 template += prop.name + "=" + "\""+ prop.value +"\"";
               });

               template += "></" + page + ">";

               $sp.state("dashboard." + page, {

                 "url"     : page + "/",
                 "template": template,
                 "authRequired": true
               });
             });



             $urp.otherwise(pagesOrder[0]);
           }
         ]);
}(window.angular, window.BS));
