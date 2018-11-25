var express = require('express');
var app = express();
var ejs = require('ejs');
const db = require('monk')('localhost/bancobasquete');
var registroPonto = false;
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.set('view engine', 'ejs');

app.use( express.static( "public" ) );


app.get('/', function (req, res) {
  if(registroPonto){
    res.render("cadastro_pontuacao");
  }
  else{
    let consultaBasquete = db.get('pontuacaoRegistrada');
    consultaBasquete.find({},{sort:{id:-1}}, function(err,data){
      if(!err){
        //console.log(data);
        res.render('teste_html',{listaBasquete:data});
      }
      else{
        res.send({msg:"nao deu certo"});
      }
    });
  }
  

});


app.get('/pontuacaoTemporaria', function(req,res){
    let basquete = db.get('pontuacaoTemporaria');
    basquete.insert({_pontuacao: Math.floor(Math.random() * 10)}).then(function(){
      console.log("Registrado!");
      registroPonto = true;
      res.redirect('/');      
      setTimeout(function(){
        console.log("mudou");
        registroPonto = false;
        basquete.drop();
      }, 100000)
    });
});

app.post('/pontuacaoBasquete', function(req,res){
    let nomePontuador = req.body.nome;
    let basquete = db.get('pontuacaoRegistrada');
    let pontoTemporario = db.get('pontuacaoTemporaria');
    pontoTemporario.findOne({}, {sort:{id:1},}, function(err, data){
      if(!err)
      basquete.insert({_nome: nomePontuador, _pontuacao: data._pontuacao}).then(function(){
        pontoTemporario.drop();
        registroPonto = false;
        res.redirect('/');
      });
    });
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
