import { ROUTER } from "./base";
import { Controller, Route, Method, Pipes } from "@bonbons/core";
import { AuthService } from "../services/auth";
import { Identity } from "../services/identity";

@Controller("app")
export class MainController extends ROUTER {

  constructor(private auth: AuthService, private identity: Identity) {
    super();
  }

  @Method("GET")
  @Route("/index")
  public Index() {
    return this.toJSON({
      code: 0,
      message: "hello world."
    })
  }

  @Method("POST")
  @Route("/login")
  public Login() {
    const token = this.auth.authorize("admin", "10000", 7);
    return this.toJSON({
      code: 0,
      message: "success",
      data: token
    })
  }

  @Method("GET")
  @Route("/demo?{id}&{name}")
  public GetDemo(id: number, name: string) {
    console.log(this.identity);
    return this.toJSON({
      code: 0,
      message: "success",
      data: {
        display: { id, name },
        logined: {
          id: this.identity.uid,
          account: this.identity.account
        }
      }
    })
  }

}