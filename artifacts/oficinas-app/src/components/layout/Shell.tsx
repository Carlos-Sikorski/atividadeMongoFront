import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Car, Home, Settings, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/oficinas", icon: Wrench, label: "Oficinas" },
    { href: "/veiculos", icon: Car, label: "Veículos" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r bg-sidebar md:flex hidden flex-col">
        <div className="flex h-16 items-center px-6 border-b">
          <Wrench className="h-6 w-6 text-primary mr-3" />
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">OficinaPro</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || 
                             (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Admin</span>
              <span className="text-xs text-muted-foreground">Sistema</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6 shadow-sm shadow-black/5">
          <div className="flex flex-1 items-center justify-between">
            <div className="md:hidden flex items-center gap-2">
               <Wrench className="h-5 w-5 text-primary" />
               <span className="font-bold text-foreground">OficinaPro</span>
            </div>
            <div className="hidden md:flex">
              {/* Optional top search or breadcrumb space */}
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}