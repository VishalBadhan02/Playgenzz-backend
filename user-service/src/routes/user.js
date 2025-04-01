const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const LocationController = require('../controllers/LocationController');
const upload = require('../middlewares/multer');


{
    router.get("/getProfile/:id?", UserController.getProfile);
    router.get("/getcountry", LocationController.getcountry);
    router.get("/getstate/:country", LocationController.getstate);
    router.get("/getcity/:state", LocationController.getcity);
    router.get("/searching", UserController.searchUsers)
    // router.get("/getInfo/:id", UserController.getTournamentInfo)
    // router.get("/userFriends", UserController.getUserFriends)
    // router.get("/playingOnes", UserController.getPlayingFriends)
    // router.get("/getPlayer/:type?", UserController.getPlayers)
    // router.get("/getChat/:id", UserController.getChat)
    // router.get("/getRecievedMessages", UserController.getRecivedMessage)
    // router.get("/searchFriend/:search", UserController.searching)
}

{
    // router.post("/registerUser", UserController.registerUser)
    router.post("/friendRequest", UserController.handleRequest)
    // router.post("/addPlayer", UserController.addFriend)
    // router.post("/teamcontrol", UserController.setteam);
    // router.post("/postMessage", UserController.messageControl)
}

// {
//     router.delete("/deleteRequest", UserController.handleDelete)
// }

{
    //     router.put("/approvalRequest", UserController.handleApproval)
    router.put("/updateProfile", upload.single('profilePicture'), UserController.UpdateProfile);

}


module.exports = router;

