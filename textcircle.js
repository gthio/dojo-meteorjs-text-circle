this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient){
  
  Meteor.setInterval(function(){
    Session.set("current_date", new Date());
  }, 1000)
  
  Template.date_display.helpers({
    current_date: function(){
      return Session.get("current_date");
    }
  });
  
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