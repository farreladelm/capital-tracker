import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  async function createCategory(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const icon = formData.get("icon") as string || "📌";
    const color = formData.get("color") as string || "#95A5A6";

    if (!name || !type) return;

    await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        type,
        icon,
        color,
      }
    });

    revalidatePath("/categories");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    
    const id = formData.get("id") as string;
    if (!id) return;

    // Check if transactions exist
    const count = await prisma.transaction.count({ where: { categoryId: id } });
    if (count > 0) {
      throw new Error("Cannot delete category with existing transactions");
    }

    await prisma.category.delete({
      where: { id, userId: session.user.id }
    });

    revalidatePath("/categories");
    revalidatePath("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 pb-32">
      <header className="sticky top-0 z-10 flex items-center gap-4 bg-white/80 px-6 py-4 backdrop-blur-md border-b border-slate-100">
        <Link href="/" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="font-bold tracking-tight text-slate-800">Manage Categories</div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col gap-8">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Category</h2>
          <form action={createCategory} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                name="name"
                type="text"
                placeholder="Category Name (e.g. Coffee)"
                required
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                name="icon"
                type="text"
                placeholder="☕"
                maxLength={2}
                className="w-16 text-center rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex gap-4 items-center">
              <select name="type" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none">
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
              <input
                name="color"
                type="color"
                defaultValue="#4ECDC4"
                className="w-16 h-12 rounded-xl cursor-pointer"
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95">
              <Plus size={18} /> Add Category
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Your Categories</h2>
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-inner" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-xs font-medium text-slate-400">{c.type} • {c._count.transactions} transactions</div>
                  </div>
                </div>
                {c._count.transactions === 0 ? (
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="p-2 text-slate-200 cursor-not-allowed" title="Cannot delete category with transactions">
                    <Trash2 size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
