;(function (angular, global) {
  "use strict";

  angular.module("cca")
         .component("cca", {
           "templateUrl": global.templateDir + "/cca.html",
           "controller" : ["$rootScope", "$state","$http",

             function ($rootScope, $state, $http) {

              var that = this;
              that.countries = null;
              that.projects = null;
              that.selectedCountry = null;
              that.selectedProject = null;
              that.dateRange = null;
              that.awaitingResponse = false;       

                $('#cca_table tfoot td').each( function () {
                    var title = $(this).text();
                    $(this).html( '<input type="text"  style="width:100%" placeholder="Search '+title+'" />' );
                } );               

               var cca_table = $('#cca_table').DataTable( {
                    "language": {
                      "emptyTable": "No data available in table"
                    },
                    dom: 'T<"clear">lfrtip',

                    "ajax":{
                      url: "/api/outlets/",
                      "dataSrc": function(json){
                        $.each(json.result, function(ind,entry){
                          entry['slno'] = ind+1;
                        });
                        return json.result;
                      }
                    }, 
                    "columns": [
                        { "data": "slno" },
                        { "data": "countrycode" },
                        { "data": "project" },
                        { "data": "moc" },
                        { "data": "day" },                        
                        { "data": "outlets_total" },
                        { "data": "outlets_done" },
                        { "data": "outlets_percent" }                  
                    ]
                } );

                $('.DTTT_container').children().not('.DTTT_button_xls').remove();
                $('.DTTT_button_xls').text('Export as Excel');
                $('.dataTables_filter').hide();
                $('#country').change(function () {
                  var v =$(this).val();
                  cca_table.columns(1).search(v).draw();
                } );

                $('#project').change(function () {
                  var v =$(this).val();
                  cca_table.columns(2).search(v).draw();
                } );

                cca_table.columns().every( function () {
                    var that = this;
             
                    $( 'input', this.footer() ).on( 'keyup change', function () {
                        if ( that.search() !== this.value ) {
                            that
                                .search( this.value )
                                .draw();
                        }
                    } );
                } );
              //Datatable end
              that.hideLoading();


              that.getCountriesData = function(){

                var response = null,
                  country = that.selectedCountry || null;

                return $http({
                  url: "/api/get_countries", 
                  method: "GET",
                  params: {}
                })
                  .then(function (resp) {

                      console.log(resp);
                      resp = resp.data;

                      if (resp.error) {

                        return;
                      }

                      that.countries = resp.result;

                    }).then(function () {

                      that.awaitingResponse = true;
                  });

              }


              that.getProjectsData = function(){

                var response = null,
                  country = that.selectedCountry || null;

                return $http({
                  url: "/api/get_projects", 
                  method: "GET",
                  params: {country: country}
                })
                  .then(function (resp) {

                      console.log(resp);
                      resp = resp.data;

                      if (resp.error) {

                        return;
                      }


                      that.projects = resp.result;
                    }).then(function () {

                      that.awaitingResponse = true;
                  });

              }

              that.getCountriesData();
              that.getProjectsData();


              that.onCountryChange = function(){

                that.selectedProject = null;
                that.getProjectsData();
              }





             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
