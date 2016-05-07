this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient){
  
  Meteor.subscribe("documents");
  Meteor.subscribe("editingUsers");
  
  Template.editor.helpers({
    docid: function(){
      console.log("doc id helper:");
      console.log(Documents.findOne());
      
      setupCurrentDocument();
      
      return Session.get("docid");
    },
    config: function() {
      return function(editor) {
        editor.setOption("LineNumbers", true);
        editor.setOption("theme", "cobalt");
        editor.setOption("mode", "html");
        editor.on("change", function(cm_editor, info) {
          $("#viewer_iframe").contents().find("html")
            .html(cm_editor.getValue());
            
          Meteor.call("addEditingUser")
        })
      }
    }
  });
  
  Template.editingUsers.helpers({
    users: function() {
      var doc, eusers,users;
      
      doc = Documents.findOne();
      
      if (!doc){
        return;
      }
      
      eusers = EditingUsers.findOne({ docid: doc._id});
      
      if (!eusers){
        return;
      }
      
      users = new Array();
      var i = 0;
      for (var user_id in eusers.users){
        users[i] = fixObjectKeys(eusers.users[user_id]);
        i++;
      }
      
      return users;
    }
  })
  
  Template.navbar.helpers({
    documents: function(){
      return Documents.find({});
    }
  })
  
  Template.docMeta.helpers({
    document: function(){
      return Documents.findOne({_id: Session.get("docid")});
    }
  })
  
  Template.editableText.helpers({
    userCanEdit: function(doc, Collection){
      doc = Documents.findOne({_id: Session.get("docid"), owner: Meteor.userId()});
      
      if (doc){
        return true;
      }
      else {
        return false;
      }
    }
  })
  
  Template.navbar.events({
    "click .js-add-doc": function(event){
      event.preventDefault();
      console.log("Add new doc");
      
      if (!Meteor.user()){
        alert("You need to login first!");
      }
      else{
        Meteor.call("addDoc", function(err, res){
          if(!err){
            console.log("event call back received id: " + res);
            Session.set("docid", res);
          }  
        });
      }
    },
    
    "click .js-load-doc": function(event){
      console.log(this);
      Session.set("docid", this._id);
    }
  })
  
  Template.docMeta.events({
    "click .js-tog-private": function(event){
      console.log(event.target.checked);
      
      var doc = {_id: Session.get("docid"), 
        isPrivate: event.target.checked };
      
      Meteor.call("updateDocPrivacy", doc);
    }
  })  
}

if (Meteor.isServer){
  Meteor.startup(function(){
    if (!Documents.findOne()){
      Documents.insert({title: "my new document"});
    }  
  });    
  
  Meteor.publish("documents", function(){
    return Documents.find({isPrivate: false});
  })    
  
  Meteor.publish("editingUsers", function(){
    return EditingUsers.find();
  })
}

Meteor.methods({
  addDoc: function(){
    var doc;

    if (!this.userId){
      return;
    }
    else{
      doc = {owner: this.userId, 
        createdOn: new Date(),
        title:"my new doc"};

      var id = Documents.insert(doc);
      
      console.log("addDoc method: got an id " + id);
      
      return id;
    }
  },
  
  updateDocPrivacy: function(doc){
    console.log("updateDocPrivacy");
    console.log(doc);
    
    var realDoc = Documents.findOne({_id: doc._id, owner: this.userId});
    if (realDoc){
      realDoc.isPrivate = doc.isPrivate;
      Documents.update({_id: doc._id}, realDoc);
    }
  },
  
  addEditingUser: function(){
    
    var doc, user, eusers;
    
    doc = Documents.findOne();
    
    if (!doc){
      return;
    }
    
    if (!this.userId){
      return;
    }
    
    user = Meteor.user().profile;
    
    eusers = EditingUsers.findOne({docid: doc._id});
    
    if (!eusers){
      eusers = {
        docid: doc._id,
        users: {}
      };
    }
    
    user.lastEdit = new Date();
    eusers.users[this.userId] = user;
    
    EditingUsers.upsert({_id: eusers._id}, eusers);    
  }
})

function setupCurrentDocument(){
  var doc;
  
  if (!Session.get("docid")){
    doc = Documents.findOne();
    if (doc){
      Session.set("docid", doc._id);
    }
  }
}

//Rename object by removing hyphens for spacebar templating
function fixObjectKeys(obj){
  var newObj = {};
    
  for (key in obj){
    var key2 = key.replace("-", "");
      
    newObj[key2] = obj[key];
  }
    
  return newObj;
}