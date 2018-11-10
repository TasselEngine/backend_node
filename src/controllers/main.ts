import { ROUTER } from "./base";
import { Controller, Route, Method, FromBody, Pipes } from "@bonbons/core";
import { AuthService } from "../services/singleton/auth";
import { IIdentity, Role } from "../contracts/identity";
import { LoginForm } from "../models/form/login";
import { LOGINED } from "../plugins/authorize";

@Controller("app")
@Pipes([LOGINED])
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
  @Pipes([])
  public async Login(@FromBody() data: LoginForm) {
    const infos = await fakeLogin(data.account, data.password);
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

async function fakeLogin(account: string, password: string) {
  return {
    uid: "fake_uid",
    account,
    role: Role.User
  };
}