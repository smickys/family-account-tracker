import React, { useState } from 'react'

import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import 'dayjs/locale/lt.js';

import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Autocomplete from '@mui/material/Autocomplete';
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


const TransactionsPage = () => {
    const myDate = dayjs()
    let t_id = 0;
    const [ tID, setTID ] = useState(0)
    const [transactions, setTransactions] = useState([])
    const [dateValue, setDateValue] = useState(myDate);
    const [sumValue, setSumValue] = useState();
    const [catValue, setCatValue] = useState();
    const [accValue, setAccValue] = useState();
    const [noteValue, setNoteValue] = useState();
    const wallet_id = localStorage.getItem('wallet_id')
    // console.log(wallet_id)s
    const handleSubmit = (event) => {
        event.preventDefault();
        // const data = new FormData(event.currentTarget);
        // console.log(data)
        const data = {
            id: tID,
            dateTime: dateValue.format('YYYY-MM-DD HH:mm:ss'),
            sum: sumValue,
            category: categories.filter(cat => cat._id == catValue)[0],
            account: accounts.filter(acc => acc._id == accValue)[0],
            note: noteValue
        }
        setTransactions([...transactions, data])
        setTID(tID + 1)
        // console.log(transactions)
        console.log("t id",tID)
    }

    // const classes = makeStyles();
    const categories = [
        { title: "Maistas", _id: 1 },
        { title: "Paslaugos", _id: 2 },
        { title: "Pramogos", _id: 3 },
        { title: "Higiena", _id: 4 },
        { title: "Namai", _id: 5 },
    ]

    const accounts = [
        { title: "SEB", _id: 1 },
        { title: "Swedbank", _id: 2 },
        { title: "Gryni", _id: 3 },
    ]

    const optionsCat = categories.map(option => ({ id: option._id, label: option.title }));
    const optionsAcc = accounts.map(option => ({ id: option._id, label: option.title }));

    const handleMouseDownIconButton = (event) => {
        event.preventDefault();
    };

    const handleClickDelete = (row_id) => {
        if (confirm('Ar tikrai norite ištrinti?'))
            setTransactions(transactions.filter(t => t.id != row_id))
    }

    return (
        <div>
            <Container component="main" maxWidth="xs">
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} >

                    <FormControl fullWidth sx={{ m: 1 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="lt">
                            <Stack spacing={2} sx={{ minWidth: 305 }}>
                                <DateTimePicker
                                    value={dateValue}
                                    onChange={setDateValue}
                                    referenceDate={dayjs()}
                                    minutesStep={1}
                                    label="Data ir laikas"
                                    id='dateTimeInput'
                                    name='dateTime'
                                />
                                {/* <Typography>
                        Stored value: {value == null ? 'null' : value.format()}
                    </Typography> */}
                            </Stack>
                        </LocalizationProvider>
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 1 }}>
                        <TextField
                            id="number"
                            name='sum'
                            onChange={(e, value) => setSumValue(e.target.value)}
                            label="Suma"
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
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            disablePortal
                            options={optionsCat}
                            onChange={(e, value) => setCatValue(value.id)}
                            renderInput={(params) => <TextField {...params} label="Kategorija" id="categoryInput" name="category" />}
                            id="categoryAutocomplete"
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 1 }}>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            disablePortal
                            options={optionsAcc}
                            onChange={(e, value) => setAccValue(value.id)}
                            renderInput={(params) => <TextField {...params} label="Sąskaita" id="accountInput" name="account" />}
                            id="accountAutocomplete"
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 1 }}>

                        <TextField
                            label="Užrašai"
                            multiline
                            maxRows={4}
                            onChange={(e, value) => setNoteValue(e.target.value)}
                            id='noteInput'
                            name='note'
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
                                <TableCell>Data</TableCell>
                                <TableCell align="right">Suma, €</TableCell>
                                <TableCell align="right">Kategorija</TableCell>
                                <TableCell align="right">Sąskaita</TableCell>
                                <TableCell align="right">UŽrašai</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                transactions.length > 0 &&
                                transactions.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" sx={{ width: '20%' }}>
                                            {row.dateTime}
                                        </TableCell>
                                        <TableCell align="right">{row.sum} €</TableCell>
                                        <TableCell align="right">{row.category.title}</TableCell>
                                        <TableCell align="right">{row.account.title}</TableCell>
                                        <TableCell align="right" sx={{ width: '25%' }}>{row.note}</TableCell>
                                        <TableCell align="right" sx={{ width: '15%' }}>
                                            <IconButton
                                                onMouseDown={handleMouseDownIconButton}
                                            >
                                                <EditIcon></EditIcon>
                                            </IconButton>
                                            <IconButton
                                                onMouseDown={handleMouseDownIconButton}
                                                onClick={() => handleClickDelete(row.id)}
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

export default TransactionsPage