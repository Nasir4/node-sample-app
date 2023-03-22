import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import mongoose, { Mongoose } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
const app = express()

app.set('view engine', 'ejs')


app.use(express.static(path.join(path.resolve(), 'public')))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())





const connection = async () =>{
    try{
        const {connection} = await mongoose.connect('mongodb+srv://nasirsalma:kgn2315984@cluster0.9dd44xn.mongodb.net/?retryWrites=true&w=majority')
        console.log('db successfully connected')
    }catch(e){
       console.log('something error on db',e)
    }
    
}

connection()


//schema

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})


const User = mongoose.model('User', userSchema)

const auth = async (req,res,next) =>{
     const {token} = req.cookies

     if(token){
        const decoded = jwt.verify(token,"somereandomtoken")
        req.user = await User.findById(decoded._id)
         
        next()
     }else{
        res.render('login')
     }
}

app.get('/',auth,(req,res) => {
    const {name} = req.user;
  
    res.render('logout',{name:name})
})

app.get('/register',(req,res) => {



    res.render('register')
})

app.post('/regester',async (req,res) => {
     const {name,email,password} = req.body;

     let user = await User.findOne({ email: email})

     if(user){
        return res.render('login')
     }else{

        const hashedPassword = await bcrypt.hash(password,12)
        user = await User.create({name,email,password:hashedPassword})

        let token = jwt.sign({_id: user._id},"somereandomtoken")

        res.cookie("token", token,{httpOnly: true,expires: new Date(Date.now()+60*1000)})

        res.redirect("/login")

     }

})

app.get('/login',(req,res) => {
    res.render('login')
})

app.post('/login',async (req,res) => {
    const {email,password} = req.body;

    let user = await User.findOne({ email: email})

    if(!user){
      return res.redirect('/register')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        return res.render('login',{message:"Incorrect Password"})
    }

    const token = jwt.sign({_id: user._id},"somereandomtoken")

    res.cookie('token', token,{httpOnly:true,expires: new Date(Date.now()+60*1000)})
   res.redirect('/')
})

app.get('/logout',(req,res)=>{
    res.cookie("token",null,{httpOnly:true,expires:new Date(Date.now())})
    res.redirect('/')
})

// const isAuth = (req,res,next) =>{
//     const {token} = req.cookies

//     if(token){
//       next()
//     }else{
//       res.render('login')
//     }
// }
// app.get('/',isAuth,(req,res)=>{
//     res.render('logout')
   
// })


// app.get('/home',isAuth,(req,res)=>{
//     res.render('home')
// })


// app.get('/login',(req,res)=>{
//     res.render('login')
// })





// app.post('/login', (req,res)=>{
//     res.cookie('token',"sometoken",{httpOnly:true, expires:new Date(Date.now()+60 * 1000)})
//    res.render('logout')
// }) 


// app.get('/logout',(req,res)=>{
//     res.cookie('token',null,{httpOnly:true, expires:new Date(Date.now())})
//     res.render('login')
// })





// app.post('/add',async (req,res)=>{
     

//     const msg = await Message.create(req.body)
//     console.log(msg)

//     res.send('ok ok')


// })


// app.post('/contact',async (req,res)=>{
      
//     await Message.create(req.body)


//     res.render("success")
// })

// app.get('/getusers',(req,res)=>{
//     res.json({
//         users
//     })
// })


app.listen(4000,()=>{
    console.log('application running on 4000')
})

