require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const verifyJWT = require('./middlewares/verifyJWT');

const app = express();
const PORT = process.env.PORT || 5000;

// Log incoming requests
// app.use((req, res, next) => {
//     console.log(`Incoming Request: ${req.method} ${req.url}`);
//     next();
// });

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

// Validate all services are defined
Object.entries(services).forEach(([key, value]) => {
    if (!value) {
        console.error(`Missing environment variable for ${key.toUpperCase()}_SERVICE_URL`);
        process.exit(1);
    }
});

// Log resolved services
console.log("Resolved Services:");
console.table(services);

// Log proxying
const proxyWithLogging = (target) => proxy(target, {
    proxyReqPathResolver: (req) => {
        const fullIncomingPath = req.originalUrl; // Logs full frontend request path (e.g., /auth/register)
        const finalProxiedPath = req.url; // Logs only the path that will be forwarded to the microservice

        console.log(`Incoming Request: ${req.method} ${fullIncomingPath}`);
        console.log(`Proxying request to: ${target}${finalProxiedPath}`);

        return fullIncomingPath;
    },
    proxyErrorHandler: (err, req, res, next) => {
        console.error(`Proxy error for ${req.method} ${req.originalUrl}:`, err);
        res.status(500).json({ error: "Proxy failed" });
    }
});


// Forward requests to microservices
app.use('/auth', proxyWithLogging(services.auth));
app.use('/user', proxyWithLogging(services.user));
app.use('/tournament', proxyWithLogging(services.tournament));
app.use('/product', proxyWithLogging(services.product));
app.use('/scoring', proxyWithLogging(services.scoring));
app.use('/team', proxyWithLogging(services.team));
app.use('/venue', proxyWithLogging(services.venue));
app.use('/notifications', proxyWithLogging(services.notification));

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.table(services);
});


// require('dotenv').config();
// const express = require('express');
// const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
// const verifyJWT = require('./middlewares/verifyJWT');

// const app = express();
// app.use(express.json());
// const PORT = process.env.PORT || 5000;

// // Log incoming requests
// // app.use((req, res, next) => {
// //     console.log(`Incoming Request: ${req.method} ${req.url}`);
// //     next();
// // });

// // Dynamically Load Microservice URLs
// const services = {
//     auth: process.env.AUTH_SERVICE_URL,
//     user: process.env.USER_SERVICE_URL,
//     tournament: process.env.TOURNAMENT_SERVICE_URL,
//     product: process.env.PRODUCT_SERVICE_URL,
//     scoring: process.env.SCORING_SERVICE_URL,
//     team: process.env.TEAM_SERVICE_URL,
//     venue: process.env.VENUE_SERVICE_URL,
//     notification: process.env.NOTIFICATION_SERVICE_URL
// };

// // Validate all services are defined
// Object.entries(services).forEach(([key, value]) => {
//     if (!value) {
//         console.error(`Missing environment variable for ${key.toUpperCase()}_SERVICE_URL`);
//         process.exit(1);
//     }
// });

// // Log resolved services
// console.log("Resolved Services:");
// console.table(services);

// // Function to create proxy middleware with logging
// const createProxyWithLogging = (target) => createProxyMiddleware({
//     target,
//     changeOrigin: true,
//     selfHandleResponse: true, // Necessary for intercepting responses
//     onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
//         console.log(target)

//         const statusCode = proxyRes.statusCode;

//         // Log the proxied request and response status
//         console.log(`Proxied request ${req.method} ${req.originalUrl} to: ${target}${req.url} with status code ${statusCode}`);

//         if (statusCode >= 500) {
//             // Handle 5xx errors from microservices
//             console.error(`Error response from microservice for ${req.method} ${req.originalUrl}: ${statusCode}`);
//             res.status(502).json({ error: "Bad Gateway: Microservice encountered an error" });
//             return;
//         }

//         // For other responses, forward them as-is
//         res.statusCode = statusCode;
//         return responseBuffer;
//     }),
//     onError: (err, req, res) => {
//         console.error(`Proxy error for ${req.method} ${req.originalUrl}:`, err);
//         res.status(500).json({ error: "Proxy failed" });
//     },
// });

// // Forward requests to microservices
// app.use('/auth', createProxyWithLogging(services.auth));
// app.use('/user', createProxyWithLogging(services.user));
// app.use('/tournament', createProxyWithLogging(services.tournament));
// app.use('/product', createProxyWithLogging(services.product));
// app.use('/scoring', createProxyWithLogging(services.scoring));
// app.use('/team', createProxyWithLogging(services.team));
// app.use('/venue', createProxyWithLogging(services.venue));
// app.use('/notifications', createProxyWithLogging(services.notification));

// // Start servers
// app.listen(PORT, () => {
//     console.log(`API Gateway running on port ${PORT}`);
//     console.table(services);
// });
