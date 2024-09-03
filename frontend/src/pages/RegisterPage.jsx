import { Link as RLink, useNavigate, useOutletContext } from "react-router-dom"
import { useState } from "react"
import axios from 'axios'
import useSignIn from 'react-auth-kit/hooks/useSignIn';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { UserPlus } from "@phosphor-icons/react";

const RegisterPage = () => {
    const { defaultTheme } = useOutletContext();

    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const signIn = useSignIn()

    const navigate = useNavigate()

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // console.log({
        //     username: data.get('username'),
        //     email: data.get('email'),
        //     password: data.get('password')
        // });

        const userData = {
            username: data.get('username'),
            email: data.get('email'),
            password: data.get('password')
        }

        console.log(userData);

        axios.post(import.meta.env.VITE_BACKEND + '/auth/register', userData)
            .then(response => {
                // console.log(response)

                if (response.status === 201) {
                    if (signIn({
                        auth: {
                            token: response.data.token,
                            type: 'Bearer'
                        },
                        userState: response.data.user
                    })) {
                        // alert("Sekmingai")
                        navigate('/transakcijos')
                    } else {
                        // alert("Nesekmingai")
                        setError("Nepavyko prisijungti")
                    }
                }
            }).catch(err => {
                // console.log(err.response.data.message);

                setError(err.response.data.message)
            })

    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >

                <UserPlus size={48} />
                <Typography component="h1" variant="h5">
                    Registracija
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                autoComplete="given-name"
                                name="username"
                                required
                                fullWidth
                                id="username"
                                label="Varotojo vardas"
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="El. paštas"
                                name="email"
                                autoComplete="email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            {/* <TextField
                                required
                                fullWidth
                                name="password"
                                label="Slaptažodis"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                            /> */}
                            <FormControl fullWidth required variant="outlined">
                                <InputLabel htmlFor="outlined-adornment-password">Slaptažodis</InputLabel>
                                <OutlinedInput
                                    type={showPassword ? 'text' : 'password'}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    name="password"
                                    id="password"
                                    label="Slaptažodis"
                                    autoComplete="new-password"
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Registruotis
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link to='/prisijungti' component={RLink} sx={{ color: defaultTheme.palette.primary.dark }}>
                                Jau turite paskyrą? Prisijunkite
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

        </Container>
    );
}

export default RegisterPage