import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { MainContainer } from "../components/MainContainer";
import { CategoryService } from "@/lib/services/category.service";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const categories = await CategoryService.getCategoriesWithCounts(session.user.id!);

  async function createCategory(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const icon = formData.get("icon") as string || "📌";
    const color = formData.get("color") as string || "#95A5A6";

    if (!name || !type) return;

    try {
      await CategoryService.createCategory(session.user.id, {
        name,
        type: type as "INCOME" | "EXPENSE",
        icon,
        color,
      });
    } catch (err: unknown) {
      console.error("Failed to create category in server action:", err);
      return;
    }

    revalidatePath("/categories");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    
    const id = formData.get("id") as string;
    if (!id) return;

    try {
      await CategoryService.deleteCategory(session.user.id, id);
    } catch (err: unknown) {
      console.error("Failed to delete category in server action:", err);
      return;
    }

    revalidatePath("/categories");
    revalidatePath("/");
  }

  return (
    <div className="flex min-h-screen flex-col text-on-surface pb-32">
      <header className="bg-surface border-b-[1.5px] border-outline-variant fixed top-0 w-full z-[100] h-16 flex items-center gap-4 px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded transition-colors duration-200">
          <ArrowLeft size={24} />
        </Link>
        <div className="font-headline font-bold tracking-tight text-on-surface text-lg">Manage Categories</div>
      </header>

      <MainContainer className="flex-1 py-6 pt-24 gap-8">
        <section className="bg-surface-container-low p-6 rounded border-[1.5px] border-outline-variant shadow-sm max-w-lg mx-auto w-full">
          <h2 className="font-headline text-body font-bold text-on-surface mb-4">Add New Category</h2>
          <form action={createCategory} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                name="name"
                type="text"
                placeholder="Category Name (e.g. Coffee)"
                required
                className="flex-1 rounded border-[1.5px] border-outline-variant bg-surface px-4 py-3 text-sm font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
              <input
                name="icon"
                type="text"
                placeholder="☕"
                maxLength={2}
                className="w-16 text-center rounded border-[1.5px] border-outline-variant bg-surface px-2 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-4 items-center">
              <select name="type" className="flex-1 rounded border-[1.5px] border-outline-variant bg-surface px-4 py-3 text-sm font-body text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none">
                <option value="EXPENSE" className="bg-surface">Expense</option>
                <option value="INCOME" className="bg-surface">Income</option>
              </select>
              <input
                name="color"
                type="color"
                defaultValue="#ff3e00"
                className="w-16 h-12 rounded cursor-pointer bg-surface border-[1.5px] border-outline-variant p-1"
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 rounded bg-primary py-3 font-headline font-bold text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container active-press">
              <Plus size={18} /> Add Category
            </button>
          </form>
        </section>

        <section className="max-w-lg mx-auto w-full">
          <h2 className="font-headline text-body font-bold text-on-surface mb-4">Your Categories</h2>
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded bg-surface-container-low p-4 shadow-sm border-[1.5px] border-outline-variant">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl" style={{ boxShadow: `inset 0 0 0 1px ${c.color}40`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="font-headline text-body font-semibold text-on-surface">{c.name}</div>
                    <div className="font-body text-xs text-on-surface-variant">{c.type} • {c._count.transactions} transactions</div>
                  </div>
                </div>
                {c._count.transactions === 0 ? (
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </form>
                ) : (
                  <div className="p-2 text-surface-variant cursor-not-allowed" title="Cannot delete category with transactions">
                    <Trash2 size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </MainContainer>
      
    </div>
  );
}
