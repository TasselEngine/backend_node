import { Pipe, PipeOnInit, PipeMiddleware, PipeFactory } from "@bonbons/core";
import { AuthService } from "../services/auth";

interface AuthOptions {
  ignore: string[];
}

@Pipe()
export class AuthPipe extends PipeMiddleware<AuthOptions> implements PipeOnInit {

  constructor(private auth: AuthService) {
    super();
  }

  pipeOnInit(): void {
    console.log("auth pipe is init.")
  }

  async process(next?: (() => Promise<any>) | undefined): Promise<void> {
    const { ignore } = this.params;
    const url = this.context.request.url;
    const has = (ignore || []).some(path => url.indexOf(path) >= 0);
    if (!has) {
      const token = this.context.request.headers["auth_token"];
      console.log(`auth -> [${token || "no-token"}] check is ${this.auth.validate(token)}`);
      if (!this.auth.validate(token)) {
        throw new Error("auth token check failed");
      }
    }
    await (next && next());
  }


}

export const GlobalAUth = PipeFactory.generic(AuthPipe);