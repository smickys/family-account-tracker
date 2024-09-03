import { Link, NavLink, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import axios from 'axios'
import PropTypes from 'prop-types'

import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Receipt, ChartPieSlice, TipJar, Vault, User, SignIn, SignOut, UserPlus, CurrencyBtc, Wallet } from "@phosphor-icons/react";

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const Navbar = (props) => {
    const [currentWallet, setCurrentWallet] = useState('');
    const wallets = props.data

    const drawerWidth = 240;
    const isAuthenticated = useIsAuthenticated()
    const auth = useAuthUser()
    const authHeader = useAuthHeader()



    if (!localStorage.getItem('wallet_id') && wallets.length > 0) {
        localStorage.setItem('wallet_id', wallets[0]._id)
        setCurrentWallet(wallets[0]._id)
    } else {
        // console.log(localStorage.getItem('wallet_id'))
        useEffect(() => {
            if (wallets.length > 0)
                if (!wallets.includes(localStorage.getItem('wallet_id')))
                    {
                        setCurrentWallet(wallets[0]._id)
                        // console.log('array',wallets[0]._id)
                        // console.log('current', currentWallet)
                    }
            
            setCurrentWallet(localStorage.getItem('wallet_id'))
        }, [wallets])
        // 
    }

    // console.log(auth)

    const signOut = useSignOut()

    const navigate = useNavigate()

    const onSignOutHandler = () => {
        signOut()
        navigate('/prisijungti')
    }

    const handleWalletChange = (event) => {
        setCurrentWallet(event.target.value);
        localStorage.setItem('wallet_id', event.target.value)
    };

    return (
        <>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap component="div">
                        <Link to='/' style={{ color: '#424242', textDecoration: "none" }}>Family Account Tracker</Link>
                    </Typography>
                    {
                        isAuthenticated &&
                        <>
                            {
                                wallets.length > 0 &&
                                <Box sx={{ minWidth: 250 }} >
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="walletInput-label">Piniginė</InputLabel>
                                        <Select
                                            labelId="walletInput-label"
                                            id="walletInput"
                                            value={currentWallet}
                                            label="Piniginė"
                                            onChange={handleWalletChange}
                                        >
                                            {wallets.map(wallet => (
                                                <MenuItem key={wallet._id} value={wallet._id} sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                    {wallet.name}
                                                    
                                                    {wallet.users.filter(user => user.role == 'Administrator').map(user => (
                                                    <span key={user.user._id} style={{ color: '#7e7e7e'}}><em key={user.user._id}>&nbsp;({user.user.username})</em></span>
                                                ))}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            }
                            <Typography variant="p" noWrap component="p" sx={{ color: '#424242' }}>
                                Labas, {auth?.username}
                            </Typography>
                        </>

                    }

                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: isAuthenticated ? 'space-between' : 'flex-end', height: '100vh' }}>
                    {
                        isAuthenticated &&
                        <List>
                            {/* {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                            <ListItem key={text} disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                    </ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))} */}
                            <ListItem disablePadding>
                                <ListItemButton component={NavLink} to="/transakcijos">
                                    <ListItemIcon>
                                        <Receipt size={32} />
                                    </ListItemIcon>
                                    <ListItemText primary={"Transakcijos"} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component={NavLink} to="/apzvalga">
                                    <ListItemIcon>
                                        <ChartPieSlice size={32} />
                                    </ListItemIcon>
                                    <ListItemText primary={"Apžvalga"} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component={NavLink} to="/taupymas">
                                    <ListItemIcon>
                                        <TipJar size={32} />
                                    </ListItemIcon>
                                    <ListItemText primary={"Taupymas"} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component={NavLink} to="/investicijos">
                                    <ListItemIcon>
                                        <CurrencyBtc size={32} />
                                    </ListItemIcon>
                                    <ListItemText primary={"Investicijos"} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component={NavLink} to="/saskaitos">
                                    <ListItemIcon>
                                        <Vault size={32} />
                                    </ListItemIcon>
                                    <ListItemText primary={"Sąskaitos"} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component={NavLink} to="/pinigines">
                                    <ListItemIcon>
                                        <Wallet size={32} />
                                    </ListItemIcon>
                                    <ListItemText primary={"Piniginės"} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    }

                    <List>
                        <Divider />
                        {
                            !isAuthenticated &&
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton component={NavLink} to="/prisijungti">
                                        <ListItemIcon>
                                            <SignIn size={32} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Prisijungti"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton component={NavLink} to="/registracija">
                                        <ListItemIcon>
                                            <UserPlus size={32} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Registracija"} />
                                    </ListItemButton>
                                </ListItem>
                            </>
                        }
                        {
                            isAuthenticated &&
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton component={NavLink} to="/profilis">
                                        <ListItemIcon>
                                            <User size={32} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Profilis"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={onSignOutHandler}>
                                        <ListItemIcon>
                                            <SignOut size={32} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Atsijungti"} />
                                    </ListItemButton>
                                </ListItem>
                            </>
                        }
                    </List>
                </Box>
            </Drawer>


        </>
    )
}

Navbar.propTypes = {
    data: PropTypes.array.isRequired
}

export default Navbar