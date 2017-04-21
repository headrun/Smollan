;(function (angular, global) {
  "use strict";

  angular.module("pop")
         .component("pop", {
           "templateUrl": global.templateDir + "/pop.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

                $('#pop_table tfoot td').each( function () {
                    var title = $(this).text();
                    $(this).html( '<input type="text"  style="width:100%" placeholder="Search '+title+'" />' );
                } );               

               var pop_table = $('#pop_table').DataTable( {
                    "ajax":{
                      url: "/api/pop/",
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
                        { "data": "pop_target" },
                        { "data": "pop_available" },
                        { "data": "pop_percent" }                  
                    ]
                } );

		$('#country').keyup(function () {
			var v =$(this).val();
			pop_table.columns(1).search(v).draw();
		} );

		$('#project').keyup(function () {
			var v =$(this).val();
			pop_table.columns(2).search(v).draw();
		} );


                pop_table.columns().every( function () {
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

             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
