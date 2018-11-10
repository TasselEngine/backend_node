import { ROUTER } from "./base";
import { Controller, Route, Method, FromBody } from "@bonbons/core";
import { AuthService } from "../services/singleton/auth";
import { IIdentity, Role } from "../contracts/identity";
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
    const infos = fakeLogin(data.account, data.password);
    const token = this.auth.authorize(7, infos);
    return this.toJSON({
      code: 0,
      message: "success",
      data: token
    });
  }

  @Method("GET")
  @Route("/demo?{id}&{name}")
  public GetDemo(id: number, name: string) {
    const { uid, account, role } = this.identity;
    return this.toJSON({
      code: 0,
      message: "success",
      data: {
        display: { id, name },
        logined: {
          id: uid,
          account,
          role
        }
      }
    });
  }

}

function fakeLogin(account: string, password: string) {
  return {
    uid: "fake_uid",
    account,
    role: Role.User
  };
}