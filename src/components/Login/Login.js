import { Button, Radio, TextField } from '@material-ui/core';
import { useState } from 'react';
import GoogleLogin from 'react-google-login';
import Terms from '../Terms/Terms';
import {corktaint,api, User, Cookie} from '../Helper';
export default function Login(props){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [agree, setAgree] = useState(false);
    const setUser = user =>{
        corktaint.user = new User(user);
        props.setUser(true);
    }
    const responseGoogle = r =>{
        const date = new Date();
        const {name, givenName, familyName, email} = r.profileObj;
        date.setDate(date.getDate() + 10);
        Cookie.set('email',email,date);
        setEmail(email);
        setName(name || `${givenName} ${familyName}`);
        fetchUserWithEmail(email);
    }
    const fetchUserWithEmail = email => fetch(`${api}/userWithEmail/${email}`).then(r=>r.json()).then(r=>r[0]&&setUser(r[0]));

    const submit = () => {
        fetch(`${api}/users`,{
            headers:{'Content-Type':'application/json'},
            method:'post',
            body:JSON.stringify({name,email})
        }).then(r=>r.json()).then(r=>setUser(r[0]))
    }

    const cookieEmail = Cookie.get('email');
    if(cookieEmail)fetchUserWithEmail(cookieEmail);
    console.log(document.cookie,cookieEmail);
   
    return <div className='col login-container'>
            {!email?
            <GoogleLogin
    clientId="952817535193-1lhs434tqvkj2q3fl92bgpb3d2gs6uet.apps.googleusercontent.com"
    buttonText="Login"
    onSuccess={responseGoogle}
    onFailure={responseGoogle}
    cookiePolicy={'single_host_origin'}
  />:<div className='sign-up-form'>
      <TextField label="Email" variant="outlined" value={email} onInput={e=>setEmail(e.target.value)} disabled={true}/><br/><br/>
      <TextField label="Name" variant="outlined" value={name} onInput={e=>setName(e.target.value)} />
      <Terms/>
      <Radio color='primary' checked={agree} onClick={()=>setAgree(!agree)} /> I will contribute positively towards the community<br/><br/>
      <Button variant="contained" color="primary" disabled={!agree} onClick={submit}>Sip the Kool-Aid</Button>
      </div>
  }
        </div>
}