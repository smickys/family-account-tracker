import { useState, useEffect } from 'react'
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs';
import 'dayjs/locale/lt.js';

import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const AccountsPage = () => {
    const [errors, setErrors] = useState([])
    const [accounts, setAccounts] = useState([])
    const [accountValue, setAccountValue] = useState([])
    const [startBalanceValue, setStartBalanceValue] = useState([])

    const [wallets, setWallets] = useState([])
    const [walletValue, setWalletValue] = useState();

    const authHeader = useAuthHeader()
    const auth = useAuthUser()
    const navigate = useNavigate()
    const wallet_id = localStorage.getItem('wallet_id')

    const errorStyle = {
        color: 'red',
        fontSize: '14px',
        margin: 0
    }

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND}/accounts/all/${localStorage.getItem('wallet_id')}`, {
            headers: { 'Authorization': authHeader }
        })
            .then(response => {
                console.log(response.data)
                if (response.status === 200) {
                    setAccounts(response.data)
                }
            }).catch(error => {
                // console.log(error)
            })
    }, [authHeader])

    const handleSubmit = (event) => {
        event.preventDefault();
        const newAccount = {
            wallet: localStorage.getItem('wallet_id'),
            name: accountValue,
            start_balance: parseInt(startBalanceValue)
        }
        // console.log(newAccount)
        axios.post(import.meta.env.VITE_BACKEND + '/accounts/create', newAccount, {
            headers: { 'Authorization': authHeader }
        }).then(response => {
            console.log(response.data)
            if (response.status == 201) {
                // let user = {
                //     username: auth?.username,
                //     _id: auth?.id
                // }
                // let res = response.data
                // res.users[0].user = user
                // setWallets([...wallets, res])
                setAccounts([...accounts, response.data])
                console.log(accounts)

            }
        }).catch(error => {
            // setErrors(error.response.data)
            console.log(error)
        })

    }
    const handleMouseDownIconButton = (event) => {
        event.preventDefault();
    };

    const handleClickUpdate = (row_id) => {
        navigate('/saskaitos/' + row_id)
    }

    const handleClickDelete = (row_id) => {
        if (confirm('Ar tikrai norite ištrinti?')) {

            axios.delete(`${import.meta.env.VITE_BACKEND}/accounts/delete/${localStorage.getItem('wallet_id')}/${row_id}`, {
                headers: { 'Authorization': authHeader }
            }).then(response => {
                if (response.status == 200) {
                    setAccounts([...accounts.filter((obj) => obj._id !== row_id)])
                }
            }).catch(error => {
                alert(error.response.data.message)
            })

        }
    }

    return (
        <div>
            <Container component="main" maxWidth="md">
                <Typography component="h1" variant="h4">
                    Mano sąskaitos
                </Typography>
            </Container>
            <Container component="main" maxWidth="xs">
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} >
                    <FormControl fullWidth sx={{ m: 1 }}>

                        <TextField
                            label="Sąskaitos pavadinimas"
                            onChange={(e, value) => setAccountValue(e.target.value)}
                            id='accountInput'
                            name='account'
                        />
                        {
                            errors.filter(err => err.type === 'name')
                                .map(err => (
                                    <p style={errorStyle} key={err.message}>{err.message}</p>
                                ))
                        }
                    </FormControl>

                    <FormControl fullWidth sx={{ m: 1 }}>
                        <TextField
                            id="startBalanceInput"
                            name='startBalance'
                            onChange={(e, value) => setStartBalanceValue(e.target.value)}
                            label="Pradinė suma"
                            type="number"
                            InputProps={{
                                inputProps: {
                                    step: 0.01
                                },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        €
                                    </InputAdornment>
                                )
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 1 }}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Pridėti
                        </Button>
                    </FormControl>
                </Box>
            </Container>

            <Container component="main" maxWidth="md">
                {/* {
                    transactions.length>0 &&
                    transactions.map(t => (
                        <div key={t.id} style={{border: '1px solid black', padding: '5px'}}>
                            <p>Data: {t.dateTime}</p>
                            <p>Suma: {t.sum}</p>
                            <p>Kategorija: {t.category.title}</p>
                            <p>Sąskaita: {t.account.title}</p>
                            <p>Užrašai: {t.note}</p>
                        </div>
                    ))
                } */}
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Pavadinimas</TableCell>
                                <TableCell align="right">Pradinė suma</TableCell>
                                <TableCell align="right">Viso</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                accounts.length > 0 &&
                                accounts.map((row) => (
                                    <TableRow
                                        key={row._id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.start_balance} €
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.start_balance + row.balance} €
                                        </TableCell>
                                        <TableCell align="right" sx={{ width: '15%' }}>
                                            <IconButton
                                                onMouseDown={handleMouseDownIconButton}
                                                onClick={() => handleClickUpdate(row._id)}
                                            >
                                                <EditIcon></EditIcon>
                                            </IconButton>
                                            <IconButton
                                                onMouseDown={handleMouseDownIconButton}
                                                onClick={() => handleClickDelete(row._id)}
                                            >
                                                <DeleteIcon></DeleteIcon>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

            </Container>

        </div>
    )
}

export default AccountsPage