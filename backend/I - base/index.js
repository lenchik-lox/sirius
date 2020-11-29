const express = require('express');
const app = express();
const nanoid = require('nanoid');
const parser = require('body-parser');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./db/database.db',sqlite.OPEN_READWRITE, (e) => {
	if(e) console.error(e.message);
	else console.log('Successfully connected to database');
});
const domain = "localhost:3000";
const port = 3000;
app.use(parser.json());   
app.use(parser.urlencoded({extended: true}));
//------
//db struct:
//name 			type
//originalUrl	TEXT
//shortedUrl	TEXT
//viewCount		INTEGER
//key 			TEXT
//------

app.post('/shorten',(req,res) => {
	let urlToShort = req.body.urlToShorten;
	if (!urlToShort) {
		res.sendStatus(400);
		return;
	} 
	let key = nanoid.nanoid(9);
	let shorted = `http://${domain}/${key}`;
	db.run(`INSERT INTO urls(originalUrl,shortedUrl,key) VALUES('${urlToShort}','${shorted}','${key}')`);
	res.status(200).json({status:"Created",shortedUrl:shorted})
});

app.get('/:url',(req,res)=>{
	let key = req.url.replace('/','').replace('/',''); // /rere/ -> rere
	db.run(`UPDATE urls SET viewCount = viewCount + 1 WHERE key = "${key}"`,(err)=>{
		if(err) console.error(err);
	});
	db.serialize(()=>{
		db.get(`SELECT originalUrl as org FROM urls WHERE key = "${key}"`,(err,row)=>{
			if(err) console.error(err);
			if (!row) {
				res.sendStatus(404);
				return;
			}
			res.set('location',row.org);
			res.set('Content-Type','application/json');
			res.status(301).json({redirectTo:row.org});
			return;
		});
	});
	
});

app.get('/:url/views',(req,res)=> {
	let key = req.url.replace('/','').replace('/','').replace('views',''); // /rere/view -> rere
	db.serialize(()=>{
		db.get(`SELECT viewCount as vc FROM urls WHERE key = '${key}'`,(err,row)=>{
			if(err) console.error(err);
			if (!row) {
				res.sendStatus(404);
				return;
			}
			res.set('Content-Type','application/json');
			res.status(200).json({viewCount:row.vc});
			return;
		})
	})
})

app.listen(port,()=>{
	console.log(`Listening to ${domain}:${port}`);
});