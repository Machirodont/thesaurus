let http=require("http");
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';
let server=http.Server();

server.listen(1337,"127.0.0.1");

server.on("request", function(req,res){
    res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    let data="";

    req.on('data', (chunk) => {
        data+=chunk;
    });

    req.on("end",()=> {
        let jsonData=JSON.parse(data);

        MongoClient.connect(url, function(err, client) {

            let db=client.db('thesaurus');
            let collection = db.collection('cells');

            if(jsonData.command=="write") {
                collection.remove({});
                collection.insertMany(jsonData.dataTable,
                    function (err, result) {
                        res.end('{"ok":"ok"}');
                    }
                );
            }

            if(jsonData.command=="load") {
                collection.find().toArray(function(err, docs){
                    res.end(JSON.stringify(docs));
                });
            }
            client.close();
        });
    })
});