import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
export const router = Router();

router.post("/signup", (req, res) => {
    res.json({
        message: "Signup"
    });
});

router.post("/login", (req, res) => {
    res.json({
        message: "Login"
    });
});

router.get("/avatar", (req, res) => {
    res.json({
        message: "Logout"
    });
});

router.get("//elements", (req, res) => {                                                                                      
    res.json({
        message: "Logout"
    });
});


router.use("/user",userRouter);
router.use("/admin",adminRouter);
router.use("/space",spaceRouter);   