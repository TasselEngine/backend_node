import { Pipe, PipeOnInit, PipeMiddleware, PipeFactory } from "@bonbons/core";
import { IIdentity, Role } from "../contracts/identity";

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

  async process() {
    const { logined, role } = this.identity;
    const { roles } = this.params;
    if (!logined || roles.indexOf(role) < 0) {
      this.context.setStatus(401);
      this.context.response.body = "401 Unauthorized";
      return this.break();
    }
  }


}

export const Authorize = PipeFactory.generic(AuthPipe);
export const ADMIN = Authorize({ roles: [Role.Admin, Role.Core] });
export const LOGINED = Authorize({ roles: [Role.Admin, Role.Core, Role.User] });
