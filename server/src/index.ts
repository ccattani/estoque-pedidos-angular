import express from "express";

import { router } from "./routes/index.js";

const app = express();

app.use(express.json());
app.use("/api", router);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
