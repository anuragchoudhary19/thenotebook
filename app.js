const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const passportLocal = require("passport-local");


const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "I am ironman.",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-anurag:a7484843908@cluster0.pjvww.mongodb.net/notebookDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);

var Schema=mongoose.Schema;

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String
  });

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const noteSchema =new mongoose.Schema({
  noteId:String,
  noteTitle: String,
  noteContent: String
});

const Note =new mongoose.model("Note",noteSchema);

//get routes

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/main", function(req, res) {
  
  if (req.isAuthenticated()) {

    Note.find({noteId:req.user._id},function(err,result){
      if(err){
        console.log(err);
      }else{
        res.render("main",{
          Notes:result,
          userName:req.user.firstName     
                    
        });
      }
    });
    
  } else {
    res.redirect("/");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/signup", function(req, res) {

  User.register({
    firstName:req.body.fname,
    lastName:req.body.lname,
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/main");
      });
    }
  });

});

app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/main");
      });
    }
  });
});

app.post("/note", function(req,res){
  
  const note =new Note({     
     noteId:req.user._id,
     noteTitle:req.body.noteTitle,
     noteContent: req.body.noteContent
  });
  console.log(req.user);
  note.save();
  res.redirect("/main");
});

app.get("/Delete",function(req,res){
  
    Note.findByIdAndDelete(req.query.name,function(err,foundOne){
       if(err){
         console.log(err);
       }else{
          console.log("deleted");
          res.redirect("/main");
       }
     });

});



app.get("/Read/:id",function(req,res){
  console.log(req.params.id);
  Note.findById(req.params.id,function(err,docs){
    if(err){
      console.log(err);
    }else{  
          res.redirect("/viewNote")
    }
  });
});

app.get("/viewNote",function(req,res){
  res.render("viewNote",{
    userName:req.user.firstName
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.listen(port, function() {
  console.log("this port is working");

});
