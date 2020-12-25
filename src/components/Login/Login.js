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
        const {name, givenName, familyName, email} = r.profileObj;
        setEmail(email);
        setName(name || `${givenName} ${familyName}`);
        fetchUserWithEmail(email);
    }
    const fetchUserWithEmail = email =>{
        const date = new Date();
        date.setDate(date.getDate() + 7);
        Cookie.set('email',email,date);
        corktaint.logOut=()=>{
            Cookie.delete('email');
            corktaint.user=null;
            props.setUser(false);
        }
        fetch(`${api}/userWithEmail/${email}`).then(r=>r.json()).then(r=>r[0]&&setUser(r[0]));
    }    

    const submit = () => {
        if(name.length<3||email.length<3)return;
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
    console.log(document.cookie,cookieEmail);
   
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