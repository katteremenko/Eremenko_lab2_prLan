var express = require("express");
var path = require("path");
var fs = require("fs");
var viewPath = path.join(__dirname, "views");
var ejsMate = require("ejs-mate");
var asyncFunc = require("./asyncFunc");
var layouts = require("express-ejs-layouts");
var app = express();

app.set("view engine", "ejs");
app.set("views", viewPath);
app.set("layout", "layout.ejs");
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(layouts);

app.listen(5000, () => {
    console.log("Сервер ожидает подключения...");
});

app.post("/delete", (req, res) => {
  try {
    let dir = path.join(__dirname, req.body.path);
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    res.status(200).json({message: "Удалено"});
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Ошибка при удаления' });
    }
});

app.get("/download/*", (req, res) => {
  try {
    let dir = path.join(__dirname, `${req.url.slice(10)}`);
    res.download(dir);
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Ошибка при скачивании' });
    }    
});

app.get("/", (req, res) => {
  try {
    res.redirect("/local/");
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Ошибка перехода в папку' });
    }      
});

app.get("/local/*", asyncFunc(async (req, res) => {
  try {
    let dir;
        if (req.url.slice(6) == "") {
            dir = `${"./files/"}${req.url.slice(6)}`;
        } else {
            dir = `${"./files/"}${req.url.slice(6)}/`;
        }
        var names = await fs.promises.readdir(dir, (files) => {
          var list = [];
          files.forEach((file) => {
              list.push(file);
          });
        });
        var list = [];
        names.forEach((name) => {
            let type = "dir";
            if (name.indexOf(".") > -1) {
                type = "file";
            }
            list.push({
                name: name,
                type: type,
          });
        });
        res.render("layout", { list, dir });
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Ошибка перехода в папку' });
    }           
  })
);