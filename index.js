//TWIT DOCUMENTATION: https://github.com/ttezel/twit

var Twit = require("twit");
require("dotenv").config();

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

//importando variaveis de ambiente do Twitter Developer Section
const feriasbot = new Twit({
    consumer_key: process.env.CONSUMER_KEY,  
    consumer_secret: process.env.CONSUMER_SECRET,    
    access_token: process.env.ACCESS_TOKEN,  
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
})

//função para o calculo do tempo ate as ferias (aqui é setada a data)
function calculaTempoRestante(dev=false){
    //Conferir sempre a data inserida (o mês começa no 0) YY/MM/DD
    let fimSemestre = new Date(2023, 6, 21)
    if (!dev) console.log("Data configurada para as férias: " + fimSemestre.toLocaleString())
    let atual = Date.now()
    let tempoRestante = Math.ceil((fimSemestre-atual)/86400000)
    if (!dev) console.log("TEMPO: " + tempoRestante + " dias")
    return tempoRestante
}

//função para fazer a postagem, caso nao se esteja de ferias
function postit() {
    let tempo = calculaTempoRestante()
    let formatado
    if (!deFerias){
        if (!tempo) {
            deFerias = true
            formatado = "E ca estamos denovo a celebrar 🥳\nAs férias que todos esperavam 😪\nEntão não irei mais me alongar 🫡\nPois logo logo elas acabam 🥺"
            feriasbot.post(
                'statuses/update', 
                {status: formatado},
                function(err, data, response) { 
                  if (err) {
                      console.log("ERRO: " + err);                    
                      return false;
                  }
                  console.log("Tweet postado com sucesso!\n");
                  console.log("Status atual das férias: ", deFerias);       
                }
            )
        } else if (tempo>0) {
            formatado = `Faltam ${tempo} dias para as férias da UFES 🏖`
            if (tempo == 1) formatado = `Falta ${tempo} dia para as férias da UFES 🥳`
            feriasbot.post(
                'statuses/update', 
                {status: formatado},
                function(err, data, response) { 
                  if (err) {
                      console.log("ERRO: " + err);      
                      console.log("Status: "+ formatado)              
                      return false;
                  }
                  console.log("Tweet postado com sucesso!:");       
                  console.log("Status atual das férias: ", deFerias);
                }
            )
        } else {
            formatado = `${tempo} dias restantes. O Bot precisa ser reconfigurado para as proximas ferias`
            deFerias = true
        }
        console.log(formatado)
    }
}

//função que fica em loop aguardando o horario da postagem
function horarioAgendado(horas, minutos){
    let agora = new Date
    let horaFormatada = agora.getUTCHours() - 3
    if (horaFormatada<0) horaFormatada+=24
    if (horaFormatada == horas){
        try{
            // postit()
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'Ufes BOT Ferias Report',
                text: `Tudo certo!`
              }, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            return;
        }catch(err){
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'Ufes BOT Ferias Report',
                text: `Erro encontrado no bot: ${err}`
              }, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    }
    
    
    calculaTempoRestante(dev=true)
    console.log(`${horaFormatada}:${agora.getUTCMinutes()}:${agora.getUTCSeconds()}`)
}

let deFerias = false
console.log("Iniciando o bot... Férias: " + deFerias)
calculaTempoRestante(false)
horarioAgendado(7,0)

//Essa request serve para testar se o bot esta com as credenciais em dia, sem ter que postar nada
feriasbot.get('search/tweets', { q: 'neymar', count: 1 }, function(err, data, response) {
    let tweet = data
    // console.log('MESSAGE: '+tweet.text)
    // console.log('USER: '+tweet.user.screen_name)
    // console.log('TWEET: '+tweet.id_str)
    // console.log('FAVS: '+tweet.favorite_count)
    // console.log('RT_FAVS: '+tweet.retweeted_status.favorite_count)
    // console.log('RT: '+tweet.retweet_count)
    // console.log(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}\n`)
    if (!data.errors) console.log("CREDENCIAIS AUTENTICADAS COM SUCESSO")
    else console.log("ERRO!! ATUALIZE AS CREDENCIAIS!")
    console.log(data)
}) 

// setInterval(()=>horarioAgendado(7,0), 20000);