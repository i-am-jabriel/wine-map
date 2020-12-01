import { Button, TextField } from '@material-ui/core';
import { useState } from 'react';
import GoogleLogin from 'react-google-login';
import {corktaint,api, User} from '../Helper';
export default function Login(props){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [agree, setAgree] = useState(false);
    const setUser = user =>{
        corktaint.user = new User(user);
        props.setUser(true);
    }
    const responseGoogle = r =>{
        setEmail(r.profileObj.email);
        setName(r.profileObj.name || `${r.profileObj.givenName} ${r.profileObj.familyName}`);
        fetch(`${api}/userWithEmail/${r.profileObj.email}`)
            .then(r=>r.json()).then(r=>r[0]&&setUser(r[0]));
    }
    const submit = () => {
        fetch(`${api}/users`,{
            headers:{'Content-Type':'application/json'},
            method:'post',
            body:JSON.stringify({name,email})
        }).then(r=>r.json()).then(r=>setUser(r[0]))
    }
   
    return <div className='col login-container'>
            {!email?
            <GoogleLogin
    clientId="952817535193-1lhs434tqvkj2q3fl92bgpb3d2gs6uet.apps.googleusercontent.com"
    buttonText="Login"
    onSuccess={responseGoogle}
    onFailure={responseGoogle}
    cookiePolicy={'single_host_origin'}
  />:<div className='Sign-Up-Form'>
      <TextField id="outlined-basic" label="Email" variant="outlined" value={email} onInput={e=>setEmail(e.target.value)} disabled={true}/>
      <TextField id="outlined-basic" label="Name" variant="outlined" value={name} onInput={e=>setName(e.target.value)} />
      <Button variant="contained" color="primary" onClick={submit}>Submit</Button>
      </div>
  }
        </div>
}