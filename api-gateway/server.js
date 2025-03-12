require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamically Load Microservice URLs
const services = {
    auth: process.env.AUTH_SERVICE_URL,
    user: process.env.USER_SERVICE_URL,
    tournament: process.env.TOURNAMENT_SERVICE_URL,
    product: process.env.PRODUCT_SERVICE_URL,
    scoring: process.env.SCORING_SERVICE_URL,
    team: process.env.TEAM_SERVICE_URL,
    venue: process.env.VENUE_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL
};

// Forward requests to microservices
app.use('/auth', proxy(services.auth));
app.use('/user', proxy(services.user));
app.use('/tournament', proxy(services.tournament));
app.use('/product', proxy(services.product));
app.use('/scoring', proxy(services.scoring));
app.use('/team', proxy(services.team));
app.use('/venue', proxy(services.venue));
app.use('/notifications', proxy(services.notification));

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Routing requests to:`);
    console.table(services);
});
