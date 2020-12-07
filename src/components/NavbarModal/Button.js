export default class Button{
    constructor(icon,text,onClick){
        Object.assign(this,{icon,text,onClick});
    }
    static from(a){ return a.map(b=>new Button(...b))}
    static render(a,c){ return a.map(b=><div className={`${c} modal-link row link`} key={b.text} onClick={b.onClick}>
        {b.icon} {b.text}
    </div>)}
}