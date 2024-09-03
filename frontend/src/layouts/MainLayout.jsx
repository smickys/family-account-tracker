import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { StyledEngineProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from "react";
import axios from 'axios'
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'

const MainLayout = () => {
    const [wallets, setWallets] = useState([]);
    const authHeader = useAuthHeader()
    const isAuthenticated = useIsAuthenticated()

    if(isAuthenticated){
        useEffect(() => {
            axios.get(`${import.meta.env.VITE_BACKEND}/wallets/all`, {
                headers: { 'Authorization': authHeader }
            })
                .then(response => {
                    // console.log(response.data)
                    if (response.status === 200) {
                        setWallets(response.data)
                        console.log(response.data)
                    }
                }).catch(error => {
                    // console.log(error)
                    // navigate('/skelbimai')
                })
        }, [authHeader])
    }

    const defaultTheme = createTheme({
        palette: {
            primary: {
                light: '#c8deb8',
                main: '#bbd6a7',
                dark: '#829574',
                contrastText: '#fff',
            },
            text: {
                primary: '#424242'
            }
        }
    });


    return (
        <div>
            <ThemeProvider theme={defaultTheme}>
                <StyledEngineProvider injectFirst>
                    <Box sx={{ display: 'flex' }}>
                        <Navbar data={wallets} />
                        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                            <Toolbar />
                            <Outlet context={ { defaultTheme }} />

                        </Box>
                    </Box>
                </StyledEngineProvider>
            </ThemeProvider>
        </div>
    )
}

export default MainLayout