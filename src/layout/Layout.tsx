import { AppShell, Burger, Flex, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation } from 'react-router';
import { routes } from '../routing/routes.tsx';
import Squirrel from '../assets/squirrel.svg';
import { useTranslation } from 'react-i18next';

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const location = useLocation();
    const { t } = useTranslation();

    const routesWithNav = routes.filter((route) => route.nav !== undefined);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" pt={5}>
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Flex align={'center'}>
                        <div>
                            <img src={Squirrel} height={'28px'} alt={t('app.squirrelIcon')} />
                        </div>
                        <Text ml={'sm'}>{t('app.title')}</Text>
                    </Flex>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                {routesWithNav.map((route) => (
                    <NavLink
                        key={route.path}
                        active={location.pathname.toLowerCase() === route.path}
                        label={t(route.nav.labelKey)}
                        component={Link}
                        to={route.path}
                        leftSection={route.nav.icon}
                    />
                ))}
            </AppShell.Navbar>
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
