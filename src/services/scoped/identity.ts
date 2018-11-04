import { Injectable } from "@bonbons/core";

@Injectable()
export class Identity {

  private $authorize = { account: "", uid: "" };

  public get account() { return this.$authorize.account; }
  public get uid() { return this.$authorize.uid; }

}