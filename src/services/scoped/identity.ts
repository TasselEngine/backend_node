import { Injectable } from "@bonbons/core";
import {
  IIdentityDescriptor,
  IIdentity,
  IAuthorizeData,
  Role
} from "../../contracts/identity";

const defaultLogin: IIdentityDescriptor = {
  logined: false,
  account: "",
  uid: "",
  role: Role.None
};

@Injectable()
export class Identity implements IIdentity {

  private $init = false;

  private $authorize: IIdentityDescriptor = { ...defaultLogin };

  public get logined() { return this.$authorize.logined; }
  public get account() { return this.$authorize.account; }
  public get role() { return this.$authorize.role; }
  public get uid() { return this.$authorize.uid; }

  public init({ account, uid, valid, role }: IAuthorizeData): void {
    if (this.$init) return;
    this.$authorize.logined = valid === "VALID";
    this.$authorize.uid = uid;
    this.$authorize.account = account;
    this.$authorize.role = role;
  }

  public dispose() {
    this.$init = false;
    this.$authorize = { ...defaultLogin };
  }

}
