import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";
import { BottomNav } from "../components/BottomNav";
import { MainContainer } from "../components/MainContainer";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col text-on-surface pb-32">
      <MainContainer className="pt-12 md:pt-20 max-w-xl mx-auto">
        <AccountClient user={{
          name: user.name || "",
          email: user.email,
          currency: user.currency || "USD",
          gender: user.gender,
          birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
          financialGoal: user.financialGoal,
          targetSavingsRate: user.targetSavingsRate,
        }} />
      </MainContainer>

      <BottomNav />
    </div>
  );
}
