import { Router, type IRouter } from "express";
import { db, payloadsTable } from "@workspace/db";
import { eq, ilike, or, and, sql } from "drizzle-orm";

const router: IRouter = Router();

const VALID_CATEGORIES = [
  "XSS", "SQLi", "CSRF", "LFI", "SSRF", "XXE", "RCE", "IDOR",
  "Open Redirect", "SSTI", "Path Traversal", "Command Injection"
] as const;

const VALID_SEVERITIES = ["Critical", "High", "Medium", "Low", "Info"] as const;

router.get("/payloads", async (req, res): Promise<void> => {
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const severity = req.query.severity as string | undefined;
  const bypass = req.query.bypass as string | undefined;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10)));
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];

  if (category && VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    conditions.push(eq(payloadsTable.category, category as (typeof VALID_CATEGORIES)[number]));
  }
  if (severity && VALID_SEVERITIES.includes(severity as (typeof VALID_SEVERITIES)[number])) {
    conditions.push(eq(payloadsTable.severity, severity as (typeof VALID_SEVERITIES)[number]));
  }
  if (bypass === "true") {
    conditions.push(eq(payloadsTable.isBypass, true));
  }

  const searchConditions = search
    ? or(
        ilike(payloadsTable.title, `%${search}%`),
        ilike(payloadsTable.payload, `%${search}%`),
        ilike(payloadsTable.description, `%${search}%`),
        ilike(payloadsTable.subcategory, `%${search}%`)
      )
    : undefined;

  const whereClause = conditions.length > 0
    ? (searchConditions ? and(...conditions, searchConditions) : and(...conditions))
    : searchConditions;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(payloadsTable)
    .where(whereClause);

  const payloads = await db
    .select()
    .from(payloadsTable)
    .where(whereClause)
    .orderBy(payloadsTable.id)
    .limit(limit)
    .offset(offset);

  res.json({
    payloads,
    meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
  });
});

router.get("/payloads/categories", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      category: payloadsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(payloadsTable)
    .groupBy(payloadsTable.category);

  res.json({ categories: rows });
});

router.get("/payloads/:id", async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [payload] = await db.select().from(payloadsTable).where(eq(payloadsTable.id, id));
  if (!payload) {
    res.status(404).json({ error: "Payload not found" });
    return;
  }
  // increment views
  await db.update(payloadsTable).set({ views: payload.views + 1 }).where(eq(payloadsTable.id, id));
  res.json(payload);
});

router.get("/payloads/stats/overview", async (req, res): Promise<void> => {
  const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(payloadsTable);
  const byCategory = await db
    .select({ category: payloadsTable.category, count: sql<number>`count(*)::int` })
    .from(payloadsTable)
    .groupBy(payloadsTable.category);
  const bySeverity = await db
    .select({ severity: payloadsTable.severity, count: sql<number>`count(*)::int` })
    .from(payloadsTable)
    .groupBy(payloadsTable.severity);
  const bypassCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(payloadsTable)
    .where(eq(payloadsTable.isBypass, true));

  res.json({
    total: total.count,
    bypassCount: bypassCount[0].count,
    byCategory,
    bySeverity,
  });
});

export default router;
