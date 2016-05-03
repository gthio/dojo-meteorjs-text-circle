this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient){
  
  Template.editor.helpers({
    docid: function(){
      console.log("doc id helper:");
      console.log(Documents.findOne());
      
      var doc = Documents.findOne();      
      if (doc){
        return doc._id;
      }
      else{
        return undefined;
      }
    },
    config: function() {
      return function(editor) {
        editor.setOption("LineNumbers", true);
        editor.setOption("mode", "html");
        editor.on("change", function(cm_editor, info) {
          $("#viewer_iframe").contents().find("html")
            .html(cm_editor.getValue());
            
          Meteor.call("addEditingUser")
        })
      }
    }
  });
}

if (Meteor.isServer){
  Meteor.startup(function(){
    if (!Documents.findOne()){
      Documents.insert({title: "my new document"});
    }  
  });    
}

Meteor.methods({
  addEditingUser: function(){
    EditingUsers.insert({user: "Test123"});
  }
})
