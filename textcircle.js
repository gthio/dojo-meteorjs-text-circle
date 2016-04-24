this.Documents = new Mongo.Collection("documents");

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
        editor.on("change", function(cm_editor, info) {
          $("#viewer_iframe").contents().find("html")
            .html(cm_editor.getValue());
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