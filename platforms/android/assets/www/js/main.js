var DateTime;
var db = null;
var Notificationid = null;

$(document).on('pageinit','#MainPage',function(){

  $('#as1_btn').click(function(){
        $.mobile.navigate("#As1",{transition: "slide",info: "info goes here"});
        createDB();

    });


    $('#PickDate').click(function(){
       showDatePicker();
    });
    $('#PickTime').click(function(){
       showTimePicker();
    });
    $('#ListButton').click(function(){
        insertlist();


    });
     $('#deleteAllDb').click(function(){
        deleteDB();

    });


function insertlist(){

  if(($("#DatePrint").text() != "") && ($("#TimePrint").text() != "") ){
      if($("#Task_title").val() != ""){
        //window.alert(DateTime.year+" "+DateTime.month+" "+DateTime.day+" "+DateTime.hour+" "+DateTime.minute);
         // window.alert("la id de la notificacion será: "+Notificationid);
        cordova.plugins.notification.local.schedule({
            id: Notificationid,
            title: $("#Task_title").val(),
            text: 'A partir de las '+DateTime.hour+":"+DateTime.minute,
            smallIcon: 'res://icon_notification.png',
           trigger: { at: new Date(moment(DateTime.year+DateTime.month+DateTime.day+"T"+DateTime.hour+DateTime.minute).format('MMMM DD ,YYYY kk:mm:ss '))}
        });
        insertDB();
      }
      else{
          window.alert("You need to set a Title for your recordatory");
      }
    }
    else{
        window.alert("You need to set a Date and a Time for your recordatory");
    }

};

function showDatePicker(){

    var options = {
    type: 'date',         // 'date' or 'time', required
    date: new Date(),     // date or timestamp, default: current date

};

window.DateTimePicker.pick(options, function (date) {
    $("#DatePrint").empty();
    $("#DatePrint").append(moment(date).format('MMMM Do YYYY'));
    DateTime = {year:moment(date).format('YYYY'),month:moment(date).format('MM'), day:moment(date).format('DD')};
});

}

function showTimePicker(){
    var options = {
    type: 'time',         // 'date' or 'time', required
    date: new Date(),     // date or timestamp, default: current date

};

window.DateTimePicker.pick(options, function (date) {
    $("#TimePrint").empty();
    $("#TimePrint").append(moment(date).format('h:mm a'));
    DateTime.hour = moment(date).format('HH');
    DateTime.minute = moment(date).format('mm');

});

}

function createDB(){

     db = window.sqlitePlugin.openDatabase({name: 'appointments.db', location: 'default'});

     db.sqlBatch([
    'CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY,description, date)',
     ], function() {
    console.log('Created database OK');
            selectDB();
  }, function(error) {
    console.log('SQL batch ERROR: ' + error.message);
  });

}

function insertDB(){
    var title = $("#Task_title").val();
    console.log(title);
    var dateString = DateTime.year+DateTime.month+DateTime.day+"T"+DateTime.hour+DateTime.minute;
    console.log(dateString);
    db.sqlBatch([
        'CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY,description, date)',
        ['INSERT INTO appointments VALUES (?,?,?)', [null,title, dateString ]],
    ], function() {
        console.log('Values inserted correctly');
            DateTime = {};
            selectDB();
            $("#Task_title").val("");
            $("#DatePrint").empty();
            $("#TimePrint").empty();
            $("#datepicker").panel("close")
  }, function(error) {
    console.log('SQL batch ERROR: ' + error.message);
  });


}

function selectDB(){

     db.executeSql('SELECT MAX(id) as Maxid,count(*) AS mycount FROM appointments', [], function(rs) {
    console.log('Record count en select: ' + rs.rows.item(0).mycount);
       var counter = rs.rows.item(0).mycount;
        var higherID = rs.rows.item(0).Maxid;
        console.log("la id maxima es: "+higherID);
         $("#ListHandler").empty();
        for(i = 1; i <= higherID;i++){
           db.executeSql('SELECT id, description, date , count(*) AS mycount FROM appointments WHERE id='+i, [], function(res) {
                        if(res.rows.item(0).id != null){
                        $("#ListHandler").append(
                                                 '<li id="Elem'+res.rows.item(0).id+'" data-icon="delete" style="margin: 10px 10px 10px 10px; border:none;" class="ui-body-a">'+
                                                    '<div>'+
                                                        '<div class="ui-bar ui-bar-a" style="background-color:#D3D3D3; border:none;">'+
                                                            '<h3 style="float:left; text-align: left;">Event: '+res.rows.item(0).description+'</h3><h3 style="float:right; text-align:right;" ><a href="javascript:deleteElement('+res.rows.item(0).id+')"><i class="fa fa-times" style="color:red; font-size:18px;" aria-hidden="true"></i></a></h3>'+
                                                        '</div>'+
                                                        '<div class="ui-body ui-body-a">'+
                                                            '<h4>Date: '+moment(res.rows.item(0).date).format('MMMM Do YYYY, h:mm:ss a')+'</h4>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</li>');
                           console.log("ID --->"+(res.rows.item(0).id));
                       setNotificationID(res.rows.item(0).id);}
           },
                         function(error) {
                        console.log('SELECT SQL statement ERROR: ' + error.message);
                      });
        }

         if(rs.rows.item(0).mycount == 0){ Notificationid= 1;}


  }, function(error) {
    console.log('SELECT SQL statement ERROR: ' + error.message);
  });
}

function deleteElement(id){
    db.executeSql('DELETE FROM appointments WHERE id=?', [id], function(rs) {
    console.log('rowsDeleted: ' + rs.rowsAffected);
    var ElemToDelete = "Elem"+id;
        $('#'+ElemToDelete+'').remove();
   // window.alert("Se cancelara la notificación con id: "+(id));
    cordova.plugins.notification.local.cancel((id), function() {
    //window.alert("done");


});
  }, function(error) {
    console.log('Delete SQL statement ERROR: ' + error.message);
  });

}

function deleteDB(){
    db.executeSql('DELETE FROM appointments', [], function(rs) {
    console.log('rowsDeleted: ' + rs.rowsAffected);
    $("#ListHandler").empty();
    cordova.plugins.notification.local.cancelAll(function() {
    //window.alert("done,all cancel");
    }, this);
    Notificationid = 1;
  }, function(error) {
    console.log('Delete SQL statement ERROR: ' + error.message);
  });
}


function setNotificationID(id){
    Notificationid=id +1;
    console.log("notification id = "+Notificationid);

}



/*
function gotoPage3(){
    $.mobile.navigate("#page3", {info:"info goes here"});
}


function loadList(){
    var data = {"notifications":["08/12/2017 - 11:30","07/12/2017 - 12:30","22/12/2017 - 15:30"]}
    
    var myHtml ="";
    
    for (i=0;i<data.notifications.length;i++){
        myHtml += "<li>" + data.notifications[i] + "</li>";
    }
    
   id("myList").innerHTML = myHtml;
    
    
}

*/