import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { adminRouter, contentRouter } from "./admin/router.js";
import { macroProviderStatus, resolveMacroLive } from "./macro/index.js";
import { getChart, getFinancialStatements, getQuotes, searchSymbols, timeframes } from "./market.js";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  content: contentRouter,
  admin: adminRouter,
  macro: router({
    /**
     * Canlı makro değerleri. Hangi serilerin çekileceğini kayıtlı içerik belirler,
     * istemci girdi vermez; böylece dışarıya rastgele istek yaptırılamaz.
     */
    live: publicProcedure.query(() => resolveMacroLive()),
    providers: publicProcedure.query(() => macroProviderStatus()),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  market: router({
    quotes: publicProcedure.input(z.object({ symbols: z.array(z.string().min(1)).min(1).max(64) })).query(({ input }) => getQuotes(input.symbols)),
    chart: publicProcedure.input(z.object({ symbol: z.string().min(1).max(24), timeframe: z.enum(["1G", "5G", "1A", "3A", "1Y"]) })).query(({ input }) => getChart(input.symbol, input.timeframe)),
    statements: publicProcedure.input(z.object({ symbol: z.string().min(1).max(24), statement: z.enum(["income", "balance", "cashflow"]) })).query(({ input }) => getFinancialStatements(input.symbol, input.statement)),
    search: publicProcedure.input(z.object({ query: z.string().min(1).max(40), types: z.array(z.string().min(1).max(24)).max(12).optional() })).query(({ input }) => searchSymbols(input.query, input.types ?? [])),
    metadata: publicProcedure.query(() => ({ provider: "Yahoo Finance", cacheSeconds: 45, timeframes })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
