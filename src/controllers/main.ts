import { ROUTER } from "./base";
import { Controller, Route, Method, Pipes } from "@bonbons/core";

@Controller("app")
export class MainController extends ROUTER {

  @Method("GET")
  @Route("/index")
  public Index() {
    return this.toJSON({
      code: 0,
      message: "hello world."
    })
  }

  @Method("GET")
  @Route("/demo?{id}&{name}")
  public GetDemo(id: number, name: string) {
    return this.toJSON({
      code: 0,
      message: "success",
      data: {
        id, name
      }
    })
  }

}