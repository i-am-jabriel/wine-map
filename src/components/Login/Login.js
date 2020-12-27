import { Button, Radio, TextField } from '@material-ui/core';
import { useState } from 'react';
import GoogleLogin from 'react-google-login';
import Terms from '../Terms/Terms';
import {corktaint,api, User, Cookie} from '../Helper';
export default function Login(props){
    const [name, setName] = useState('');
    const [email, setEmail] = useState(null);
    const [agree, setAgree] = useState(false);
    const setUser = user =>{
        corktaint.user = new User(user);
        props.setUser(true);
    }
    const responseGoogle = r =>{
        if(!r||!r.profileObj)return;
        const {name, givenName, familyName, email} = r.profileObj;
        setEmail(email);
        setName(name || `${givenName} ${familyName}`);
        fetchUserWithEmail(email);
    }
    const setLoginCookie = (email) => {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        Cookie.set('email',email,date);
    }
    const fetchUserWithEmail = async email =>{
        setLoginCookie(email);
        corktaint.logOut=()=>{
            Cookie.delete('email');
            corktaint.user=null;
            props.setUser(false);
        }
        const user = await (await fetch(`${api}/userWithEmail/${email}`)).json();
        if(user[0])setUser(user[0]);
        return user[0];
    }    

    const submit = async () => {
        setLoginCookie(email);
        const exists = await fetchUserWithEmail(email);
        if(name.length<1 || email.length<3 || exists)return;
        fetch(`${api}/users`,{
            headers:{'Content-Type':'application/json'},
            method:'post',
            body:JSON.stringify({name,email})
        }).then(r=>r.json()).then(r=>setUser(r[0]))
    }
    const [oauth, setOauth] = useState(true);
    const oauthless = () => {
        setEmail('');
        setOauth(false);
    }

    const cookieEmail = Cookie.get('email');
    if(cookieEmail)fetchUserWithEmail(cookieEmail);
   
    return <div className='col login-container'>
            {email==null?<div className='col'>
            <GoogleLogin
    clientId="952817535193-1lhs434tqvkj2q3fl92bgpb3d2gs6uet.apps.googleusercontent.com"
    buttonText="Login"
    onSuccess={responseGoogle}
    onFailure={responseGoogle}
    cookiePolicy={'single_host_origin'}
  />
  <Button color='primary' onClick={oauthless}>OAuthless Login</Button>
  </div>:<div className='sign-up-form container col'>
      <TextField label="Email" variant="outlined" value={email} onInput={e=>setEmail(e.target.value)} disabled={oauth}/><br/><br/>
      <TextField label="Name" variant="outlined" value={name} onInput={e=>setName(e.target.value)} />
      <Terms/>
     <div className='row-center'><Radio color='primary' checked={agree} onClick={()=>setAgree(!agree)}/>I will contribute positively towards the community<br/><br/></div>
      <Button variant="contained" color="primary" disabled={!agree} onClick={submit}>Sip the Kool-Aid</Button>
      </div>
  }
        </div>
}