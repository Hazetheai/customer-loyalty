import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import * as handlers from "./handlers/index";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(
    session(
      {
        sameSite: "none",
        secure: true,
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: SCOPES.split(","),

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        // handlers.registerWebhooks(
        //   shop,
        //   accessToken,
        //   "ORDERS_CREATE",
        //   "/webhooks/orders/create",
        //   ApiVersion.April20
        // );
        console.log('SCOPES.split(",")', SCOPES.split(","));

        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
        });
        // handlers.registerWebhooks(
        //   shop,
        //   accessToken,
        //   "PRODUCTS_CREATE",
        //   "/webhooks/products/create",
        //   ApiVersion.April20
        // );
        ctx.redirect("/");
      },
    })
  );
  const webhook = receiveWebhook({
    secret: SHOPIFY_API_SECRET,
  });
  // router.post("/webhooks/products/create", webhook, (ctx) => {
  //   console.log("received webhook: ", JSON.stringify(ctx, null, 2));
  // });
  server.use(
    graphQLProxy({
      version: ApiVersion.April20,
    })
  );
  // router.post("/webhooks/orders/create", webhook, (ctx) => {
  //   console.log(
  //     "received webhook: ",
  //     JSON.stringify(ctx.state.webhook, null, 2)
  //   );
  // });

  router.get("*", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
