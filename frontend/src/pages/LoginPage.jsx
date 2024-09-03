import { Link as RLink, NavLink, useNavigate } from "react-router-dom"
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
import { useOutletContext } from "react-router-dom";
import { SignIn } from "@phosphor-icons/react";


const LoginPage = () => {
    const { defaultTheme } = useOutletContext();
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

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
        //     password: data.get('password')
        // });

        const userData = {
            username: data.get('username'),
            password: data.get('password')
        }

        axios.post(import.meta.env.VITE_BACKEND + '/auth/login', userData)
            .then(response => {
                // console.log(response)
                if (response.status === 200) {
                    if (signIn({
                        auth: {
                            token: response.data.token,
                            type: 'Bearer'
                        },
                        userState: response.data.user
                    })) {
                        navigate('/transakcijos')
                    } else {
                        setError("Nepavyko prisijungti")
                    }
                }
            }).catch(err => {
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
                <SignIn size={48} />
                <Typography component="h1" variant="h5">
                    Prisijungti
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="El. paštas arba vartotojo vardas"
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Prisijungti
                    </Button>
                    <Grid container justifyContent="flex-end">
                        {/* <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid> */}
                        <Grid item>
                            <Link component={RLink} to='/registracija' variant="body2" sx={{ color: defaultTheme.palette.primary.dark }}>
                                {"Dar neturite paskyros? Užsiregistruokite"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage