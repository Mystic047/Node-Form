const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const app = express();

// View engine setup
app.engine('handlebars', exphbs.engine());

//app.set('views engine', 'handlebars');
app.set('view engine', 'handlebars');

// Static folder
//app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')))

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('handlebars', exphbs.engine({defaultLayout: null}))
app.get('/', (req, res) => {
  res.render('contact');
});

app.post('/send', (req, res) => {
  const output = `
    <p>คุณได้รับข้อความใหม่</p>
    <h3>รายละเอียด</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>University: ${req.body.university}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>เนื้อหา</h3>
    <p>${req.body.message}</p>
  `;
  dotenv.config();
  // create reusable transporter object using the default SMTP transport
  //สร้าง object ที่ใช้ได้หลายครั้ง  โดยใช้พื้นฐานเป็น SMTP 
  let transporter =  nodemailer.createTransport({
    service : 'gmail', //ให้บริการที่เราจะส่งเป็น gmail 
    auth :{
        user: process.env.EMAIL, //ให้ไปเอาตัว user : pass ในไฟล์ env 
        pass: process.env.PASSWORD
    },
    tls:{
      rejectUnauthorized:false //ให้เราไม่โดน reject เนื่องจากเราส่งจาก localhost 
    }
});
  // ตั้งค่า email 
  let mailOptions = {
      from: '"Nodemailer Contact" <hungabeebee1@email.com>', //  หัวข้อ และ Email ผู้ส่ง
      to: req.body.email, // เป็นตัวที่ request จากตัว html หน้าหรอก Email ที่ให้ส่งไปตาม Email ที่กรอกลงไป
      subject: 'Node Contact Request', // หัวเรื่อง
      text: 'Hello world?', // ส่วนข้อความ
      html: output // ส่วนของ html 
  };



  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      };
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.render('contact', {msg:'Email has been sent'});
  });
  });

app.listen(3000, () => console.log('Server started...'));