import { Pipe, PipeOnInit, PipeMiddleware, PipeFactory } from "@bonbons/core";
import { AuthService } from "../services/singleton/auth";
import { IIdentity } from "../contracts/identity";

interface AuthenticateOptions {
  ignore: string[];
}

@Pipe()
class AuthenticatePipe extends PipeMiddleware<AuthenticateOptions> implements PipeOnInit {

  constructor(private auth: AuthService, private identity: IIdentity) {
    super();
  }

  pipeOnInit(): void {

  }

  async process(): Promise<void> {
    const { ignore } = this.params;
    const url = this.context.request.url;
    const token = this.context.request.headers["auth_token"];
    const shouldIgnore = (ignore || []).some(path => url.indexOf(path) >= 0);
    if (!shouldIgnore && token) {
      const authorize = this.auth.validate(token);
      if (authorize.valid === "INVALID_TOKEN") throw new Error("auth token is invalid");
      if (authorize.valid === "EXPIRES") throw new Error("auth token is expired");
      this.identity.init(authorize);
    }
  }


}

export const Authentication = PipeFactory.generic(AuthenticatePipe);