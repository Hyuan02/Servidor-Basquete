var express = require('express');
var app = express();
var ejs = require('ejs');

const mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = "mongodb://admin:digitalshot2018@ds035816.mlab.com:35816/digitalshot";
var registroPonto = false;
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.set('view engine', 'ejs');

app.use(express.static("public"));


app.get('/', function (req, res) {
  if (registroPonto) {
    res.render("cadastro_pontuacao");
  }
  else {
    MongoClient.connect(url, (er, client) => {
      if (!er) {
        console.log(client.db("digitalshot"));
        let bc = client.db("digitalshot");
        let pontuacaoR = bc.collection('pontuacaoRegistrada');
        pontuacaoR.find({},{ sort: { id: 1 }, }, function (err, data) {
          if (!err) {
            console.log(data[0]);
            res.render('teste_html', { listaBasquete: data });
          }
          else {
            res.send({ msg: "nao deu certo" });
          }
        });
      }



    });

  }


});



app.post('/pontuacaoTemporaria', function (req, res) {
  MongoClient.connect(url, (er, client) => {
    let bc = client.db("digitalshot");
    let pontuacaoR = bc.collection('pontuacaoTemporaria');
    pontuacaoR.insert({ _pontuacao: req.body.points}).then(function () {
      console.log("Registrado!");
      registroPonto = true;
      res.redirect('/');
      setTimeout(function () {
        console.log("mudou");
        registroPonto = false;
      }, 100000)
    });
  });
});

app.get('/pontuacaoTemporaria', function (req, res) {
  MongoClient.connect(url, (er, client) => {
    let bc = client.db("digitalshot");
    let pontuacaoR = bc.collection('pontuacaoTemporaria');
    pontuacaoR.insert({ _pontuacao: 9 }).then(function () {
      console.log("Registrado!");
      registroPonto = true;
      res.redirect('/');
      setTimeout(function () {
        console.log("mudou");
        registroPonto = false;
      }, 100000)
    });
  });
});

app.post('/pontuacaoBasquete', function (req, res) {
  let nomePontuador = req.body.nome;
  MongoClient.connect(url, (er, client) => {
    let bc = client.db("digitalshot");
    let basquete = bc.collection('pontuacaoRegistrada');
    let pontoTemporario = bc.collection('pontuacaoTemporaria');
    pontoTemporario.findOne({}, { sort: { id: 1 }, }, function (err, data) {
      if (!err) {
        let pontuacao = parseInt(data._pontuacao);
        basquete.insert({ _nome: nomePontuador, _pontuacao: pontuacao }).then(function () {
          pontoTemporario.drop();
          registroPonto = false;
          res.redirect('/');
        });
      }
    });
  })
});


app.listen(process.env.PORT || 4000, function () {
  console.log('Example app listening on port 4000!');
});
