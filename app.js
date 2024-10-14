const express= require ('express');
const https = require('https');
const bodyParser=require('body-parser');
const app=express();
app.use(bodyParser.urlencoded({extended:true}));

app.listen(3000,()=>console.log("server is running on http://localhost:3000")
)
app.get('/',(req,res)=>
    {
        res.sendFile(__dirname + "/index.html");
 })
 app.post('/',(req,res)=>{
    const query=req.body.cityName;
    const apiKey='c0e88cc77d35b705fdaa6a3b467b383b';

    const url= 'https://api.openweathermap.org/data/2.5/weather?q='+ query +' &appid='+ apiKey +'&units=metric'
    https.get( url,(response)=>{
        console.log('Status Code:', response.statusCode);
response.on('data',(data)=>{
   
    const weatherData=JSON.parse(data);
    console.log(weatherData);

    if(weatherData.main){
    const temp = weatherData.main.temp;
    const description=weatherData.weather[0].description;

 
    res.write('<h1>The temperature in ' + query + ' is ' + temp + ' degree Celsius</h1>');
    res.write('<p>The  weather description  is ' + description + " </p>" );
    res.send();}
    else{
res.write('<p> Could not retrieve weather data for ' + query + " </p>");
res.send();
    }

});
 })
});