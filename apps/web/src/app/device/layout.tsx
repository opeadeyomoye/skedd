import { Avatar } from '@/components/avatar'
import {
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Navbar, NavbarDivider, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer } from '@/components/navbar'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar'
import { StackedLayout } from '@/components/stacked-layout'
import { UserButton } from '@clerk/nextjs'
import { Cog8ToothIcon, PlusIcon } from '@heroicons/react/16/solid'
import React from 'react'

const navItems = [
  { label: 'Device', url: '/device' },
]

function TeamDropdownMenu() {
  return (
    <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
      <DropdownItem href="/teams/1/settings">
        <Cog8ToothIcon />
        <DropdownLabel>Settings</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/teams/1">
        <Avatar slot="icon" src="/tailwind-logo.svg" />
        <DropdownLabel>Tailwind Labs</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/teams/2">
        <Avatar slot="icon" initials="WC" className="bg-purple-500 text-white" />
        <DropdownLabel>Workcation</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/teams/create">
        <PlusIcon />
        <DropdownLabel>New team&hellip;</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <StackedLayout
      navbar={
        <Navbar>
          <h2 className="text-2xl font-bold">&nbsp;skedd</h2>
          <NavbarDivider className="max-lg:hidden" />
          <NavbarSection className="max-lg:hidden">
            {navItems.map(({ label, url }) => (
              <NavbarItem key={label} href={url} current={true}>
                {label}
              </NavbarItem>
            ))}
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <UserButton />
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-2xl font-bold">skedd</h2>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              {navItems.map(({ label, url }) => (
                <SidebarItem key={label} href={url} current={true}>
                  {label}
                </SidebarItem>
              ))}
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      {children}
    </StackedLayout>
  )
}


