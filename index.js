const express = require('express');
const app = express();
const connect = require('./connection/db_connect');
const connection = connect.con;
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit:"100mb"}));
app.use(bodyParser.json())
const loginController = require('./auth/Controller');
const StudentController = require('./student/Controller');
app.use(express.static(process.cwd() + '/public'));
const { Server, Socket } = require('socket.io');
//const sharp = require('sharp');
const fs = require('fs');

//socket programming
const cors = require("cors");
app.use(cors());

const server = require('http').createServer(app);
const io = new Server(server, {
  cors:{
    origin:"*",
    methods:["GET", "POST"]
  },
})

app.get('/batchapi/socket.io/socket.io.js', (req, res) => {
    //res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
    res.send(server);
});

io.on("connection", (Socket)=>{
  console.log("conncet",Socket.id);
  Socket.on("join_group",(data)=>{
    console.log('hiello',data)
    Socket.join(data);
    
  })

  Socket.on("send_message",(data)=>{
    console.log('gg',data) 
    //Socket.join(data);
    Socket.to(data.group_id).emit("receive_message",data);
    
  })

  Socket.on("disconnect", (Socket)=>{
    console.log("disconncet")
  })
  
  
});



    const multer = require('multer');
    //! Use of Multer
    var path = require('path');
    var storage = multer.diskStorage({
      destination: (req, file, callBack) => {
          callBack(null, '../public_html/batchmates/images/before_resize')     // './public/images/' directory name where save the file
          console.log('he',file)
      },
      filename: (req, file, callBack) => {
        console.log('le',file)
          callBack(null, file.originalname)
      }
    })
    
    var upload = multer({
      storage: storage
    });
    
    // app.post('/batchapi/file-upload',upload.single('image'),(req,res)=>{
    //   res.setHeader('Content-Type', 'multipart/form-data');
    //   console.log(JSON.stringify(req.body))
    //   res.send(JSON.stringify({
    //         message: "success"
    //       }))
      
    // });
    
    // app.post('/batchapi/file-upload', upload.single('image'),async (req, res) => {
    //   res.setHeader('Content-Type', 'multipart/form-data');
    //   const { filename: image } = req.file;
    //   console.log(JSON.stringify(req.file))
    //   await sharp(req.file.path)
    //    .jpeg({ quality: 30 })
    //    .toFile(
    //        path.resolve('../public_html/batchmates/images/',image)
    //    )
    //    fs.unlinkSync(req.file.path)
      
    //    res.send(JSON.stringify({
    //       message: "success"
    //     }))
    // });

    //post image upload
    //! Use of Multer
    // var storage_post = multer.diskStorage({
    //   destination: (req, file, callBack) => {
    //       callBack(null, '../public_html/batchmates/post_image/resize')     // './public/images/' directory name where save the file
    //       console.log('he',file)
    //   },
    //   filename: (req, file, callBack) => {
    //     console.log('le',file)
    //       callBack(null, file.originalname)
    //   }
    // })
    
    // var upload_post = multer({
    //   storage: storage_post
    // });
    
    //old
    
    // app.post('/batchapi/post-image-upload',upload_post.single('image'),(req,res)=>{
    //   res.setHeader('Content-Type', 'multipart/form-data');
    //   console.log(JSON.stringify(req.body))
    //   res.send(JSON.stringify({
    //         message: "success"
    //       }))
      
    // });
    
    //new
    
    // app.post('/batchapi/post-image-upload', upload_post.single('image'),async (req, res) => {
    //   res.setHeader('Content-Type', 'multipart/form-data');
    //   const { filename: image } = req.file;
    //   console.log(JSON.stringify(req.file))
    //   await sharp(req.file.path)
    //    .jpeg({ quality: 60 })
    //    .toFile(
    //        path.resolve('../public_html/batchmates/post_image/',image)
    //    )
    //    fs.unlinkSync(req.file.path)
      
    //    res.send(JSON.stringify({
    //       message: "success"
    //     }))
    // });


connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


app.get('/batchapi/test', (req, res) =>{
    // var fs = require('fs');
    // var filePath = '../public_html/mybatch.club/post_image/banner3.jpg'; 
    // fs.unlinkSync(filePath);
    res.send(JSON.stringify({
            message: "success"
          }))
  

})




app.use('/batchapi/auth',loginController);
app.use('/batchapi/student',StudentController);


const port = process.env.PORT || 5000;
//http.listen(port, () => console.log(`Listening on port ${port}`));
server.listen(port,()=>console.log(`running server ${port}`));   