const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const bodyParser = require("body-parser");

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const restaurants = require('./routes/restaurants');
const auth = require('./routes/auth');
const reservations=require('./routes/reservations');
const reviews=require('./routes/reviews');

const app = express()

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Prevent http param pollutions
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
    windowsMs: 10 * 60 * 1000, // 10 Mins
    max: 10000
});

app.use(limiter);

// Prevent XSS attacks
app.use(xss());

// Set security headers
app.use(helmet());

// Sanitize data
app.use(mongoSanitize());

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/v1/restaurants',restaurants);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);
app.use("/api/v1/reviews", reviews);


const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(
        'Server running in ',
        process.env.NODE_ENV,
        'on ' + process.env.HOST + " :" + PORT
    )
);

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "Reservation Booking",
        },
        server: [
            {
                url: process.env.HOST + ":" + PORT + "/api/v1",
            },
        ],
    },
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & Exit process
    server.close(() => process.exit(1));
});