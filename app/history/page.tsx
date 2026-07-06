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
      <header className="bg-background/80 dark:bg-background/80 backdrop-blur-xl fixed top-0 w-full flex justify-center items-center h-16 z-50 px-margin-mobile md:px-margin-desktop">
        <h1 className="font-headline-md font-bold text-primary dark:text-primary-fixed">
          History
        </h1>
      </header>

      {/* Main Content Container */}
      <MainContainer className="pt-16">
        <HistoryClient currency={user.currency} categories={categories} />
      </MainContainer>

      <BottomNav />
    </div>
  );
}
