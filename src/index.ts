import path from "path";
import {
  Bonbons,
  TPL_RENDER_OPTIONS,
  ENV_MODE,
  DEPLOY_MODE,
  ERROR_RENDER_OPRIONS
} from "@bonbons/core";
import { MainController } from "./controllers/main";
import { AuthService } from "./services/singleton/auth";
import { Authentication } from "./plugins/authentication";
import { IIdentity } from "./contracts/identity";
import { Identity } from "./services/scoped/identity";
import { init } from "./models/database";

Bonbons.Create()
  .scoped(IIdentity, Identity)
  .singleton(AuthService)
  .controller(MainController)
  .pipe(Authentication({ ignore: ["/app/login"] }))
  .option(ENV_MODE, { mode: "development", trace: true })
  .option(DEPLOY_MODE, { port: 3000 })
  .option(TPL_RENDER_OPTIONS, { root: PATH("views") })
  .option(ERROR_RENDER_OPRIONS, { root: PATH("views/errors") })
  .start(async (configs) => {
    await init();
    console.log("server is running 3000.");
  });

function PATH(p: string) {
  return path.resolve(__dirname, p);
}
