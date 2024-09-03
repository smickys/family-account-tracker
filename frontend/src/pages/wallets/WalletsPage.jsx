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
import IconButton from '@mui/material/IconButton';


const WalletsPage = () => {
    const [errors, setErrors] = useState([])
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
        axios.get(`${import.meta.env.VITE_BACKEND}/wallets/all`, {
            headers: { 'Authorization': authHeader }
        })
            .then(response => {
                // console.log(response.data)
                if (response.status === 200) {
                    setWallets(response.data)
                }
            }).catch(error => {
                // console.log(error)
            })
    }, [authHeader])

    const handleSubmit = (event) => {
        event.preventDefault();
        const newWallet = {
            name: walletValue
        }

        axios.post(import.meta.env.VITE_BACKEND + '/wallets/create', newWallet, {
            headers: { 'Authorization': authHeader }
        }).then(response => {
            // console.log(response)
            if (response.status == 201) {
                let user = {
                    username: auth?.username,
                    _id: auth?.id
                }
                let res = response.data
                res.users[0].user = user
                setWallets([...wallets, res])
            }
        }).catch(error => {
            setErrors(error.response.data)
        })

    }
    const handleMouseDownIconButton = (event) => {
        event.preventDefault();
    };

    const handleClickUpdate = (row_id) => {
        navigate('/pinigines/' + row_id)
    }

    const handleClickDelete = (row_id) => {
        if (confirm('Ar tikrai norite ištrinti?')) {

            axios.delete(`${import.meta.env.VITE_BACKEND}/wallets/delete/${row_id}`, {
                headers: { 'Authorization': authHeader }
            }).then(response => {
                if (response.status == 200) {
                    setWallets([...wallets.filter((obj) => obj._id !== row_id)])
                }
            }).catch(error => {
                alert(error.response.data.message)
            })

        }
    }
    return (
        <div>
            <Container component="main" maxWidth="lg">
                <Typography component="h1" variant="h4">
                    Mano piniginės
                </Typography>
            </Container>
            <Container component="main" maxWidth="xs">
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} >
                    <FormControl fullWidth sx={{ m: 1 }}>

                        <TextField
                            label="Piniginės pavadinimas"
                            onChange={(e, value) => setWalletValue(e.target.value)}
                            id='walletInput'
                            name='wallet'
                        />
                        {
                            errors.filter(err => err.type === 'name')
                                .map(err => (
                                    <p style={errorStyle} key={err.message}>{err.message}</p>
                                ))
                        }
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

            <Container component="main" maxWidth="lg">
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
                                <TableCell align="right">Administratorius</TableCell>
                                <TableCell align="right">Moderatoriai</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                wallets.length > 0 &&
                                wallets.map((row) => (
                                    <TableRow
                                        key={row._id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">
                                            {
                                                row.users.filter(user => user.role == 'Administrator').map(user => (
                                                    <span key={user.user._id}>{user.user.username} </span>
                                                ))
                                            }
                                        </TableCell>
                                        <TableCell align="right">
                                            {
                                                row.users.filter(user => user.role == 'Moderator').map(user => (
                                                    <span key={user.user._id}>{user.user.username} </span> 
                                                ))
                                            }
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

export default WalletsPage