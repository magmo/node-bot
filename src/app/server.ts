import { Model } from "objection";
import knex from "../wallet/db/connection";
import app from "./app";
import { config } from "./config";

Model.knex(knex);

const server = app.listen().on("error", err => {
    console.error(err);
});

console.log("Application started.");

export default server;