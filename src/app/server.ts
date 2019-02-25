import app from "./app";
import { config } from "./config";

const server = app.listen(config.port).on("error", err => {
    console.error(err);
});

console.log("Application started. Listening on port:" + config.port);

export default server;