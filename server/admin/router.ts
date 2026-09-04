/** Yönetim paneli tRPC uçları. Tüm yazma işlemleri Google oturumu ister. */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { siteContentDraftSchema } from "../../shared/siteContent.js";
import { publicProcedure, router } from "../_core/trpc.js";
import {
  ContentStoreError,
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

/** Depo hatalarını kullanıcıya gösterilebilir tRPC hatasına çevirir. */
async function guardStorage<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ContentStoreError) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: error.message });
    }
    throw error;
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
    .mutation(({ ctx, input }) =>
      guardStorage(() =>
        writeSiteContent(input.draft, {
          updatedBy: ctx.admin.email,
          expectedRevision: input.expectedRevision,
        })
      )
    ),

  files: router({
    list: adminProcedure.query(() => guardStorage(() => listReportFiles())),
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
