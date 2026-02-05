const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");


const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: "ashu@sql09"
});

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "/views"));

//HOME ROUTE
app.get("/", (req, res) => {
  try {
    let q = "SELECT count(*) FROM user";
    connection.query(q, (err, result) => {
      let users = result[0]["count(*)"];
      res.render("index.ejs", { users });
    })
  } catch (err) {
    console.log(err);
    res.send(err);
  }
})

//SHOW ROUTE
app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  try {
    connection.query(q, (err, users) => {
      res.render("showuser.ejs", { users });
    })
  } catch (err) {
    console.log(err);
    res.send(err);
  }
})

//EDIT ROUTE
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      let user = result[0];
      res.render("edit.ejs", { user });
    })

  } catch (err) {
    res.send(err);
  }

})

//UPDATE (in DB)

app.patch("/user/:id", (req, res) => {
  let { username, password } = req.body;
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      if (user.password == password) {
        let q2 = `UPDATE user SET username = '${username}' WHERE id = '${id}'`;
        try {
          connection.query(q2, (err, result) => {
            if(err) throw err;
          })

        } catch (err) {
          res.send(err);
        }

        res.redirect("/user");
      } else {
        res.send("Wrong password entered!");
      }
    })

  } catch (err) {
    res.send(err);
  }

})


//ADD USER(IN DB)

app.get("/user/add",(req,res) => {
  res.render("addUser.ejs");
})

app.post("/user",(req,res) => {
  let{username,email,password} = req.body;
  let id = uuidv4();

  let q = `INSERT INTO user (id,username,email,password) VALUES ?`;
  let userData = [[id,username,email,password]];

  try{
    connection.query(q,[userData],(err,result) => {
      if(err) throw err;
      res.redirect("/user");
    })
  } catch(err) {
    res.send("Some error occurred!");
  }
})

//TO DELETE (FROM DB)

app.get("/user/:id/delete",(req,res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
   try {
    connection.query(q, (err, result) => {
      let user = result[0];
      res.render("deleteUser.ejs", { user });
    })

  } catch (err) {
    res.send(err);
  }
})

app.delete("/user/:id",(req,res) => {
  let {email,password} = req.body;
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q,(err,result) => {
      if(err) throw err;
      let user = result[0];
      if((user.email == email) && (user.password == password)){
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        try {
          connection.query(q2,(err,result)=> {
            res.redirect("/user");
          })
        } catch (err) {
          console.log(err);
        }
      }else{
        res.send("wrong data entered");
      }
    })
    
  } catch (err) {
    console.log(err);
  }

})
app.listen(3000, () => {
  console.log("App is listening!");
})




// let q = "INSERT INTO user (id,username,email,password) VALUES ?";

// let getRandomUser = () => {
//   return [
//      faker.string.uuid(),
//      faker.internet.username(),
//      faker.internet.email(),
//      faker.internet.password()
//   ];
// };

// let data = [];

// for(let i = 1; i<=100; i++){
//   data.push(getRandomUser());
// }


// try{
//     connection.query(q,[data],(err,result) => {
//     if(err) throw err;
//     console.log(result);
// })} catch(err) {
//     console.log(err);
// }

// connection.end();


