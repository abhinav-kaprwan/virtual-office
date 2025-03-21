import express from "express";
import {router} from "./routes/v1";
import client from "@repo/db/client";

const app = express();

app.use("/api/v1", router);

const PORT = 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})