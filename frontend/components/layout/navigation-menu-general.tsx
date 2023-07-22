import { HTMLAttributes } from 'react'

import Image from 'next/image'

import { IsDarkTheme } from '../shared/is-dark-theme'
import { IsLightTheme } from '../shared/is-light-theme'
import { LinkComponent } from '../shared/link-component'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { turboIntegrations } from '@/data/turbo-integrations'
import { cn } from '@/lib/utils'

export function NavigationMenuGeneral() {
  return (
    <NavigationMenu className="self-center">
      <NavigationMenuList className="w-full">
        <NavigationMenuItem>
          <NavigationMenuTrigger>ERC20</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
              {Object.values(turboIntegrations).map((component) => (
                <ListItem key={component.name} title={component.name} {...component}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface ListItemProps extends HTMLAttributes<HTMLElement> {
  href: string
  name: string
  imgLight: string
  imgDark: string
}

const ListItem = ({ className, href, name, imgLight, imgDark, children, ...props }: ListItemProps) => {
  return (
    <li key={name}>
      <NavigationMenuLink asChild>
        <LinkComponent
          href={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-700 dark:focus:bg-slate-700',
            className
          )}
          {...props}>
          <IsLightTheme>
            <Image alt="Etherscan logo" className="mb-3 h-7 w-7 rounded-full" height={100} src={imgDark} width={100} />
          </IsLightTheme>
          <IsDarkTheme>
            <Image alt="Etherscan logo" className="mb-3 h-7 w-7 rounded-full" height={100} src={imgLight} width={100} />
          </IsDarkTheme>
          <div className="text-sm font-medium leading-none">{name}</div>
          <p className="line-clamp-2 text-sm leading-snug text-slate-500 dark:text-slate-400">{children}</p>
        </LinkComponent>
      </NavigationMenuLink>
    </li>
  )
}
ListItem.displayName = 'ListItem'
