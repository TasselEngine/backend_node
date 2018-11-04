import { ROUTER } from "./base";
import { Controller, Route, Method } from "@bonbons/core";
import { AuthService } from "../services/singleton/auth";
import { Identity } from "../services/scoped/identity";

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
    });
  }

  @Method("POST")
  @Route("/login")
  public Login() {
    const token = this.auth.authorize("admin", "10000", 7);
    return this.toJSON({
      code: 0,
      message: "success",
      data: token
    });
  }

  @Method("GET")
  @Route("/demo?{id}&{name}")
  public GetDemo(id: number, name: string) {
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
    });
  }

}