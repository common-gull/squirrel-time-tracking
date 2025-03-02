import './App.css';
import { Layout } from './pages/Layout.tsx';
import { Route, Routes } from 'react-router';
import { routes } from './routing/routes.tsx';

function App() {
    return (
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
    );
}

export default App;
