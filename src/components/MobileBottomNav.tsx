import { Home, Search, Camera, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: "home",
      label: "Accueil",
      icon: Home,
      path: "/",
    },
    {
      id: "search",
      label: "Recherche",
      icon: Search,
      path: "/",
    },
    {
      id: "scan",
      label: "Scanner",
      icon: Camera,
      path: "/scan",
    },
    {
      id: "admin",
      label: "Admin",
      icon: User,
      path: "/admin",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-0 flex-1 px-2 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
