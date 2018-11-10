import { Pipe, PipeOnInit, PipeMiddleware, PipeFactory } from "@bonbons/core";
import { AuthService } from "../services/singleton/auth";
import { IIdentity } from "../contracts/identity";

interface AuthOptions {
  roles: any[];
}

@Pipe()
class AuthPipe extends PipeMiddleware<AuthOptions> implements PipeOnInit {

  constructor(private identity: IIdentity) {
    super();
  }

  pipeOnInit(): void {

  }

  async process(): Promise<void> {

  }


}

export const Authorize = PipeFactory.generic(AuthPipe);