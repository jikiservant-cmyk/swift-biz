
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  Users,
  ClipboardList,
  DollarSign,
  Settings,
  LogOut,
  User as UserIcon,
  Calculator,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/financials", label: "Financials", icon: DollarSign },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/cash-book", label: "Cash Book", icon: Calculator },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, auth } = useFirebase();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const userDisplayName = user?.isAnonymous ? 'Anonymous' : user?.email || 'Admin User';
  const userAvatarFallback = user?.isAnonymous ? 'A' : user?.email?.charAt(0).toUpperCase() || 'AU';


  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" className="shrink-0 bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary">
            <Briefcase className="w-5 h-5" />
          </Button>
          <span className="font-headline text-lg text-sidebar-foreground">
            Mubiru Farm
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Account" className="w-full">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/40/40`} alt={userDisplayName} />
                    <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{userDisplayName}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" side="right" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarSeparator />
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer is now empty */}
      </SidebarFooter>
    </Sidebar>
  );
}
