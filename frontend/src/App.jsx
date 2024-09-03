import { BrowserRouter, Routes, Route } from "react-router-dom"
import createStore from 'react-auth-kit/createStore';
import AuthProvider from 'react-auth-kit';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet'
import MainLayout from "./layouts/MainLayout"
import HomePage from "./pages/HomePage"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import TransactionsPage from "./pages/transactions/TransactionsPage";
import StatsPage from "./pages/stats/StatsPage";
import SavingsPage from "./pages/savings/SavingsPage";
import AccountsPage from "./pages/accounts/AccountsPage";
import WalletsPage from "./pages/wallets/WalletsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import InvestitionsPage from "./pages/investitions/InvestitionsPage";
import WalletDetailsPage from "./pages/wallets/WalletDetailsPage";
import AccountDetailsPage from "./pages/accounts/AccountDetailsPage";

function App() {
    const store = createStore({
        authName: '_auth',
        authType: 'cookie',
        cookieDomain: window.location.hostname,
        // cookieSecure: window.location.protocol === 'https:',
        cookieSecure: false
    });

    return (
        <>
            <AuthProvider store={store}>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<MainLayout />}>
                            <Route path='/' element={<HomePage />} />
                            <Route path='/registracija' element={<RegisterPage />} />
                            <Route path='/prisijungti' element={<LoginPage />} />
                            <Route element={<AuthOutlet fallbackPath='/prisijungti' />} >
                                <Route path='/transakcijos/' element={<TransactionsPage />} />
                                <Route path='/apzvalga/' element={<StatsPage />} />
                                <Route path='/taupymas/' element={<SavingsPage />} />
                                <Route path='/investicijos/' element={<InvestitionsPage />} />
                                <Route path='/saskaitos/' element={<AccountsPage />} />
                                <Route path='/saskaitos/:id' element={<AccountDetailsPage />} />
                                <Route path='/pinigines/' element={<WalletsPage />} />
                                <Route path='/pinigines/:id' element={<WalletDetailsPage />} />
                                <Route path='/profilis/' element={<ProfilePage />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </>
    );
}

export default App;
