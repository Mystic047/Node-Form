const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const multer = require('multer');
const app = express();

// View engine setup
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('handlebars', exphbs.engine({defaultLayout: null}))

app.get('/', (req, res) => {
  res.render('contact');
});

dotenv.config();

// create reusable transporter object using the default SMTP transport
let transporter =  nodemailer.createTransport({
  service : 'gmail', 
  auth :{
    user: process.env.EMAIL, 
    pass: process.env.PASSWORD
  },
  tls:{
    rejectUnauthorized:false 
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post('/send', upload.single('attachment'), (req, res) => {
  const output = `
    <p>You have a new message</p>
    <h3>Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>University: ${req.body.university}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  let mailOptions = {
    from: '"Nodemailer Contact" <youremail@email.com>', 
    to: req.body.email, 
    subject: 'Node Contact Request', 
    html: output,
    attachments: [
      {
        filename: req.file.originalname,
        path: req.file.path,
      },
    ],
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);   
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    res.render('contact', {msg:'Email has been sent'});
  });
});

app.listen(3000, () => console.log('Server started...'));
