import { Deserialize } from "@bonbons/core";

export class LoginForm {

  @Deserialize("account")
  public readonly account = "";

  @Deserialize("psd")
  public readonly password = "";

}
