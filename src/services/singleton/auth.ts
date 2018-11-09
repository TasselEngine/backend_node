import C from "crypto-js";
import { Injectable } from "@bonbons/core";
import {
  IAuthorizeInfo,
  ErrorType,
  IAuthorizeData
} from "../../contracts/identity";

const PRIMARY_KEY = "h6fx86gb40kg6ch3";
const AES_KEY = C.enc.Utf8.parse(PRIMARY_KEY);
const INIT_VECTOR = C.enc.Utf8.parse(PRIMARY_KEY);

@Injectable()
export class AuthService {

  private readonly config: C.CipherOption = {
    iv: INIT_VECTOR,
    mode: C.mode.CBC,
    padding: C.pad.Pkcs7
  };

  private get currentStamp() {
    return new Date().getTime();
  }

  protected encrypt(info: IAuthorizeInfo) {
    return C.AES.encrypt(JSON.stringify(info), AES_KEY, this.config);
  }

  protected decrypt(token: string): [ErrorType, IAuthorizeInfo] {
    const str = C.enc.Utf8.stringify(C.AES.decrypt(token, AES_KEY, this.config));
    try {
      const auth = JSON.parse(str);
      if (("expires" in auth) && Number(auth.expires) < this.currentStamp) throw "EXPIRES";
      return ["VALID", auth];
    } catch (e) {
      const common = { account: "", uid: "" };
      if (e === "EXPIRES") return [e, { ...common, expires: 0 }];
      return ["INVALID_TOKEN", { ...common, expires: -1 }];
    }
  }

  public authorize(account: string, uid: string, days: number): string {
    return this.encrypt({
      account,
      uid,
      expires: this.createStamp(days)
    }).toString();
  }

  public validate(token?: string): IAuthorizeData {
    const [errorType, authorize] = this.decrypt(token || "");
    return {
      valid: errorType,
      ...authorize
    };
  }

  private createStamp(days = 7) {
    return new Date().getTime() + days * 24 * 3600000;
  }

}