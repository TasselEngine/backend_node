import { Injectable } from "@bonbons/core";
import {
  IIdentityDescriptor,
  IIdentity,
  IAuthorizeData
} from "../../contracts/identity";

const defaultLogin: IIdentityDescriptor = {
  logined: false,
  account: "",
  uid: ""
};

@Injectable()
export class Identity implements IIdentity {

  private $init = false;

  private $authorize: IIdentityDescriptor = { ...defaultLogin };

  public get logined() { return this.$authorize.logined; }
  public get account() { return this.$authorize.account; }
  public get uid() { return this.$authorize.uid; }

  public init({ account, uid, valid }: IAuthorizeData): void {
    if (this.$init) return;
    this.$authorize.logined = valid === "VALID";
    this.$authorize.uid = uid;
    this.$authorize.account = account;
  }

  public dispose() {
    this.$init = false;
    this.$authorize = { ...defaultLogin };
  }

}
