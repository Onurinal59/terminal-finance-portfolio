/** Yönetim paneli tRPC uçları. Tüm yazma işlemleri Google oturumu ister. */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { siteContentDraftSchema } from "../../shared/siteContent.js";
import { publicProcedure, router } from "../_core/trpc.js";
import {
  ContentStoreError,
  RevisionConflictError,
  deleteBlobByUrl,
  isStorageConfigured,
  listReportFiles,
  readSiteContent,
  writeSiteContent,
} from "./contentStore.js";
import { adminConfigProblems } from "./env.js";
import { readAdminSession } from "./session.js";

/** Oturumu doğrulayıp yöneticiyi bağlama ekleyen ara katman. */
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await readAdminSession(ctx.req);
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Yönetici oturumu bulunamadı" });
  }
  return next({ ctx: { ...ctx, admin: session } });
});

/**
 * İki gösterge aynı seriye bağlanamaz: bağlanırsa ikisi de aynı değeri gösterir
 * ve bu, panelde fark edilmesi zor sessiz bir hataya dönüşür.
 */
function assertUniqueMacroSeries(draft: { macro?: { indicators?: Array<{ id: string; source: string; symbol?: string }> } }) {
  const seen = new Map<string, string>();
  for (const item of draft.macro?.indicators ?? []) {
    if (item.source === "manual" || !item.symbol) continue;
    const key = `${item.source}:${item.symbol}`;
    const owner = seen.get(key);
    if (owner) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `"${owner}" ve "${item.id}" göstergeleri aynı seriye (${key}) bağlı; ikisi de aynı değeri gösterir. Her göstergeye kendi serisini verin.`,
      });
    }
    seen.set(key, item.id);
  }
}

/** Depo hatalarını kullanıcıya gösterilebilir tRPC hatasına çevirir. */
/**
 * Depo hatalarını tRPC koduna çevirir. Sürüm çakışması ayrı bir kodla dönüyor:
 * panel bunu yakalayıp depodaki hâlle kendi taslağını birleştiriyor ve
 * kullanıcıya hata göstermeden tekrar kaydediyor.
 */
function toTrpcError(error: unknown): unknown {
  if (error instanceof RevisionConflictError) {
    return new TRPCError({ code: "CONFLICT", message: error.message });
  }
  if (error instanceof ContentStoreError) {
    return new TRPCError({ code: "PRECONDITION_FAILED", message: error.message });
  }
  return error;
}

async function guardStorage<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw toTrpcError(error);
  }
}

export const adminRouter = router({
  /** Panelin açılışta çektiği durum bilgisi. */
  status: publicProcedure.query(async ({ ctx }) => {
    const session = await readAdminSession(ctx.req);
    const missingConfig = adminConfigProblems();
    return {
      session,
      missingConfig,
      storageReady: isStorageConfigured(),
    };
  }),

  /** Panelde düzenlenmek üzere kayıtlı içeriğin taze hâli. */
  content: adminProcedure.query(() => guardStorage(() => readSiteContent({ fresh: true }))),

  save: adminProcedure
    .input(
      z.object({
        draft: siteContentDraftSchema,
        expectedRevision: z.number().int().nonnegative().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      assertUniqueMacroSeries(input.draft);
      return guardStorage(() =>
        writeSiteContent(input.draft, {
          updatedBy: ctx.admin.email,
          expectedRevision: input.expectedRevision,
        })
      );
    }),

  files: router({
    list: adminProcedure
      .input(z.object({ prefix: z.string().max(64).optional() }).optional())
      .query(({ input }) => guardStorage(() => listReportFiles(input?.prefix ?? ""))),
    remove: adminProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(({ input }) => guardStorage(async () => {
        await deleteBlobByUrl(input.url);
        return { success: true } as const;
      })),
  }),
});

/** Siteyi besleyen herkese açık okuma ucu. */
export const contentRouter = router({
  get: publicProcedure.query(() => readSiteContent()),
});

/** Yalnızca testler için. */
export const __testing = { assertUniqueMacroSeries, toTrpcError };
