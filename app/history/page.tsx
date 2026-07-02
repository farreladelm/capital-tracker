import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HistoryClient } from "./HistoryClient";
import { BottomNav } from "../components/BottomNav";
import { MainContainer } from "../components/MainContainer";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.currency) {
    redirect("/onboarding");
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="flex min-h-screen flex-col text-on-surface pb-32">
      {/* Top AppBar */}
      <header
        className="fixed top-0 w-full z-[100] h-16 flex justify-center items-center px-margin-mobile md:px-margin-desktop"
        style={{
          backgroundColor: "rgba(252, 248, 255, 0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-outline-variant)",
        }}
      >
        <span className="font-headline-md text-base font-semibold text-on-surface tracking-tight">
          History
        </span>
      </header>

      {/* Main Content Container */}
      <MainContainer className="pt-16">
        <HistoryClient currency={user.currency} categories={categories} />
      </MainContainer>

      <BottomNav />
    </div>
  );
}
