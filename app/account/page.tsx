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
      {/* Top AppBar */}
      <header className="bg-background/80 dark:bg-background/80 backdrop-blur-xl fixed top-0 w-full flex justify-center items-center h-16 z-50 px-margin-mobile md:px-margin-desktop">
        <h1 className="font-headline-md font-bold text-primary dark:text-primary-fixed">
          Profile
        </h1>
      </header>

      <MainContainer className="pt-16 max-w-xl mx-auto">
        <AccountClient user={{ name: user.name || "", email: user.email, currency: user.currency || "USD" }} />
      </MainContainer>

      <BottomNav />
    </div>
  );
}
