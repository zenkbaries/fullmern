const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const quoteRoutes = express.Router();
const PORT = process.env.PORT || 4000;
// const dotenv = require("dotenv"); 
// dotenv.config();

let Quotes = require('./quotes.model');

app.use(express.static("/app/client/build"));

// app.use(express.static(path.join(__dirname, "../client/build")));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(
    process.env.DB_URI_REMOTE || process.env.DB_URI_LOCAL || 'mongodb://127.0.0.1:27017/quotes',
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    }
);

const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})


quoteRoutes.route('/').get(function(req, res) {
    Quotes.find(function(err, quotes) {
        if (err) {
            console.log(err);
        } else {
            res.json(quotes);
            console.log('done GET root');
        }
    });
});

quoteRoutes.route('/random').get((req,res)=> 
    {
        Quotes.aggregate(
            [ { $sample: { size: 1 } } ],
            (err, randomQuote) => {
                if (err) {
                    console.log('Error in Aggregate.');
                    console.log(err);
                } else {
                    console.log(randomQuote[0]._id);
                    res.json(randomQuote);
                    console.log('done sent random quote')
                }
            }
         );
    }
);

quoteRoutes.route('/random/:id').get((req,res)=> 
    {
        Quotes.aggregate(
            [ { $sample: { size: 1 } } ],
            (err, randomQuote) => {
                if (err) {
                    console.log('Error in Aggregate.');
                    console.log(err);
                } else {
                    console.log(randomQuote[0]._id);
                    res.json(randomQuote);
                    console.log('done sent random quote')
                }
            }
        );
    }
);

quoteRoutes.route('/:id').get(function(req,res) {
    let id = req.params.id;
    Quotes.findById(id, function(err,quote) {
        res.json(quote);
    });
});

quoteRoutes.route('/add').post(function(req,res) {
    let quote = new Quotes(req.body);
    quote.save()
         .then(quote => {
            res.status(200).json({'quote': 'quote added successfully'});
         })
         .catch(err => {
            res.status(400).send(err);
         });
});

/*React root*/
app.get("*", (req, res) => {
    // res.sendFile(path.join(__dirname + "../client/build/index.html"));
    res.sendFile("/app/client/build/index.html");

});

app.use('/', quoteRoutes);

app.listen (
    PORT,
    () => {
        console.log('Listen on port: ' + PORT)
    }
);