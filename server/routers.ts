import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getChart, getFinancialStatements, getMarketCorrelation, getQuotes, searchSymbols, timeframes } from "./market";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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
    quotes: publicProcedure.input(z.object({ symbols: z.array(z.string().min(1)).min(1).max(36) })).query(({ input }) => getQuotes(input.symbols)),
    chart: publicProcedure.input(z.object({ symbol: z.string().min(1).max(24), timeframe: z.enum(["1G", "5G", "1A", "3A", "1Y"]) })).query(({ input }) => getChart(input.symbol, input.timeframe)),
    correlation: publicProcedure.input(z.object({ window: z.union([z.literal(20), z.literal(60)]) })).query(({ input }) => getMarketCorrelation(input.window)),
    statements: publicProcedure.input(z.object({ symbol: z.string().min(1).max(24), statement: z.enum(["income", "balance", "cashflow"]) })).query(({ input }) => getFinancialStatements(input.symbol, input.statement)),
    search: publicProcedure.input(z.object({ query: z.string().min(2).max(40) })).query(({ input }) => searchSymbols(input.query)),
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
