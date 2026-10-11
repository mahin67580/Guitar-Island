import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

export type DashboardData = {
  stats: {
    totalProducts: number;
    totalStock: number;
    inventoryValue: number;
    newEnquiries: number;
    pendingWishes: number;
    unreadMessages: number;
    todayEnquiries: number;
    weekEnquiries: number;
  };
  enquiryTrend: { date: string; count: number }[];
  enquiriesByStatus: { status: string; count: number }[];
  productsByCategory: { name: string; count: number }[];
  topProducts: { id: string; name: string; enquiries: number }[];
  recentActivity: {
    type: "enquiry" | "wish" | "message";
    id: string;
    name: string;
    detail: string;
    created_at: string;
  }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  await requireAdmin();
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  const [
    productsRes,
    enquiriesRes,
    wishesRes,
    messagesRes,
    categoriesRes,
    recentEnquiriesRes,
    recentWishesRes,
    recentMessagesRes,
    enquiryProductsRes,
  ] = await Promise.all([
    supabase.from("products").select("id, quantity, price"),
    supabase.from("enquiries").select("id, status, created_at"),
    supabase
      .from("wish_requests")
      .select("id", { count: "exact", head: false })
      .eq("status", "pending"),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: false })
      .eq("is_read", false),
    supabase
      .from("categories")
      .select("id, name"),
    supabase
      .from("enquiries")
      .select("id, customer_name, product_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("wish_requests")
      .select("id, customer_name, product_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("messages")
      .select("id, name, subject, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("enquiries")
      .select("product_id, product_name")
      .not("product_id", "is", null),
  ]);

  const products = productsRes.data || [];
  const enquiries = enquiriesRes.data || [];
  const categories = categoriesRes.data || [];

  // Products stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const inventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 0),
    0
  );

  // Enquiries stats
  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const todayEnquiries = enquiries.filter(
    (e) => new Date(e.created_at) >= todayStart
  ).length;
  const weekEnquiries = enquiries.filter(
    (e) => new Date(e.created_at) >= weekAgo
  ).length;

  // Enquiry trend (last 30 days)
  const trendMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    trendMap.set(key, 0);
  }
  enquiries
    .filter((e) => new Date(e.created_at) >= thirtyDaysAgo)
    .forEach((e) => {
      const key = new Date(e.created_at).toISOString().slice(0, 10);
      if (trendMap.has(key)) {
        trendMap.set(key, (trendMap.get(key) || 0) + 1);
      }
    });
  const enquiryTrend = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Enquiries by status
  const statusCounts = new Map<string, number>();
  enquiries.forEach((e) => {
    statusCounts.set(e.status, (statusCounts.get(e.status) || 0) + 1);
  });
  const enquiriesByStatus = Array.from(statusCounts.entries()).map(
    ([status, count]) => ({ status, count })
  );

  // Products by category
  const productsByCategory = categories.map((cat) => ({
    name: cat.name,
    count: products.length, // placeholder — we'll refine next
  }));

  // Actually query products per category
  const { data: productsWithCat } = await supabase
    .from("products")
    .select("category_id, categories(name)");

  const catMap = new Map<string, { name: string; count: number }>();
  (productsWithCat || []).forEach((p: any) => {
    const catName = p.categories?.name || "Uncategorized";
    const existing = catMap.get(catName);
    if (existing) existing.count += 1;
    else catMap.set(catName, { name: catName, count: 1 });
  });
  const productsByCategoryReal = Array.from(catMap.values()).sort(
    (a, b) => b.count - a.count
  );

  // Top products by enquiry count
  const productCounts = new Map<string, { name: string; count: number }>();
  (enquiryProductsRes.data || []).forEach((e: any) => {
    if (!e.product_id) return;
    const existing = productCounts.get(e.product_id);
    if (existing) existing.count += 1;
    else
      productCounts.set(e.product_id, {
        name: e.product_name || "Unknown",
        count: 1,
      });
  });
  const topProducts = Array.from(productCounts.entries())
    .map(([id, { name, count }]) => ({ id, name, enquiries: count }))
    .sort((a, b) => b.enquiries - a.enquiries)
    .slice(0, 5);

  // Recent activity — merged from enquiries, wishes, messages
  const activity: DashboardData["recentActivity"] = [];
  (recentEnquiriesRes.data || []).forEach((e: any) =>
    activity.push({
      type: "enquiry",
      id: e.id,
      name: e.customer_name,
      detail: e.product_name || "product enquiry",
      created_at: e.created_at,
    })
  );
  (recentWishesRes.data || []).forEach((w: any) =>
    activity.push({
      type: "wish",
      id: w.id,
      name: w.customer_name,
      detail: w.product_name,
      created_at: w.created_at,
    })
  );
  (recentMessagesRes.data || []).forEach((m: any) =>
    activity.push({
      type: "message",
      id: m.id,
      name: m.name,
      detail: m.subject || "contact message",
      created_at: m.created_at,
    })
  );
  activity.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    stats: {
      totalProducts,
      totalStock,
      inventoryValue,
      newEnquiries,
      pendingWishes: wishesRes.count || 0,
      unreadMessages: messagesRes.count || 0,
      todayEnquiries,
      weekEnquiries,
    },
    enquiryTrend,
    enquiriesByStatus,
    productsByCategory: productsByCategoryReal,
    topProducts,
    recentActivity: activity.slice(0, 12),
  };
}