import { useState, useEffect, useRef } from 'react'
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import axios from 'axios'
import { useParams } from 'react-router-dom'
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
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const WalletDetailsPage = () => {
    const { id } = useParams()
    const [errors, setErrors] = useState([])
    const [wallet, setWallet] = useState([])
    const [username, setUsername] = useState([])
    const [role, setRole] = useState('Moderator')
    const [walletValue, setWalletValue] = useState();
    const walletRef = useRef();

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
        axios.get(`${import.meta.env.VITE_BACKEND}/wallets/${id}`, {
            headers: { 'Authorization': authHeader }
        })
            .then(response => {
                // console.log(response)
                if (response.status === 200) {
                    setWallet(response.data)
                    // walletRef.current.value = response.data.name
                    // console.log(response.data)
                }
            }).catch(error => {
                console.log(error)
                // navigate('/pinigines')
            })
    }, [id])


    // console.log(wallet_id)s

    const handleSubmit = (event) => {
        event.preventDefault();
        const newWallet = {
            name: walletValue
        }

        console.log(newWallet)

        axios.put(`${import.meta.env.VITE_BACKEND}/wallets/edit/${wallet._id}`, newWallet, {
            headers: { 'Authorization': authHeader }
        }).then(response => {
            // console.log(response)
            if (response.status == 200) {
                // navigate('/pinigines/')
                setWallet(response.data)
                // console.log(response.data)
            }
        }).catch(error => {
            // setErrors(error.response.data)
            console.log(error)
        })
    }

    const handleAddUserSubmit = (event) => {
        event.preventDefault();
        const newUser = {
            username: username,
            role: role
        }
        axios.post(`${import.meta.env.VITE_BACKEND}/wallets/add-user/${wallet._id}`, newUser, {
            headers: { 'Authorization': authHeader }
        }).then(response => {
            // console.log(response)
            if (response.status == 200) {
                setWallet(response.data)
            }
        }).catch(error => {
            // setErrors(error.response.data)
            console.log(error)
        })

    }

    const handleMouseDownIconButton = (event) => {
        event.preventDefault();
    };

    const handleClickDelete = (row_id) => {
        if (confirm('Ar tikrai norite ištrinti?')) {

            axios.put(`${import.meta.env.VITE_BACKEND}/wallets/remove-user/${wallet._id}`, { user_id: row_id }, {
                headers: { 'Authorization': authHeader }
            }).then(response => {
                // console.log(response.data)
                if (response.status == 200) {
                    setWallet(response.data)
                    // console.log(response.data)

                    // ??????????????????????????
                }

            }).catch(error => {
                alert(error.response.data.message)
                // console.log(error);

            })

        }
    }

    const handleWalletChange = (event) => {
        setRole(event.target.value);
        // localStorage.setItem('wallet_id', event.target.value)
    };

    return (
        <div>
            <Container component="main" maxWidth="md">
                <Typography component="h1" variant="h4">
                    Piniginė: {wallet?.name}
                </Typography>
            </Container>
            <Container component="main" maxWidth="xs">
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} >
                    <FormControl fullWidth sx={{ m: 1 }}>
                        <div>
                            <label htmlFor="walletInput">Piniginės pavadinimas: </label>
                            <input type="text" id="walletInput" name='walletInput' defaultValue={wallet?.name} onChange={(e, value) => setWalletValue(e.target.value)} />
                        </div>
                        {/* <TextField
                            label="Piniginės pavadinimas"
                            // onChange={(e, value) => setWalletValue(e.target.value)}
                            id='walletInput'
                            name='wallet'
                            // defaultvalue={wallet.name}
                            // key={wallet._id}
                            // defaultValue={wallet?.name}
                            // ref={walletRef}
                            // value={wallet?.name}
                        /> */}
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
                            Atnaujinti
                        </Button>
                    </FormControl>
                </Box>
            </Container>

            <Container component="main" maxWidth="md">
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Vartotojo vardas/email</TableCell>
                                <TableCell align="right">Rolė</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                wallet &&
                                wallet?.users?.map((row) => (
                                    <TableRow
                                        key={row.user._id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.user.username}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.role}
                                        </TableCell>
                                        <TableCell align="right" sx={{ width: '15%' }}>
                                            <IconButton
                                                onMouseDown={handleMouseDownIconButton}
                                                onClick={() => handleClickDelete(row.user._id)}
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
            <br />
            <br />
            <br />
            <Container component="main" maxWidth="md">
                <Typography component="h2" variant="h5">
                    Pridėti vartotoją prie piniginės
                </Typography>
            </Container>
            <Container component="main" maxWidth="xs">
                <Box component="form" onSubmit={handleAddUserSubmit} noValidate sx={{ mt: 1 }} >
                    <FormControl fullWidth sx={{ m: 1 }}>

                        <TextField
                            label="Vartotojo vardas arba el paštas"
                            onChange={(e, value) => setUsername(e.target.value)}
                            id='usernameInput'
                            name='username'
                        />
                        {/* {
                            errors.filter(err => err.type === 'username')
                                .map(err => (
                                    <p style={errorStyle} key={err.message}>{err.message}</p>
                                ))
                        } */}
                    </FormControl>

                    <FormControl fullWidth sx={{ m: 1 }}>
                        <InputLabel id="roleInput-label">Rolė</InputLabel>
                        <Select
                            labelId="roleInput-label"
                            id="roleInput"
                            label="Rolė"
                            onChange={handleWalletChange}
                            value="Moderator"
                        >
                            <MenuItem value="Moderator">
                                Moderator
                            </MenuItem>
                        </Select>
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

        </div>
    )
}

export default WalletDetailsPage