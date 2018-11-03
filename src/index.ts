import path from "path";
import {
  Bonbons,
  TPL_RENDER_OPTIONS,
  ENV_MODE,
  DEPLOY_MODE,
  ERROR_RENDER_OPRIONS
} from "@bonbons/core";
import { MainController } from "./controllers/main";
import { AuthService } from "./services/auth";
import { GlobalAUth } from "./plugins/auth";
import { Identity } from "./services/identity";

Bonbons.Create()
  .scoped(Identity)
  .scoped(AuthService)
  .controller(MainController)
  .pipe(GlobalAUth({ ignore: ["/app/index", "/app/login"] }))
  .option(ENV_MODE, { mode: "development", trace: true })
  .option(DEPLOY_MODE, { port: 3000 })
  .option(TPL_RENDER_OPTIONS, { root: PATH("views") })
  .option(ERROR_RENDER_OPRIONS, { root: PATH("views/errors") })
  .start(() => {
    console.log("server is running 3000.")
  });

function PATH(p: string) {
  return path.resolve(__dirname, p)
}
