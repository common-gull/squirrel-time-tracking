import './App.css';
import { Layout } from './layout/Layout.tsx';
import { Route, Routes } from 'react-router';
import { routes } from './routing/routes.tsx';
import { Suspense } from 'react';

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route element={<Layout />}>
                    {routes.map((route) => (
                        <Route
                            key={route.path}
                            index={route.index}
                            path={route.path}
                            element={route.element}
                        />
                    ))}
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;
