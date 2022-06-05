const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app=express();
const helmet = require('helmet');
const passport = require('passport');
const {Strategy}=require('passport-google-oauth20')
require('dotenv').config()
const config={
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENT_SECRET
}
const PORT=3000;


const AUTH_OPTIONS= {
        callbackURL:'/auth/google/callback',
        clientID:config.CLIENT_ID,
        clientSecret:config.CLIENT_SECRET,
    }
function verifyCallback(accessToken,refreshToken,profile,done){
    console.log("Google Profile",profile);
    done(null,profile)

}

passport.use(new Strategy(AUTH_OPTIONS,verifyCallback))

app.use(helmet());
app.use(passport.initialize()); // before initlizing the passport we need to pass the stragey to passport

function checkloggedIn(req,res,next){
    const isUserAuthenticated=true;
    if(!isUserAuthenticated){
        res.status(401).json({error:'USer is not signed In'})
    }
    next();
}
app.get('/auth/google',
    passport.authenticate('google',{
        scope:['email']
    }))
app.get('/auth/google/callback',
    passport.authenticate('google',{
        failureRedirect:'/failure',
        successRedirect:'/',
        session:false,
    }),
    (req,res)=>{
        //successful authentication, Redirect home
        res.redirect('Google called us back');
    })
app.get('/auth/logout',(req,res)=>{})
app.get('/failure',(req,res)=>{
    res.status(400).send("Error Please Login again")
})

// checkloggedIn is the middleware that check that user is logged in or not if not it will show error, we use in secret endpoint because we only want to access this endpoint the user must be logged in. if we use this middleware in top in app.use(checkloggedIn) it will check before every endpoin that we don't want
app.get('/secret',checkloggedIn,(req,res)=>{
    return res.send("Your secret code is 7676")
})
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"public","index.html"))});
    
https.createServer({
    key:fs.readFileSync('key.pem'),
    cert:fs.readFileSync('cert.pem'),
},app).listen(PORT,()=>{
    console.log(`function is running on ${PORT}`)
})