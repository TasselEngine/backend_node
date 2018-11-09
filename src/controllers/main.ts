import { ROUTER } from "./base";
import { Controller, Route, Method, FromBody } from "@bonbons/core";
import { AuthService } from "../services/singleton/auth";
import { IIdentity } from "../contracts/identity";
import { LoginForm } from "../models/form/login";

@Controller("app")
export class MainController extends ROUTER {

  constructor(private auth: AuthService, private identity: IIdentity) {
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
  public Login(@FromBody() data: LoginForm) {
    const uid = fakeLogin(data.account, data.password);
    const token = this.auth.authorize(data.account, uid, 7);
    return this.toJSON({
      code: 0,
      message: "success",
      data: token
    });
  }

  @Method("GET")
  @Route("/demo?{id}&{name}")
  public GetDemo(id: number, name: string) {
    const { uid, account } = this.identity;
    return this.toJSON({
      code: 0,
      message: "success",
      data: {
        display: { id, name },
        logined: {
          id: uid,
          account
        }
      }
    });
  }

}

function fakeLogin(account: string, password: string) {
  return "fake_uid";
}