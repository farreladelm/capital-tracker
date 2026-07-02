import { ReactNode } from "react";

export function MainContainer({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <main className={`max-w-[1024px] mx-auto w-full pt-20 pb-32 px-margin-mobile md:px-margin-desktop min-h-screen flex flex-col ${className}`}>
      {children}
    </main>
  );
}
