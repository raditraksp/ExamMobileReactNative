const express = require('express')
const cors = require('cors')
const app = express()
const port = 2020
const conn = require('./config/db')
const bcrypt = require('bcryptjs')
const path = require('path')
const multer = require('multer')
const sharp = require('sharp')

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
   res.status(200).send('<h1>API IS RUNNING AT 2020</h1>')
})

// READ ALL FILMS
app.get('/films', (req, res) => {
   const sqlSelect = `
       SELECT * FROM films
   `
   conn.query(sqlSelect, (err, result) => {
       if(err) return res.status(500).send(err)
       
       res.status(200).send(result)
   })
})

// POST FILM
app.post('/films',  (req, res) => {
   try {
       // {name, description, stock, price} = req.body
       // {picture} = req.file
       const sqlInsert = `INSERT INTO films SET ?`
       const dataInsert = req.body

       // insert semua data text
       conn.query(sqlInsert, dataInsert, async (err, result) => {
           if (err) return res.status(500).send(err)

       })
   } catch (err) {
       res.status(500).send(err)
   }
})

// READ DETAIL FILM
app.get('/film/:id', (req, res) => {
   const sqlSelect = `SELECT * FROM films WHERE id = ${req.params.id}`
   conn.query(sqlSelect, (err, result) => {
       if(err) return res.status(500).send(err)
       
       res.status(200).send(result[0])
   })
})

// DELETE FILM
app.delete('/film/:id', (req, res) => {
   const sql = `DELETE FROM films WHERE id = ${req.params.id}`

   conn.query(sql, (err, result)=>{
       if(err) return res.send(err.sqlMessage)

       res.send({
           message: 'Film Deleted'
       })
   })
})

// EDIT FILM
app.patch('/film',  (req, res) => {
   const sql = `UPDATE films SET ? WHERE id = ?;`
   // data[0] = {name, email, password}
   // data[1] = 12
   const data = [req.body, req.user.id]

   conn.query(sql, data, (err, result) => {
       if(err) return res.status(500).send(err)

       res.status(201).send({message: 'Update berhasil'})
   })

})


// PICTURE
const avatarDirectory = path.join(__dirname, 'assets/pictures')

const upload = multer({
   // storage: storage,
   limits: {
       fileSize: 10000000 // Byte , default 1MB
   },
   fileFilter(req, file, cb) {
       if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // will be error if the extension name is not one of these
           return cb(new Error('Please upload image file (jpg, jpeg, or png)')) 
       }

       cb(undefined, true)
   }
})

// POST PICTURE
app.post('/picture', upload.single('picture'), async (req,res) => {

   try {
       const sql = `UPDATE films SET picture = ? WHERE id = ?`
       const fileName = `${req.body.title}-picture.png`
       const data = [fileName, req.body.id]
       const final = await sharp(req.file.buffer).resize(200).png().toFile(`${avatarDirectory}/${fileName}`)

       conn.query(sql, data, (err, result) => {
           if (err) return res.status(500).send(err)

           res.status(200).send({message: fileName})

       })
   } catch (error) {
       res.status(500).send(error.message)
   }
   
}, (err, req, res, next) => { // it should declare 4 parameters, so express know this is function for handling any uncaught error
   res.status(400).send(err.message)
})

// READ PICTURE
app.get('/picture/:fileName', (req, res) => {
    var options = { 
        root: avatarDirectory // Direktori foto disimpan
    };      
    
    var fileName = req.params.fileName;
    
    res.status(200).sendFile(fileName, options, function (err) {
        if (err) {
            return res.status(404).send({message: "Image not found"})
        } 

        console.log('Sent:', fileName);
    });
})

app.listen(port, () => console.log('API is Running at ' + port))