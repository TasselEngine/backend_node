import { Pipe, PipeOnInit, PipeMiddleware, PipeFactory } from "@bonbons/core";
import { AuthService } from "../services/auth";
import { Identity } from "../services/identity";

interface AuthOptions {
  ignore: string[];
}

@Pipe()
export class AuthPipe extends PipeMiddleware<AuthOptions> implements PipeOnInit {

  constructor(private auth: AuthService, private identity: Identity) {
    super();
  }

  pipeOnInit(): void {
    console.log("auth pipe is init.");
  }

  async process(): Promise<void> {
    const { ignore } = this.params;
    const url = this.context.request.url;
    const has = (ignore || []).some(path => url.indexOf(path) >= 0);
    if (!has) {
      const token = this.context.request.headers["auth_token"];
      const authorize = this.auth.validate(token);
      if (authorize.valid === "INVALID_TOKEN") throw new Error("auth token is invalid");
      if (authorize.valid === "EXPIRES") throw new Error("auth token is expired");
      this.identity["$authorize"] = {
        account: authorize.account,
        uid: authorize.uid
      };
    }
  }


}

export const GlobalAUth = PipeFactory.generic(AuthPipe);