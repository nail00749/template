import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
  useRouter,
} from '@tanstack/react-router'
import { LayoutTemplateIcon, LogOutIcon, ShieldCheckIcon } from 'lucide-react'

import { meQueryOptions } from '@/features/auth/api/auth.queries'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { Button } from '@/shared/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/shared/ui/sidebar'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.ensureQueryData(meQueryOptions())
    if (!auth.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})

interface AdminNavItem {
  to: string
  label: string
  icon: typeof ShieldCheckIcon
}

const adminNavItems: AdminNavItem[] = [
  {
    to: '/templates',
    label: 'Шаблоны',
    icon: LayoutTemplateIcon,
  },
]

function AdminLayout() {
  const router = useRouter()
  const logoutMutation = useLogout({
    onSuccess: () => {
      router.navigate({ to: '/login', replace: true })
    },
  })
  const location = useLocation()

  const isNavItemActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <div className="flex min-h-svh w-full bg-muted/30">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <ShieldCheckIcon className="size-5 shrink-0" />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">Admin</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="ml-auto group-data-[collapsible=icon]:hidden"
              onClick={() => void logoutMutation.mutateAsync()}
              loading={logoutMutation.isPending}
              aria-label="Выйти"
            >
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Навигация</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={isNavItemActive(item.to)}
                        tooltip={item.label}
                      >
                        <Link
                          to={item.to}
                          className="flex items-center gap-2 w-full"
                        >
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Admin panel</h1>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </SidebarInset>
    </div>
  )
}
