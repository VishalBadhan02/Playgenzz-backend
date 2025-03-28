const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
// const { verifyJWT } = require('../services/JWT');
const upload = require('../services/multer');


// {
//     router.get("/getProfile/:id?", UserController.getProfile);
//     router.get("/getcountry", UserController.getcountry);
//     router.get("/getstate/:country", UserController.getstate);
//     router.get("/getcity/:state", UserController.getcity);
//     router.get("/getFriend", UserController.getFriends)
//     router.get("/search", UserController.searchFriends)
//     router.get("/getInfo/:id", UserController.getTournamentInfo)
//     router.get("/userFriends", UserController.getUserFriends)
//     router.get("/playingOnes", UserController.getPlayingFriends)
//     router.get("/getProduct", UserController.getProduct)
//     router.get("/getPlayer/:type?", UserController.getPlayers)
//     router.get("/getChat/:id", UserController.getChat)
//     router.get("/getRecievedMessages", UserController.getRecivedMessage)
//     router.get("/searchFriend/:search", UserController.searching)
// }

{
    router.post("/registerUser", UserController.registerUser)
    // router.post("/friendRequest", UserController.getFriend)
    // router.post("/addPlayer", UserController.addFriend)
    // router.post("/teamcontrol", UserController.setteam);
    // router.post("/postMessage", UserController.messageControl)
}

// {
//     router.delete("/deleteRequest", UserController.handleDelete)
// }

// {
//     router.put("/approvalRequest", UserController.handleApproval)
//     router.put("/updateProfile", upload.single('profilePicture'), UserController.UpdateProfile);

// }


module.exports = router;

