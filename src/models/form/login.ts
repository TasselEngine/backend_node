import { Deserialize } from "@bonbons/utils";

export class LoginForm {

  @Deserialize("account")
  public readonly account = "";

  @Deserialize("psd")
  public readonly password = "";

}
