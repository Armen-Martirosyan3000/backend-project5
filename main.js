import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";


const app = express();
app.use(cors());//cors-ը թույլ է տալիս վերցնել http data(առանց cors-ի թույլ չի տրվում)
const db = new sqlite3.Database('data.db');
db.run("CREATE TABLE IF NOT EXISTS workers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT VARCHAR(255) NOT NULL, surname TEXT VARCHAR(255) NOT NULL, salary INTEGER NOT NULL)");
app.use(express.json());//express.json() is a middleware function-express.json()-ը middleware ծրագրային ֆունկցիա է Express-ում, որը վերլուծում(parse) է ուղարկված body-ն JSON ֆորմատով։ 


// CREATE
app.post("/workers", (req, res) => {//here request comes through app.post-այստեղ խնդանքը(request) գալիս է app.post-ի միջոցով
  let name = req.body["name"]
  let surname = req.body["surname"]
  let salary = req.body["salary"]
  db.run("INSERT INTO workers( name,surname, salary) VALUES(?,?,?)", name, surname, salary)
  res.send(JSON.stringify({ massage: "a new workers has been added" })); //We send a response to the client in JSON format-JSON ֆորմատով պատասխան ենք ուղարկում հաճախորդին`"a new workers has been added"                           
});


//Օverall READ
app.get("/workers", (req, res) => {
  db.all("SELECT * FROM workers", (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(200).json(rows);
  });
});


//Row READ
app.get("/workers/:id", (req, res) => {//:id is a parameter-:id նշանակում է որ այդտեղի արժեքը փոփոխական պարամետր է։Եվ այդ արժեքը մենք կարող ենք կարդանք հետևյալ ձևով՝req.params.id, :id-ն ընդունում է այն արժեքը որը որ մեզ փոխանցում է հաճախորդը՝fetch(`/workers/10`) տվյալ դեպքում փոխանցվել է 10, որից հետո սերվերը փնտրում է այն աշխատողին որն ունի այդ id-ն
  db.get(`SELECT * FROM workers where id = ?`, [req.params.id], (err, row) => {//db.get ֆունկցիայի առաջին պարամետրը՝SELECT * FROM workers where id = ? ասում է workers table-ի(data.db-ում ստեղծված) միջից գտի id որի արժեքը երկրորդ պարամետրով սահմանում է՝ [req.params.id] որը հավասար է տվյալ դեպքում 10՝ localhost :3000/workers/10 ու որպես 3-րդ պարամետր տալիս է՝ (err, row) callback ֆունկցիան, որտեղ err-ն error է նշանակում(որը տվյալ դեպքում ասեցին որ այս դեպքում դժվար հանդիպի), իսկ row-ն տվյալ դեպքում 10(localhost :3000/workers/10) արժեք ունեցող տողն է workers table-ում
    if (err) {
      res.status(400).json({ "error": err.message });//err.message is a defined message-err.message-ը սահմանված հաղորդագրություն է
      return;
    }
    res.status(200).json(row);//The row with the given id in the workers table is sent to the client as a response-workers table-ում տվյալ id-ով տողը պատասխանով(response) հետ է ուղարկվում հաճախորդին
  });
});


// UPDATE
app.put("/workers/:id", (req, res) => {
  db.run(`UPDATE workers set name = ?, surname = ?, salary = ? WHERE id = ?`,
    [req.body.name, req.body.surname, req.body.salary, req.params.id],//array
    function (err, result) {
      if (err) {
        res.status(400).json({ "error": res.message })//res.message-ը սահմանված հաղորդագրություն է "error"-ի դեպքում
        return;
      }
      res.status(200).json({ updatedID: this.changes });//this.changes is set to 0 or 1-this.changes-ը սահմանված է 0 կամ 1  
    });
});


// DELETE
app.delete("/workers/:id", (req, res) => {
  db.run(`DELETE FROM workers WHERE id = ?`,
    req.params.id,
    function (err, result) {
      if (err) {
        res.status(400).json({ "error": res.message })
        return;
      }
      res.status(200).json({ deletedID: this.changes })
    });
});
app.listen(3200);
