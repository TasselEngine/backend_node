import { Bonbons } from "@bonbons/core";
import { MainController } from "./controllers/main";

Bonbons.Create()
  .controller(MainController)
  .start(() => {
    console.log("server is running 3000.")
  });