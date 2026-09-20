import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Clock3, Copy, ListFilter as Filter, Heart, Dome as Home, MapPin, Menu as MenuIcon, Minus, Navigation, Package, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, User, X, MessageCircle, AtSign, Pencil, Trash as Trash2, LockKeyhole, RefreshCw, CircleAlert as AlertCircle } from 'lucide-react';
import { categories, categoryById, menu, menuById, type MenuItem } from './data/menu';
import { useStore, type Address, type CartLine, type Order } from './store';

const GREEN='#0E3B2E', BRAND='#1E7A55', CREAM='#FBF7EF';
const WHATSAPP='919082975231';
const INSTAGRAM='https://www.instagram.com/daily_healthy_kitchen?stkn=eGl5N3drbmRlaXdp';
const RESTAURANT_ADDRESS='Front of Bank of Baroda, Camp Rd, above SKY Bakery House, Vardhaman Nagar, Malegaon, Maharashtra 423105';
const PINCODE='423105';

const money=(n:number)=>`₹${Math.round(n).toLocaleString('en-IN')}`;
const priceOf=(item:MenuItem, overrides:Record<string,number>)=>overrides[item.id] ?? item.price;
const fuzzy=(q:string,s:string)=>{
  const a=q.toLowerCase().trim(), b=s.toLowerCase();
  if(!a) return true; if(b.includes(a)) return true;
  const words=b.split(/\s+/);
  return words.some(w=>lev(a,w)<=Math.max(1,Math.floor(a.length/4)));
};
const lev=(a:string,b:string)=>{
  const dp=Array.from({length:a.length+1},(_,i)=>Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++) dp[i][0]=i; for(let j=0;j<=b.length;j++) dp[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return dp[a.length][b.length];
};
const highlight=(text:string,q:string)=>{
  if(!q.trim()) return text;
  const i=text.toLowerCase().indexOf(q.toLowerCase());
  if(i<0) return text;
  return <>{text.slice(0,i)}<mark className="rounded bg-dhk-green100 px-0.5 text-dhk-green900">{text.slice(i,i+q.length)}</mark>{text.slice(i+q.length)}</>;
};
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));

function useToast(){
  const [toast,setToast]=useState<{msg:string;type:'success'|'error'}|null>(null);
  const show=(msg:string,type:'success'|'error'='success')=>{setToast({msg,type});window.setTimeout(()=>setToast(null),2500)};
  return {toast,show};
}

function VegMark(){return <span aria-label="Vegetarian" className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border border-dhk-veg"><span className="h-1.5 w-1.5 rounded-full bg-dhk-veg"/></span>}
function JainBadge(){return <span className="rounded-full bg-[#f0ebff] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-dhk-jain">JAIN</span>}
function SkeletonRow(){return <div className="animate-pulse rounded-2xl bg-white p-4 shadow-soft"><div className="flex gap-3"><div className="h-4 w-16 rounded bg-stone-200"/><div className="flex-1 space-y-2"><div className="h-4 w-2/3 rounded bg-stone-200"/><div className="h-3 w-4/5 rounded bg-stone-200"/><div className="h-8 w-28 rounded bg-stone-200"/></div><div className="h-28 w-28 rounded-2xl bg-stone-200"/></div></div>}
function BrokenImage({className=''}:{className?:string}){return <div className={`grid place-items-center bg-dhk-cream text-dhk-green700 ${className}`}><img src="/assets/logo.png" alt="" className="h-10 w-10 object-contain opacity-50"/></div>}
function SmartImage({src,alt,className,priority=false}:{src:string;alt:string;className?:string;priority?:boolean}){
  const [bad,setBad]=useState(false); const [loaded,setLoaded]=useState(false);
  if(bad) return <BrokenImage className={className||''}/>;
  return <div className={`relative overflow-hidden ${className||''}`}>
    {!loaded&&<div className="absolute inset-0 animate-pulse bg-stone-200"/>}
    <img src={src} alt={alt} loading={priority?'eager':'lazy'} decoding="async" width={480} height={480}
      className={`h-full w-full object-cover transition duration-500 ${loaded?'opacity-100 scale-100':'opacity-0 scale-[1.02]'}`}
      onLoad={()=>setLoaded(true)} onError={()=>setBad(true)}/>
  </div>
}

function Welcome({onDone}:{onDone:()=>void}){
  const setName=useStore(s=>s.setName); const existing=useStore(s=>s.name); const [name,setLocal]=useState(existing);
  const reduced=useReducedMotion();
  return <div className="min-h-[100svh] bg-dhk-cream px-6 py-10 flex items-center justify-center overflow-hidden">
    <div className="w-full max-w-md text-center">
      <motion.div initial={{opacity:0,scale:.86,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{duration:.7,ease:[.22,1,.36,1]}}>
        <img src="/assets/logo.png" alt="Daily Healthy Kitchen" className="mx-auto h-36 w-36 rounded-full object-cover shadow-float"/>
      </motion.div>
      <motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="mt-5 text-sm font-bold tracking-[.18em] text-dhk-green700">DAILY HEALTHY KITCHEN</motion.p>
      <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.28}} className="mt-3 font-display text-3xl font-bold text-dhk-green900">Fresh • Healthy • Tasty</motion.h1>
      <motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.36}} className="mt-2 text-sm text-dhk-muted">Good Food • Good Mood</motion.p>
      <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.46}} className="mt-8 rounded-3xl bg-white p-5 shadow-soft">
        <label className="block text-left text-xs font-bold uppercase tracking-wider text-dhk-muted">Enter your name</label>
        <input value={name} onChange={e=>setLocal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&name.trim()){setName(name.trim());onDone()}}}
          className="mt-2 h-12 w-full rounded-2xl border border-dhk-line bg-dhk-cream px-4 outline-none focus:border-dhk-green500" placeholder="Your name"/>
        <button disabled={!name.trim()} onClick={()=>{setName(name.trim());onDone()}} className="mt-3 h-12 w-full rounded-2xl bg-dhk-green500 font-bold text-white transition active:scale-[.96] disabled:opacity-40">Continue</button>
      </motion.div>
      <p className="mt-5 text-xs text-dhk-muted">100% Pure Vegetarian · Malegaon</p>
    </div>
  </div>
}

function Header({onSearch}:{onSearch:()=>void}){
  const navigate=useNavigate(); const cartCount=useStore(s=>s.cart.reduce((a,x)=>a+x.qty,0));
  return <header className="sticky top-0 z-40 border-b border-dhk-line/80 bg-dhk-cream/95 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
      <button onClick={()=>navigate('/')} className="flex items-center gap-2 text-left">
        <img src="/assets/logo.png" alt="DHK" className="h-10 w-10 rounded-full object-cover"/>
        <div><div className="font-display text-sm font-bold text-dhk-green900">Daily Healthy</div><div className="text-[10px] font-semibold text-dhk-green700">Kitchen</div></div>
      </button>
      <div className="flex items-center gap-2">
        <button onClick={onSearch} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-soft"><Search size={18}/></button>
        <button onClick={()=>navigate('/checkout')} aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-xl bg-dhk-green900 text-white">
          <ShoppingBag size={18}/>{cartCount>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-dhk-gold px-1 text-[10px] font-bold text-dhk-green900">{cartCount}</span>}
        </button>
      </div>
    </div>
  </header>
}

function BottomNav(){
  const loc=useLocation();
  const tabs=[['/','HOME',Home],['/orders','ORDERS',Package],['/account','ACCOUNT',User]] as const;
  return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-dhk-line bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
      {tabs.map(([to,label,Icon])=><Link key={to} to={to} className={`relative flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold ${loc.pathname===to?'text-dhk-green500':'text-dhk-muted'}`}>
        {loc.pathname===to&&<motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-xl bg-dhk-green100"/>}
        <Icon size={18}/><span>{label}</span>
      </Link>)}
    </div>
  </nav>
}

function CartBar({onOpen}:{onOpen:()=>void}){
  const cart=useStore(s=>s.cart); const overrides=useStore(s=>s.priceOverrides);
  const count=cart.reduce((a,x)=>a+x.qty,0); const total=cart.reduce((a,x)=>a+(priceOf(menuById[x.itemId],overrides)*x.qty),0);
  return <AnimatePresence>{count>0&&<motion.div initial={{y:90,opacity:0}} animate={{y:0,opacity:1}} exit={{y:90,opacity:0}} transition={{type:'spring',stiffness:320,damping:32}}
    className="fixed inset-x-4 bottom-[76px] z-40 mx-auto flex max-w-5xl items-center justify-between rounded-2xl bg-dhk-green900 px-4 py-3 text-white shadow-float">
    <div><div className="text-xs font-semibold opacity-80">{count} ITEMS</div><div className="font-display text-lg font-bold">{money(total)}</div></div>
    <button onClick={onOpen} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-dhk-green900">VIEW CART <ArrowRight size={15} className="ml-1 inline"/></button>
  </motion.div>}</AnimatePresence>
}

function SearchOverlay({open,onClose}:{open:boolean;onClose:()=>void}){
  const [q,setQ]=useState(''); const [recent,setRecent]=useState<string[]>(()=>JSON.parse(localStorage.getItem('dhk-recent-searches')||'[]'));
  const navigate=useNavigate(); const setSearch=(v:string)=>{setQ(v);};
  const results=useMemo(()=>q?menu.filter(i=>fuzzy(q,[i.name,categoryById[i.categoryId].name,...i.keywords].join(' '))):[],[q]);
  useEffect(()=>{if(!open)setQ('')},[open]);
  const submit=(v:string)=>{const clean=v.trim();if(!clean)return;const next=[clean,...recent.filter(x=>x.toLowerCase()!==clean.toLowerCase())].slice(0,6);setRecent(next);localStorage.setItem('dhk-recent-searches',JSON.stringify(next));navigate(`/?search=${encodeURIComponent(clean)}`);onClose()};
  return <AnimatePresence>{open&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[80] bg-dhk-cream">
    <div className="mx-auto h-full max-w-5xl overflow-y-auto px-4 pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-dhk-cream/95 py-4 backdrop-blur-xl">
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-white"><ArrowLeft size={18}/></button>
        <div className="flex h-12 flex-1 items-center rounded-2xl bg-white px-3 shadow-soft"><Search size={18} className="text-dhk-muted"/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')submit(q)}} className="w-full bg-transparent px-2 outline-none" placeholder="Search 'Paneer Tikka Pizza'"/></div>
        {q&&<button onClick={()=>setQ('')} className="grid h-10 w-10 place-items-center rounded-xl bg-white"><X size={18}/></button>}
      </div>
      {!q&&<div className="space-y-5 pt-3">
        <div><div className="mb-2 flex items-center justify-between"><h3 className="font-display text-lg font-bold">Popular searches</h3></div><div className="flex flex-wrap gap-2">{['Pizza','Paneer','Momos','Mojito','Jain','Bowl'].map(x=><button key={x} onClick={()=>submit(x)} className="rounded-full border border-dhk-line bg-white px-4 py-2 text-sm">{x}</button>)}</div></div>
        {recent.length>0&&<div><div className="mb-2 flex items-center justify-between"><h3 className="font-display text-lg font-bold">Recent</h3><button onClick={()=>{setRecent([]);localStorage.removeItem('dhk-recent-searches')}} className="text-xs font-bold text-dhk-green500">Clear</button></div><div className="space-y-2">{recent.map(x=><button key={x} onClick={()=>submit(x)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-soft"><Clock3 size={16} className="text-dhk-muted"/>{x}</button>)}</div></div>}
      </div>}
      {q&&<div className="pt-3"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-dhk-muted">{results.length} matches</p>{results.length?results.map(i=><button key={i.id} onClick={()=>{submit(q);setTimeout(()=>document.getElementById(`item-${i.id}`)?.scrollIntoView({behavior:'smooth',block:'center'}),50)}} className="flex w-full items-center gap-3 border-b border-dhk-line py-3 text-left"><SmartImage src={i.image} alt={i.name} className="h-16 w-16 shrink-0 rounded-xl"/><div className="min-w-0"><div className="text-xs text-dhk-muted">{categoryById[i.categoryId].name}</div><div className="font-semibold">{highlight(i.name,q)}</div><div className="text-sm font-bold text-dhk-green700">{money(i.price)}</div></div></button>):<div className="rounded-3xl bg-white p-8 text-center shadow-soft"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-dhk-green100"><Search/></div><h3 className="mt-4 font-display text-xl font-bold">No delicious match found.</h3><p className="mt-1 text-sm text-dhk-muted">Try another search.</p></div>}</div>}
    </div>
  </motion.div>}</AnimatePresence>
}

function FilterSheet({open,onClose,state,setState}:{open:boolean;onClose:()=>void;state:any;setState:(v:any)=>void}){
  return <AnimatePresence>{open&&<motion.div className="fixed inset-0 z-[70] bg-black/30" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div onClick={e=>e.stopPropagation()} initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:320,damping:32}} className="absolute inset-x-0 bottom-0 max-h-[86svh] overflow-y-auto rounded-t-[24px] bg-dhk-cream p-5">
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-dhk-line"/>
      <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold">Sort & Filter</h2><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-white"><X size={18}/></button></div>
      <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Sort by</p><div className="mt-2 grid grid-cols-2 gap-2">{['relevance','low','high','best'].map(x=><button key={x} onClick={()=>setState({...state,sort:x})} className={`rounded-xl border px-3 py-3 text-left text-sm ${state.sort===x?'border-dhk-green500 bg-dhk-green100 font-bold':'border-dhk-line bg-white'}`}>{x==='relevance'?'Relevance':x==='low'?'Price: Low to High':x==='high'?'Price: High to Low':'Bestsellers first'}</button>)}</div></div>
      <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Filter</p><div className="mt-2 grid grid-cols-2 gap-2">{[['jain','Jain Only'],['best','Bestsellers Only'],['under150','Under ₹150'],['mid','₹150–₹250'],['over250','Above ₹250']].map(([k,l])=><button key={k} onClick={()=>setState({...state,[k]:!state[k]})} className={`rounded-xl border px-3 py-3 text-left text-sm ${state[k]?'border-dhk-green500 bg-dhk-green100 font-bold':'border-dhk-line bg-white'}`}>{l}</button>)}</div></div>
      <button onClick={()=>setState({sort:'relevance',jain:false,best:false,under150:false,mid:false,over250:false})} className="mt-5 w-full rounded-xl border border-dhk-line bg-white py-3 font-bold">Clear all</button>
      <button onClick={onClose} className="mt-2 w-full rounded-xl bg-dhk-green500 py-3 font-bold text-white">Apply filters</button>
    </motion.div>
  </motion.div>}</AnimatePresence>
}

function CategoryIndex({open,onClose,onJump}:{open:boolean;onClose:()=>void;onJump:(id:string)=>void}){
  return <AnimatePresence>{open&&<motion.div className="fixed inset-0 z-[70] bg-black/30" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div onClick={e=>e.stopPropagation()} initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:320,damping:32}} className="absolute inset-x-0 bottom-0 max-h-[86svh] overflow-y-auto rounded-t-[24px] bg-dhk-cream p-5">
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-dhk-line"/><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold">Browse Menu</h2><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-white"><X size={18}/></button></div>
      <div className="mt-4 space-y-2">{categories.map(c=><button key={c.id} onClick={()=>{onJump(c.id);onClose()}} className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-soft"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-dhk-green100 text-lg">{c.emoji}</span><div><div className="font-semibold">{c.name}</div><div className="text-xs text-dhk-muted">{c.itemCount} items</div></div></div><ChevronRight size={18} className="text-dhk-muted"/></button>)}</div>
    </motion.div>
  </motion.div>}</AnimatePresence>
}

function ItemSheet({item,open,onClose,initialQty=1,onAdded}:{item:MenuItem|null;open:boolean;onClose:()=>void;initialQty?:number;onAdded:(qty:number,note:string)=>void}){
  const [qty,setQty]=useState(initialQty); const [note,setNote]=useState(''); const reduced=useReducedMotion();
  useEffect(()=>{if(open){setQty(initialQty);setNote('')}},[open,initialQty]);
  if(!item) return null;
  return <AnimatePresence>{open&&<motion.div className="fixed inset-0 z-[75] bg-black/35 backdrop-blur-[2px]" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div onClick={e=>e.stopPropagation()} initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:320,damping:32}} drag="y" dragConstraints={{top:0}} dragElastic={.2} onDragEnd={(_,info)=>{if(info.offset.y>120)onClose()}} className="absolute inset-x-0 bottom-0 max-h-[92svh] overflow-y-auto rounded-t-[24px] bg-dhk-cream">
      <div className="relative"><SmartImage src={item.image} alt={item.name} className="h-64 w-full rounded-t-[24px]"/><button onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90"><X size={18}/></button></div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2"><VegMark/>{item.isJain&&<JainBadge/>}{item.isBestseller&&<span className="text-[10px] font-bold uppercase tracking-wider text-dhk-gold">★ Bestseller</span>}</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-dhk-green900">{item.name}</h2>
        <div className="mt-1 flex items-center gap-3"><span className="font-display text-lg font-bold">{money(item.price)}</span><span className="text-xs text-dhk-muted">⏱ {item.prepTimeMins} mins</span></div>
        <p className="mt-3 text-sm leading-6 text-dhk-muted">{item.description}</p>
        <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-dhk-muted">Any special request?</label>
        <textarea value={note} onChange={e=>setNote(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-dhk-line bg-white p-3 outline-none focus:border-dhk-green500" placeholder="e.g. less spicy, no onion"/>
        <div className="mt-4 flex items-center justify-between"><span className="text-sm font-semibold">Quantity</span><div className="flex items-center rounded-xl bg-white shadow-soft"><button onClick={()=>setQty(Math.max(1,qty-1))} className="grid h-11 w-11 place-items-center"><Minus size={17}/></button><span className="w-8 text-center font-bold">{qty}</span><button onClick={()=>setQty(qty+1)} className="grid h-11 w-11 place-items-center"><Plus size={17}/></button></div></div>
        <button onClick={()=>{onAdded(qty,note);onClose()}} className="mt-5 h-12 w-full rounded-2xl bg-dhk-green500 font-bold text-white">ADD ITEM — {money(item.price*qty)}</button>
      </div>
    </motion.div>
  </motion.div>}</AnimatePresence>
}

function RestaurantInfo(){
  const manual=useStore(s=>s.manualOpen); const [now,setNow]=useState(new Date());
  useEffect(()=>{const t=window.setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(t)},[]);
  const h=now.getHours()+now.getMinutes()/60; const open=manual===null?(h>=11&&h<23):manual;
  const maps=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANT_ADDRESS)}`;
  return <section className="rounded-3xl bg-white p-4 shadow-soft">
    <div className="flex items-start gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-dhk-green100"><img src="/assets/logo.png" alt="" className="h-10 w-10 rounded-xl object-cover"/></div><div className="min-w-0 flex-1"><h2 className="font-display text-lg font-bold">DAILY HEALTHY KITCHEN</h2><p className="mt-0.5 text-xs text-dhk-muted">🌿 100% Pure Vegetarian · Fresh • Healthy • Tasty</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${open?'bg-dhk-green100 text-dhk-green700':'bg-red-50 text-dhk-danger'}`}>{open?'OPEN NOW':'CLOSED'}</span></div>
    <div className="mt-4 grid gap-2 text-sm text-dhk-muted sm:grid-cols-2"><div className="flex items-center gap-2"><Clock3 size={16}/><span>11:00 AM – 11:00 PM</span></div><div className="flex items-center gap-2"><MapPin size={16}/><span>Vardhaman Nagar, Malegaon</span></div></div>
    {!open&&<div className="mt-3 rounded-xl bg-dhk-cream px-3 py-2 text-xs font-semibold text-dhk-green900">We're closed right now. Opens at 11:00 AM.</div>}
    <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full border border-dhk-line px-3 py-1 text-[10px] font-bold">Pure Veg</span><span className="rounded-full border border-dhk-line px-3 py-1 text-[10px] font-bold">Jain Available</span><span className="rounded-full border border-dhk-line px-3 py-1 text-[10px] font-bold">Prepaid Only</span><a href={maps} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-dhk-green500"><Navigation size={14}/> Get directions</a></div>
  </section>
}

function Hero(){
  const slides=[
    {title:'Fresh • Healthy • Tasty',sub:'Vegetarian favourites made to order.',img:'https://images.pexels.com/photos/37616287/pexels-photo-37616287.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop'},
    {title:'Good Food • Good Mood',sub:'Paneer, pizzas, wraps, bowls and more.',img:'https://images.pexels.com/photos/30392946/pexels-photo-30392946.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop'},
    {title:'Order Your Favourite Food',sub:'100% pure vegetarian kitchen in Malegaon.',img:'https://images.pexels.com/photos/6544381/pexels-photo-6544381.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop'},
  ];
  const [idx,setIdx]=useState(0); const [drag,setDrag]=useState(0);
  useEffect(()=>{const t=window.setInterval(()=>setIdx(x=>(x+1)%slides.length),5000);return()=>clearInterval(t)},[]);
  return <section className="relative overflow-hidden rounded-[28px] bg-dhk-green900 shadow-float">
    <div className="relative h-[390px] sm:h-[430px]" onPointerDown={e=>setDrag(e.clientX)} onPointerUp={e=>{const dx=e.clientX-drag;if(Math.abs(dx)>50)setIdx(x=>(x+(dx<0?1:-1)+slides.length)%slides.length)}} onTouchStart={e=>setDrag(e.touches[0].clientX)} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-drag;if(Math.abs(dx)>50)setIdx(x=>(x+(dx<0?1:-1)+slides.length)%slides.length)}}>
      <AnimatePresence mode="wait"><motion.div key={idx} initial={{x:'100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{duration:.75,ease:[.22,1,.36,1]}} className="absolute inset-0">
        <SmartImage src={slides[idx].img} alt={slides[idx].title} priority className="h-full w-full"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10"/>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8"><img src="/assets/logo.png" alt="Daily Healthy Kitchen" className="h-16 w-16 rounded-2xl object-cover shadow-xl"/><motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.15}} className="mt-4 max-w-lg font-display text-3xl font-bold leading-tight sm:text-4xl">{slides[idx].title}</motion.h1><motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.25}} className="mt-2 max-w-md text-sm text-white/85">{slides[idx].sub}</motion.p><div className="mt-4 flex gap-2"><a href="#menu" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-dhk-green900">ORDER NOW</a><a href="#contact" className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-bold text-white">CONTACT US</a></div></div>
      </motion.div></AnimatePresence>
      <div className="absolute bottom-5 right-5 flex gap-1.5">{slides.map((_,i)=><button key={i} aria-label={`Slide ${i+1}`} onClick={()=>setIdx(i)} className={`h-1.5 rounded-full transition-all ${i===idx?'w-7 bg-white':'w-2 bg-white/50'}`}/>)}</div>
    </div>
  </section>
}

function FoodSlider(){
  const slides=[
    ['Vegetarian Pizza','https://images.pexels.com/photos/15832906/pexels-photo-15832906.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'],
    ['Paneer Sandwich','https://images.pexels.com/photos/36879181/pexels-photo-36879181.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'],
    ['Healthy Pasta','https://images.pexels.com/photos/18712233/pexels-photo-18712233.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'],
    ['Healthy Momos','https://images.pexels.com/photos/28445587/pexels-photo-28445587.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'],
    ['Healthy Bowl','https://images.pexels.com/photos/20473746/pexels-photo-20473746.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'],
    ['Dessert','https://images.pexels.com/photos/12669167/pexels-photo-12669167.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'],
    ['Coffee & Mint Refreshment','https://images.pexels.com/photos/33129976/pexels-photo-33129976.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'],
  ];
  const [idx,setIdx]=useState(0); const [drag,setDrag]=useState(0);
  useEffect(()=>{const t=window.setInterval(()=>setIdx(x=>(x+1)%slides.length),4200);return()=>clearInterval(t)},[]);
  return <section className="mt-5">
    <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Fresh from our kitchen</h2><span className="text-xs text-dhk-muted">Swipe →</span></div>
    <div className="relative overflow-hidden rounded-3xl shadow-soft" onPointerDown={e=>setDrag(e.clientX)} onPointerUp={e=>{const dx=e.clientX-drag;if(Math.abs(dx)>50)setIdx(x=>(x+(dx<0?1:-1)+slides.length)%slides.length)}} onTouchStart={e=>setDrag(e.touches[0].clientX)} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-drag;if(Math.abs(dx)>50)setIdx(x=>(x+(dx<0?1:-1)+slides.length)%slides.length)}}>
      <AnimatePresence mode="wait"><motion.div key={idx} initial={{x:'100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{duration:.55,ease:[.22,1,.36,1]}} className="relative h-52 sm:h-64"><SmartImage src={slides[idx][1]} alt={slides[idx][0]} className="h-full w-full"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5"><div className="font-display text-xl font-bold text-white">{slides[idx][0]}</div></div></motion.div></AnimatePresence>
      <div className="absolute bottom-3 right-3 flex gap-1.5">{slides.map((_,i)=><button key={i} onClick={()=>setIdx(i)} className={`h-1.5 rounded-full ${i===idx?'w-6 bg-white':'w-2 bg-white/60'}`}/>)}</div>
    </div>
  </section>
}

function CategoryPills({active,onJump}:{active:string;onJump:(id:string)=>void}){
  const ref=useRef<HTMLDivElement>(null);
  return <div ref={ref} className="sticky top-16 z-30 -mx-4 mt-4 overflow-x-auto border-y border-dhk-line bg-dhk-cream/95 px-4 py-2 backdrop-blur-xl no-scrollbar">
    <div className="flex w-max gap-2">{[['all','All'],...categories.map(c=>[c.id,c.name])].map(([id,label])=><button key={id} onClick={()=>onJump(id)} className={`relative whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${active===id?'border-dhk-green500 text-white':'border-dhk-line bg-white text-dhk-muted'}`}>{active===id&&<motion.span layoutId="category-pill" className="absolute inset-0 -z-10 rounded-full bg-dhk-green500"/>}{label}</button>)}</div>
  </div>
}

function BestSellers({onAdd,onBuy,onDetail}:{onAdd:(i:MenuItem)=>void;onBuy:(i:MenuItem)=>void;onDetail:(i:MenuItem)=>void}){
  const overrides=useStore(s=>s.priceOverrides);
  const list=menu.filter(i=>i.isBestseller).slice(0,10);
  return <section className="mt-6"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">🏆 Best Sellers</h2><span className="text-xs text-dhk-muted">Popular from the menu</span></div>
    <div className="mt-3 flex gap-3 overflow-x-auto pb-2 no-scrollbar">{list.map(i=><button key={i.id} onClick={()=>onDetail(i)} className="w-48 shrink-0 overflow-hidden rounded-2xl bg-white text-left shadow-soft">
      <SmartImage src={i.image} alt={i.name} className="h-32 w-full"/><div className="p-3"><div className="flex items-center gap-1"><VegMark/><span className="text-[10px] font-bold uppercase text-dhk-gold">★ Bestseller</span></div><div className="mt-1 line-clamp-1 font-semibold">{i.name}</div><div className="text-xs text-dhk-muted">{categoryById[i.categoryId].name}</div><div className="mt-1 font-display font-bold">{money(priceOf(i,overrides))}</div><div className="mt-2 flex gap-1"><span onClick={e=>{e.stopPropagation();onAdd(i)}} className="flex-1 rounded-lg border border-dhk-green500 py-1.5 text-center text-xs font-bold text-dhk-green500">ADD</span><span onClick={e=>{e.stopPropagation();onBuy(i)}} className="flex-1 rounded-lg bg-dhk-green500 py-1.5 text-center text-xs font-bold text-white">BUY</span></div></div>
    </button>)}</div>
  </section>
}

function MenuRow({item,onDetail,onToast}:{item:MenuItem;onDetail:(i:MenuItem)=>void;onToast:(m:string)=>void}){
  const cart=useStore(s=>s.cart); const add=useStore(s=>s.addToCart); const setQty=useStore(s=>s.setQty); const toggleFav=useStore(s=>s.toggleFavourite); const fav=useStore(s=>s.favourites.includes(item.id));
  const overrides=useStore(s=>s.priceOverrides); const out=useStore(s=>s.outOfStock.includes(item.id)); const q=cart.find(x=>x.itemId===item.id)?.qty||0; const note=cart.find(x=>x.itemId===item.id)?.note||'';
  const price=priceOf(item,overrides);
  return <div id={`item-${item.id}`} onClick={()=>onDetail(item)} className={`relative flex gap-3 border-b border-dhk-line py-4 ${out?'opacity-55':''}`}>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2"><VegMark/>{item.isJain&&<JainBadge/>}{item.isBestseller&&<span className="text-[10px] font-bold uppercase tracking-wider text-dhk-gold">★ Bestseller</span>}</div>
      <div className="mt-1 font-semibold leading-5">{item.serial} · {item.name}</div>
      <div className="mt-1 font-display text-[15px] font-bold">{money(price)}</div>
      <p className="mt-1 line-clamp-2 text-[12.5px] leading-[17px] text-dhk-muted">{item.description}</p>
      <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-dhk-muted"><Clock3 size={13}/>{item.prepTimeMins} mins</div>
      {note&&<div className="mt-2 rounded-lg bg-dhk-cream px-2 py-1 text-[11px] text-dhk-green900">Note: {note}</div>}
    </div>
    <div className="w-[112px] shrink-0">
      <div className="relative"><SmartImage src={item.image} alt={item.name} className="h-28 w-28 rounded-[14px]"/><button onClick={e=>{e.stopPropagation();toggleFav(item.id)}} aria-label="Favourite" className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 ${fav?'text-dhk-danger':'text-dhk-muted'}`}><Heart size={15} fill={fav?'currentColor':'none'}/></button>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">{out?<span className="block whitespace-nowrap rounded-lg bg-stone-700 px-3 py-2 text-[10px] font-bold text-white">Currently unavailable</span>:q>0?<div className="flex h-[34px] w-[92px] items-center justify-between rounded-[10px] bg-dhk-green500 px-2 text-white shadow-soft"><button onClick={e=>{e.stopPropagation();setQty(item.id,q-1)}} className="grid h-8 w-8 place-items-center"><Minus size={14}/></button><motion.span key={q} initial={{scale:1.25}} animate={{scale:1}} className="text-sm font-bold">{q}</motion.span><button onClick={e=>{e.stopPropagation();setQty(item.id,q+1)}} className="grid h-8 w-8 place-items-center"><Plus size={14}/></button></div>:<button onClick={e=>{e.stopPropagation();add(item.id,1);onToast(`${item.name} added to cart`)}} className="h-[34px] w-[92px] rounded-[10px] border border-dhk-green500 bg-white text-xs font-bold text-dhk-green500 shadow-soft active:scale-[.96]">ADD</button>}</div>
      </div>
      <button disabled={out} onClick={e=>{e.stopPropagation();useStore.getState().addToCart(item.id,q||1);window.location.href='/checkout'}} className="mt-5 w-full text-center text-[12px] font-bold text-dhk-green500 disabled:text-stone-400">BUY NOW</button>
    </div>
  </div>
}

function MenuSection({cat,onDetail,onToast,search,filters}:{cat:any;onDetail:(i:MenuItem)=>void;onToast:(m:string)=>void;search:string;filters:any}){
  const overrides=useStore(s=>s.priceOverrides);
  let list=menu.filter(i=>i.categoryId===cat.id);
  if(search) list=list.filter(i=>fuzzy(search,[i.name,cat.name,...i.keywords].join(' ')));
  if(filters.jain) list=list.filter(i=>i.isJain);
  if(filters.best) list=list.filter(i=>i.isBestseller);
  if(filters.under150) list=list.filter(i=>priceOf(i,overrides)<150);
  if(filters.mid) list=list.filter(i=>priceOf(i,overrides)>=150&&priceOf(i,overrides)<=250);
  if(filters.over250) list=list.filter(i=>priceOf(i,overrides)>250);
  if(filters.sort==='low') list=[...list].sort((a,b)=>priceOf(a,overrides)-priceOf(b,overrides));
  if(filters.sort==='high') list=[...list].sort((a,b)=>priceOf(b,overrides)-priceOf(a,overrides));
  if(filters.sort==='best') list=[...list].sort((a,b)=>Number(b.isBestseller)-Number(a.isBestseller));
  if(!list.length) return null;
  return <section id={`cat-${cat.id}`} data-category={cat.id} className="scroll-mt-32 rounded-3xl bg-white p-3 shadow-soft sm:p-4">
    <div className="relative overflow-hidden rounded-2xl"><SmartImage src={cat.bannerImage} alt={cat.name} className="h-44 w-full sm:h-56"/><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/><div className="absolute bottom-0 left-0 p-4 text-white"><div className="font-display text-2xl font-bold">{cat.emoji} {cat.name}</div><div className="text-xs text-white/80">{cat.itemCount} items</div></div></div>
    <p className="px-2 py-3 text-sm text-dhk-muted">{cat.description}</p>
    {list.map(i=><MenuRow key={i.id} item={i} onDetail={onDetail} onToast={onToast}/>)}
  </section>
}

function HomePage(){
  const [searchOpen,setSearchOpen]=useState(false); const [detail,setDetail]=useState<MenuItem|null>(null); const [indexOpen,setIndexOpen]=useState(false); const [filterOpen,setFilterOpen]=useState(false);
  const [active,setActive]=useState('all'); const [filters,setFilters]=useState<any>({sort:'relevance',jain:false,best:false,under150:false,mid:false,over250:false});
  const [search,setSearch]=useState(''); const {toast,show}=useToast(); const navigate=useNavigate(); const location=useLocation();
  const add=useStore(s=>s.addToCart);
  useEffect(()=>{const p=new URLSearchParams(location.search);setSearch(p.get('search')||'')},[location.search]);
  useEffect(()=>{
    const els=Array.from(document.querySelectorAll<HTMLElement>('[data-category]'));
    const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.getAttribute('data-category')||'all')}),{rootMargin:'-25% 0px -65% 0px'});
    els.forEach(e=>ob.observe(e)); return()=>ob.disconnect();
  },[search,filters]);
  const jump=(id:string)=>{if(id==='all'){window.scrollTo({top:0,behavior:'smooth'});setActive('all');return}document.getElementById(`cat-${id}`)?.scrollIntoView({behavior:'smooth',block:'start'});setActive(id)};
  const filteredCount=Object.values(filters).filter(Boolean).length;
  return <div>
    <Header onSearch={()=>setSearchOpen(true)}/>
    <main className="mx-auto max-w-5xl px-4 pb-40 pt-4">
      <Hero/>
      <FoodSlider/>
      <div className="mt-5"><RestaurantInfo/></div>
      <section className="mt-5"><div className="flex gap-2"><button onClick={()=>setSearchOpen(true)} className="flex h-12 flex-1 items-center gap-2 rounded-2xl border border-dhk-line bg-white px-4 text-left text-sm text-dhk-muted shadow-soft"><Search size={18}/> {search||"Looking for something delicious?"}</button><button onClick={()=>setFilterOpen(true)} className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft"><SlidersHorizontal size={18}/>{filteredCount>0&&<span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-dhk-green500 text-[10px] font-bold text-white">{filteredCount}</span>}</button></div></section>
      <CategoryPills active={active} onJump={jump}/>
      <BestSellers onAdd={i=>{add(i.id,1);show(`${i.name} added to cart`)}} onBuy={i=>{add(i.id,1);navigate('/checkout')}} onDetail={setDetail}/>
      <section id="menu" className="mt-6 space-y-5">
        {categories.map(c=><MenuSection key={c.id} cat={c} onDetail={setDetail} onToast={show} search={search} filters={filters}/>)}
      </section>
      <section id="contact" className="mt-6 rounded-3xl bg-dhk-green900 p-6 text-white shadow-float"><div className="flex items-center gap-3"><img src="/assets/logo.png" alt="Daily Healthy Kitchen" className="h-14 w-14 rounded-2xl object-cover"/><div><h2 className="font-display text-2xl font-bold">DAILY HEALTHY KITCHEN</h2><p className="text-sm text-white/75">100% Pure Vegetarian · Fresh • Healthy • Tasty</p></div></div><div className="mt-5 space-y-2 text-sm text-white/80"><div className="flex gap-2"><MapPin size={17}/><span>{RESTAURANT_ADDRESS}</span></div><div className="flex gap-2"><Clock3 size={17}/><span>11:00 AM to 11:00 PM</span></div></div><div className="mt-5 flex flex-wrap gap-2"><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-dhk-green900"><MessageCircle size={17}/> CONTACT ON WHATSAPP</a><a href={INSTAGRAM} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 text-sm font-bold"><AtSign size={17}/> FOLLOW ON INSTAGRAM</a></div></section>
      <p className="mt-5 text-center text-xs text-dhk-muted">Prepaid orders only · No automatic payment verification is claimed · © Daily Healthy Kitchen</p>
    </main>
    <button onClick={()=>setIndexOpen(true)} className="fixed bottom-[142px] right-4 z-35 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold text-dhk-green900 shadow-float"><MenuIcon size={15}/> MENU</button>
    <BottomNav/><CartBar onOpen={()=>navigate('/checkout')}/>
    <SearchOverlay open={searchOpen} onClose={()=>setSearchOpen(false)}/><FilterSheet open={filterOpen} onClose={()=>setFilterOpen(false)} state={filters} setState={setFilters}/><CategoryIndex open={indexOpen} onClose={()=>setIndexOpen(false)} onJump={jump}/>
    <ItemSheet item={detail} open={!!detail} onClose={()=>setDetail(null)} onAdded={(qty,note)=>{if(detail){add(detail.id,qty,note);show(`${detail.name} added to cart`)}}}/>
    {toast&&<Toast {...toast}/>}
  </div>
}

function Toast({msg,type}:{msg:string;type:'success'|'error'}){return <motion.div initial={{opacity:0,y:-15}} animate={{opacity:1,y:0}} exit={{opacity:0}} className={`fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-float ${type==='success'?'bg-dhk-green900':'bg-dhk-danger'}`}><span className="mr-2 inline-flex">{type==='success'?<Check size={16}/>:<AlertCircle size={16}/>}</span>{msg}</motion.div>}

function Bill({coupon,setCoupon}:{coupon:string;setCoupon:(v:string)=>void}){
  const cart=useStore(s=>s.cart); const overrides=useStore(s=>s.priceOverrides);
  const itemTotal=cart.reduce((a,x)=>a+priceOf(menuById[x.itemId],overrides)*x.qty,0);
  const [applied,setApplied]=useState(''); const [msg,setMsg]=useState('');
  const packaging=cart.length?15:0; const delivery=itemTotal>=399?0:30; const gst=Math.round(itemTotal*.05);
  let discount=0;
  if(applied==='DHK10'&&itemTotal>=300) discount=Math.min(60,Math.round(itemTotal*.10));
  if(applied==='FIRST50'&&itemTotal>0) discount=50;
  if(applied==='FREEDEL'&&itemTotal>=399) discount=delivery;
  const total=Math.max(0,itemTotal+packaging+delivery+gst-discount);
  useEffect(()=>{setCoupon(applied)},[applied,setCoupon]);
  return <div className="rounded-2xl bg-white p-4 shadow-soft"><div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">Offers & bill</h3>{discount>0&&<span className="text-xs font-bold text-dhk-green500">You saved {money(discount)}</span>}</div>
    <div className="mt-3 flex gap-2"><input value={applied||coupon} onChange={e=>setApplied(e.target.value.toUpperCase())} className="h-11 flex-1 rounded-xl border border-dhk-line bg-dhk-cream px-3 text-sm outline-none" placeholder="Coupon code"/><button onClick={()=>{if(['DHK10','FIRST50','FREEDEL'].includes(applied))setMsg('Coupon applied');else setMsg('Check the offer code and minimum order.')}} className="rounded-xl bg-dhk-green500 px-4 text-sm font-bold text-white">APPLY</button></div>
    {msg&&<div className="mt-2 text-xs font-semibold text-dhk-green700">{msg}</div>}
    <div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span>Item Total</span><b>{money(itemTotal)}</b></div><div className="flex justify-between text-dhk-muted"><span>Restaurant Packaging</span><span>{money(packaging)}</span></div><div className="flex justify-between text-dhk-muted"><span>Delivery Fee</span><span>{money(delivery)}</span></div><div className="flex justify-between text-dhk-muted"><span>GST & Charges (5%)</span><span>{money(gst)}</span></div>{discount>0&&<div className="flex justify-between text-dhk-green500"><span>Coupon Discount</span><span>−{money(discount)}</span></div>}<div className="border-t border-dhk-line pt-3 flex justify-between font-display text-lg font-bold"><span>TO PAY</span><span>{money(total)}</span></div></div>
    <p className="mt-2 text-[11px] text-dhk-muted">Prices inclusive as shown. Prepaid orders only.</p>
    <div className="mt-3 flex flex-wrap gap-2 text-[11px]"><button onClick={()=>setApplied('DHK10')} className="rounded-lg bg-dhk-green100 px-2 py-1 font-bold">DHK10 · 10% above ₹300</button><button onClick={()=>setApplied('FIRST50')} className="rounded-lg bg-dhk-green100 px-2 py-1 font-bold">FIRST50 · ₹50</button><button onClick={()=>setApplied('FREEDEL')} className="rounded-lg bg-dhk-green100 px-2 py-1 font-bold">FREEDEL · above ₹399</button></div>
    <BillValue value={total} itemTotal={itemTotal} packaging={packaging} delivery={delivery} gst={gst} discount={discount} applied={applied}/>
  </div>
}
function BillValue({value,itemTotal,packaging,delivery,gst,discount,applied}:{value:number;itemTotal:number;packaging:number;delivery:number;gst:number;discount:number;applied:string}){return <div data-bill={JSON.stringify({value,itemTotal,packaging,delivery,gst,discount,applied})} className="hidden"/>}

function AddressBook({selected,setSelected}:{selected:string;setSelected:(id:string)=>void}){
  const addresses=useStore(s=>s.addresses); const add=useStore(s=>s.addAddress); const update=useStore(s=>s.updateAddress); const remove=useStore(s=>s.deleteAddress);
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<Address|null>(null);
  const empty:Address={id:'',label:'HOME',name:useStore.getState().name,phone:useStore.getState().phone,flat:'',area:'',landmark:'',pincode:'',isDefault:false};
  const [form,setForm]=useState<Address>(empty);
  const start=(a?:Address)=>{setForm(a||{...empty,id:crypto.randomUUID()});setOpen(true)};
  const save=()=>{if(!form.name.trim()||!/^\d{10}$/.test(form.phone)||!form.flat.trim()||!form.area.trim()||!/^\d{6}$/.test(form.pincode)){return} ; (addresses.some(a=>a.id===form.id)?update:add)(form);setSelected(form.id);setOpen(false)};
  return <div className="rounded-2xl bg-white p-4 shadow-soft"><div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">Delivery details</h3><button onClick={()=>start()} className="text-xs font-bold text-dhk-green500">+ Add new address</button></div>
    <div className="mt-3 space-y-2">{addresses.map(a=><div key={a.id} className={`rounded-2xl border p-3 ${selected===a.id?'border-dhk-green500 bg-dhk-green100':'border-dhk-line'}`}><div className="flex items-start justify-between"><button onClick={()=>setSelected(a.id)} className="flex flex-1 text-left gap-2"><span className="mt-1 h-4 w-4 rounded-full border-2 border-dhk-green500 p-[2px]">{selected===a.id&&<span className="block h-full w-full rounded-full bg-dhk-green500"/>}</span><span><b>{a.label}</b><span className="ml-2 text-xs text-dhk-muted">{a.name} · {a.phone}</span><span className="mt-1 block text-xs text-dhk-muted">{a.flat}, {a.area}, {a.landmark}, {a.pincode}</span></span></button><div className="flex gap-1"><button onClick={()=>start(a)} className="grid h-8 w-8 place-items-center rounded-lg bg-white"><Pencil size={14}/></button><button onClick={()=>remove(a.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-white text-dhk-danger"><Trash2 size={14}/></button></div></div></div>)}</div>
    {open&&<div className="mt-4 rounded-2xl border border-dhk-line bg-dhk-cream p-4"><div className="grid grid-cols-2 gap-2">{[['name','Name'],['phone','Phone (10 digits)'],['flat','Flat / House'],['area','Area / Locality'],['landmark','Landmark'],['pincode','Pincode (6 digits)']].map(([k,l])=><label key={k} className="text-xs font-bold text-dhk-muted">{l}<input value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} inputMode={k==='phone'||k==='pincode'?'numeric':'text'} className="mt-1 h-10 w-full rounded-xl border border-dhk-line bg-white px-2 text-sm font-normal outline-none"/></label>)}</div><label className="mt-2 block text-xs font-bold text-dhk-muted">Label<select value={form.label} onChange={e=>setForm({...form,label:e.target.value as any})} className="mt-1 h-10 w-full rounded-xl border border-dhk-line bg-white px-2 text-sm font-normal"><option>HOME</option><option>WORK</option><option>OTHER</option></select></label><div className="mt-3 flex gap-2"><button onClick={()=>setOpen(false)} className="flex-1 rounded-xl border border-dhk-line bg-white py-2.5 font-bold">Cancel</button><button onClick={save} className="flex-1 rounded-xl bg-dhk-green500 py-2.5 font-bold text-white">Save address</button></div></div>}
  </div>
}

function CheckoutPage(){
  const cart=useStore(s=>s.cart); const name=useStore(s=>s.name); const storePhone=useStore(s=>s.phone); const setPhone=useStore(s=>s.setPhone);
  const overrides=useStore(s=>s.priceOverrides); const navigate=useNavigate(); const [coupon,setCoupon]=useState(''); const [selectedAddress,setSelectedAddress]=useState(''); const [location,setLocation]=useState('Malegaon, Maharashtra'); const [openSheet,setOpenSheet]=useState(false);
  const [customer,setCustomer]=useState({name,phone:storePhone,location,fullAddress:RESTAURANT_ADDRESS,landmark:'Above SKY Bakery House',pincode:PINCODE});
  const [error,setError]=useState('');
  const itemTotal=cart.reduce((a,x)=>a+priceOf(menuById[x.itemId],overrides)*x.qty,0); const packaging=cart.length?15:0; const delivery=itemTotal>=399?0:30; const gst=Math.round(itemTotal*.05);
  let discount=0; if(coupon==='DHK10'&&itemTotal>=300)discount=Math.min(60,Math.round(itemTotal*.1)); if(coupon==='FIRST50')discount=50; if(coupon==='FREEDEL'&&itemTotal>=399)discount=delivery;
  const total=Math.max(0,itemTotal+packaging+delivery+gst-discount);
  const maxPrep=cart.length?Math.max(...cart.map(x=>menuById[x.itemId].prepTimeMins)):0; const eta=`${maxPrep+15}–${maxPrep+25} mins`;
  useEffect(()=>{if(!cart.length)navigate('/')},[cart.length,navigate]);
  useEffect(()=>{setCustomer(c=>({...c,name,phone:storePhone,location}))},[name,storePhone,location]);
  const proceed=()=>{if(!customer.name.trim()||!/^\d{10}$/.test(customer.phone)||!customer.location.trim()||!customer.fullAddress.trim()||!/^\d{6}$/.test(customer.pincode)){setError('Please complete name, 10-digit phone, location, full address and 6-digit pincode.');return}setPhone(customer.phone);localStorage.setItem('dhk-checkout-customer',JSON.stringify(customer));localStorage.setItem('dhk-checkout-bill',JSON.stringify({itemTotal,packaging,delivery,gst,discount,total,coupon,eta}));navigate('/payment')};
  return <div><Header onSearch={()=>navigate('/')}/><main className="mx-auto max-w-2xl px-4 pb-32 pt-5"><button onClick={()=>navigate('/')} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-dhk-green500"><ArrowLeft size={16}/> Back to menu</button><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Your cart</p><h1 className="font-display text-3xl font-bold">Order summary</h1></div><span className="text-sm font-semibold text-dhk-muted">{cart.reduce((a,x)=>a+x.qty,0)} items</span></div>
    <div className="mt-4 space-y-2">{cart.map(line=>{const i=menuById[line.itemId];return <div key={i.id} className="rounded-2xl bg-white p-3 shadow-soft"><div className="flex gap-3"><SmartImage src={i.image} alt={i.name} className="h-20 w-20 shrink-0 rounded-xl"/><div className="min-w-0 flex-1"><div className="font-semibold">{i.name}</div><div className="mt-1 text-xs text-dhk-muted">{money(priceOf(i,overrides))} each</div>{line.note&&<div className="mt-1 text-[11px] text-dhk-green700">Note: {line.note}</div>}<div className="mt-2 flex items-center justify-between"><div className="flex items-center rounded-xl bg-dhk-cream"><button onClick={()=>useStore.getState().setQty(i.id,line.qty-1)} className="grid h-9 w-9 place-items-center"><Minus size={14}/></button><span className="w-7 text-center text-sm font-bold">{line.qty}</span><button onClick={()=>useStore.getState().setQty(i.id,line.qty+1)} className="grid h-9 w-9 place-items-center"><Plus size={14}/></button></div><b>{money(priceOf(i,overrides)*line.qty)}</b></div></div></div></div>})}</div>
    <div className="mt-4"><Bill coupon={coupon} setCoupon={setCoupon}/></div>
    <div className="mt-4"><AddressBook selected={selectedAddress} setSelected={setSelectedAddress}/></div>
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft"><h3 className="font-display text-lg font-bold">Customer details</h3><div className="mt-3 grid grid-cols-2 gap-2">{[['name','Name'],['phone','Phone Number'],['location','Location'],['pincode','Pincode']].map(([k,l])=><label key={k} className="text-xs font-bold text-dhk-muted">{l}<input value={(customer as any)[k]} onChange={e=>setCustomer({...customer,[k]:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-dhk-line bg-dhk-cream px-3 text-sm font-normal outline-none"/></label>)}</div><label className="mt-2 block text-xs font-bold text-dhk-muted">Full Delivery Address<textarea value={customer.fullAddress} onChange={e=>setCustomer({...customer,fullAddress:e.target.value})} className="mt-1 min-h-24 w-full rounded-xl border border-dhk-line bg-dhk-cream p-3 text-sm font-normal"/></label><label className="mt-2 block text-xs font-bold text-dhk-muted">Landmark<input value={customer.landmark} onChange={e=>setCustomer({...customer,landmark:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-dhk-line bg-dhk-cream px-3 text-sm font-normal"/></label></div>
    {error&&<div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-dhk-danger">{error}</div>}
    <div className="sticky bottom-2 mt-5 flex items-center justify-between rounded-2xl bg-dhk-green900 p-3 text-white shadow-float"><div><div className="text-[10px] font-bold opacity-70">TO PAY</div><div className="font-display text-xl font-bold">{money(total)}</div></div><button onClick={proceed} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-dhk-green900">PROCEED TO PAY <ArrowRight size={15} className="ml-1 inline"/></button></div>
    <p className="mt-3 text-center text-xs text-dhk-muted">ETA: Arriving in {eta}. Prepaid orders only.</p>
  </main><BottomNav/></div>
}

function PaymentPage(){
  const navigate=useNavigate(); const cart=useStore(s=>s.cart); const overrides=useStore(s=>s.priceOverrides); const addOrder=useStore(s=>s.addOrder); const [utr,setUtr]=useState(''); const [seconds,setSeconds]=useState(600); const [config,setConfig]=useState<{upiId:string}>({upiId:''}); const [error,setError]=useState('');
  const customer=JSON.parse(localStorage.getItem('dhk-checkout-customer')||'{}'); const bill=JSON.parse(localStorage.getItem('dhk-checkout-bill')||'{}');
  useEffect(()=>{fetch('/api/config').then(r=>r.json()).then(setConfig).catch(()=>{});},[]);
  useEffect(()=>{const t=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>clearInterval(t)},[]);
  const valid=/^[A-Za-z0-9]{6,}$/.test(utr.trim());
  const submit=()=>{
    if(!valid){setError('Enter a valid UTR / reference number (at least 6 letters or digits).');return}
    const id=`DHK-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    const lines=cart.map(x=>{const i=menuById[x.itemId];return {itemId:i.id,qty:x.qty,note:x.note,name:i.name,price:priceOf(i,overrides),image:i.image,subtotal:priceOf(i,overrides)*x.qty,isJain:i.isJain}});
    const o:Order={id,createdAt:new Date().toISOString(),lines,customer,bill,paymentRef:utr.trim(),paymentStatus:'Payment Submitted',orderStatus:'Payment Submitted',eta:bill.eta||'30–40 mins'};
    addOrder(o); localStorage.setItem('dhk-last-order',JSON.stringify(o)); navigate(`/success/${id}`);
  };
  const mins=Math.floor(seconds/60).toString().padStart(2,'0'), secs=(seconds%60).toString().padStart(2,'0');
  const upi=config.upiId?`upi://pay?pa=${encodeURIComponent(config.upiId)}&pn=${encodeURIComponent('Daily Healthy Kitchen')}&am=${bill.total||0}&cu=INR`:'';
  return <div><Header onSearch={()=>{}}/><main className="mx-auto max-w-2xl px-4 pb-32 pt-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Step 2 of 3</p><h1 className="font-display text-3xl font-bold">Scan & Pay</h1></div><div className="text-right"><div className="font-display text-2xl font-bold">{money(bill.total||0)}</div><button onClick={()=>navigator.clipboard?.writeText(String(bill.total||0))} className="text-xs font-bold text-dhk-green500"><Copy size={13} className="mr-1 inline"/> Copy amount</button></div></div>
    <div className="flex items-center gap-2 text-xs font-bold text-dhk-green700"><span className="rounded-full bg-dhk-green100 px-3 py-1">Cart ✓</span><span>→</span><span className="rounded-full bg-dhk-green500 px-3 py-1 text-white">Payment</span><span>→</span><span className="rounded-full border border-dhk-line bg-white px-3 py-1 text-dhk-muted">Confirmed</span></div>
    <div className="mt-5 rounded-3xl bg-white p-5 text-center shadow-soft"><p className="text-sm font-semibold">Pay the exact amount shown above</p><div className="relative mx-auto mt-4 max-w-[330px] overflow-hidden rounded-2xl border border-dhk-line bg-white p-3"><img src="/assets/payment-qr.jpg" alt="Uploaded Daily Healthy Kitchen payment QR" className="mx-auto aspect-square w-full object-contain"/><motion.div animate={{y:['-100%','100%']}} transition={{duration:2.4,repeat:Infinity,ease:'linear'}} className="pointer-events-none absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-dhk-green300/30 to-transparent"/></div><div className="mt-3 text-xs text-dhk-muted">This is the real uploaded payment QR. A static QR does not automatically verify bank payment.</div>{upi&&<a href={upi} className="mt-3 inline-flex rounded-xl bg-dhk-green100 px-4 py-2 text-xs font-bold text-dhk-green700">OPEN UPI APP</a>}</div>
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft"><div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">Payment reference / UTR</h3><span className="text-xs font-bold text-dhk-muted">{mins}:{secs}</span></div><input value={utr} onChange={e=>setUtr(e.target.value.replace(/\s/g,''))} className={`mt-3 h-12 w-full rounded-xl border bg-dhk-cream px-3 outline-none ${utr&&!valid?'border-dhk-danger':'border-dhk-line'}`} placeholder="Enter payment reference number"/><p className="mt-2 text-xs text-dhk-muted">You'll find this as UTR / Reference No. in your UPI app.</p>{error&&<p className="mt-2 text-xs font-semibold text-dhk-danger">{error}</p>}<button disabled={!valid} onClick={submit} className="mt-4 h-12 w-full rounded-2xl bg-dhk-green500 font-bold text-white disabled:opacity-40">I HAVE PAID</button><p className="mt-2 text-center text-[11px] text-dhk-muted">Payment will be submitted for restaurant verification; it is not marked automatically as verified.</p></div>
  </main><BottomNav/></div>
}

function Confetti(){const pieces=Array.from({length:24},(_,i)=>i);return <div className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">{pieces.map(i=><motion.span key={i} initial={{x:'50vw',y:'40vh',opacity:1,scale:1}} animate={{x:`calc(50vw + ${(i%8-4)*50}px)`,y:`${20+(i*31)%70}vh`,opacity:0,rotate:360}} transition={{duration:1.8,delay:i*.02}} className="absolute h-2 w-2 rounded-sm bg-dhk-green500"/>)}</div>}
function SuccessPage(){
  const {id}=useParams(); const navigate=useNavigate(); const order=useStore(s=>s.orders.find(o=>o.id===id)); const [copied,setCopied]=useState(false);
  if(!order)return <Navigate to="/orders" replace/>;
  const message=makeWhatsAppMessage(order);
  return <div><Header onSearch={()=>{}}/><main className="mx-auto max-w-2xl px-4 pb-32 pt-10 text-center"><Confetti/><motion.div initial={{scale:.7,opacity:0}} animate={{scale:1,opacity:1}} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-dhk-green100 text-dhk-green500"><Check size={48} strokeWidth={3}/></motion.div><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-dhk-green500">Congratulations!</p><h1 className="mt-2 font-display text-4xl font-bold text-dhk-green900">ORDER DONE</h1><p className="mt-2 text-sm text-dhk-muted">Payment submitted. Our team will verify it and confirm your order shortly.</p>
    <div className="mt-6 rounded-3xl border-2 border-dashed border-dhk-green300 bg-white p-5 text-left shadow-soft"><div className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Order ID</div><div className="mt-1 flex items-center justify-between font-display text-2xl font-bold">{order.id}<button onClick={()=>{navigator.clipboard?.writeText(order.id);setCopied(true);setTimeout(()=>setCopied(false),1500)}} className="grid h-9 w-9 place-items-center rounded-xl bg-dhk-green100 text-dhk-green700">{copied?<Check size={16}/>:<Copy size={16}/>}</button></div><div className="mt-4 grid gap-2 text-sm"><div><b>{order.customer.name}</b> · {order.customer.phone}</div><div className="text-dhk-muted">{order.customer.fullAddress}</div><div className="text-dhk-muted">UTR: {order.paymentRef}</div><div className="text-dhk-muted">ETA: {order.eta}</div><div className="font-bold">Total: {money(order.bill.total)}</div></div></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3"><button onClick={()=>navigate(`/orders/${order.id}`)} className="rounded-xl bg-dhk-green500 py-3 text-sm font-bold text-white">TRACK ORDER</button><a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="rounded-xl border border-dhk-green500 bg-white py-3 text-sm font-bold text-dhk-green500">SEND ON WHATSAPP</a><button onClick={()=>navigate('/')} className="rounded-xl border border-dhk-line bg-white py-3 text-sm font-bold">BACK TO HOME</button></div>
  </main><BottomNav/></div>
}
function makeWhatsAppMessage(o:Order){
  const lines=o.lines.map((x,i)=>`${i+1}. ${x.name}\nQuantity: ${x.qty}\nPrice: ${money(x.price)}\nSubtotal: ${money(x.subtotal)}${x.note?`\nSpecial instruction: ${x.note}`:''}`).join('\n\n');
  return `DAILY HEALTHY KITCHEN\nNEW ORDER\n\nOrder ID: ${o.id}\nCustomer Name: ${o.customer.name}\nPhone: ${o.customer.phone}\nLocation: ${o.customer.location}\nAddress: ${o.customer.fullAddress}\nLandmark: ${o.customer.landmark}\nPincode: ${o.customer.pincode}\nAddress Label: ${o.customer.addressLabel||'OTHER'}\n\nORDER ITEMS:\n${lines}\n\nITEM TOTAL: ${money(o.bill.itemTotal)}\nPackaging: ${money(o.bill.packaging)}\nDelivery: ${money(o.bill.delivery)}\nGST & Charges: ${money(o.bill.gst)}\nCoupon: ${o.bill.coupon||'None'}\nDiscount: ${money(o.bill.discount)}\nTOTAL: ${money(o.bill.total)}\n\nPAYMENT: Prepaid\nPayment Reference: ${o.paymentRef}\nPayment Status: ${o.paymentStatus}\nORDER STATUS: ${o.orderStatus}\nETA: ${o.eta}`;
}

function OrdersPage(){
  const orders=useStore(s=>s.orders); const navigate=useNavigate();
  return <div><Header onSearch={()=>navigate('/')}/><main className="mx-auto max-w-2xl px-4 pb-32 pt-6"><p className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Your history</p><h1 className="font-display text-3xl font-bold">My orders</h1>{!orders.length?<div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-soft"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-dhk-green100"><Package/></div><h2 className="mt-4 font-display text-xl font-bold">No orders yet.</h2><p className="mt-1 text-sm text-dhk-muted">Your delicious journey starts here.</p><button onClick={()=>navigate('/')} className="mt-5 rounded-xl bg-dhk-green500 px-5 py-3 text-sm font-bold text-white">BROWSE MENU</button></div>:<div className="mt-4 space-y-3">{orders.map(o=><div key={o.id} className="rounded-3xl bg-white p-4 shadow-soft"><div className="flex items-start justify-between gap-3"><div><div className="font-display text-lg font-bold">{o.id}</div><div className="text-xs text-dhk-muted">{new Date(o.createdAt).toLocaleString('en-IN')}</div></div><span className="rounded-full bg-dhk-green100 px-2.5 py-1 text-[10px] font-bold text-dhk-green700">{o.orderStatus}</span></div><div className="mt-3 flex -space-x-2">{o.lines.slice(0,4).map(x=><img key={x.itemId} src={x.image} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover"/>)}</div><div className="mt-2 text-sm text-dhk-muted">{o.lines.reduce((a,x)=>a+x.qty,0)} items · {money(o.bill.total)} · {o.paymentStatus}</div><div className="mt-3 flex gap-2"><button onClick={()=>navigate(`/orders/${o.id}`)} className="flex-1 rounded-xl bg-dhk-green500 py-2.5 text-sm font-bold text-white">VIEW ORDER</button><button onClick={()=>{o.lines.forEach(x=>useStore.getState().addToCart(x.itemId,x.qty,x.note));navigate('/checkout')}} className="rounded-xl border border-dhk-line px-4 py-2.5 text-sm font-bold">REORDER</button></div></div>)}</div>}</main><BottomNav/></div>
}

function OrderDetailPage(){
  const {id}=useParams(); const order=useStore(s=>s.orders.find(o=>o.id===id)); const navigate=useNavigate();
  if(!order)return <Navigate to="/orders" replace/>;
  const steps=['Payment Submitted','Order Confirmed','Preparing','Out for Delivery','Delivered']; const idx=Math.max(0,steps.indexOf(order.orderStatus));
  return <div><Header onSearch={()=>navigate('/')}/><main className="mx-auto max-w-2xl px-4 pb-32 pt-6"><button onClick={()=>navigate('/orders')} className="inline-flex items-center gap-2 text-sm font-bold text-dhk-green500"><ArrowLeft size={16}/> My orders</button><div className="mt-4 rounded-3xl bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Order ID</div><h1 className="font-display text-2xl font-bold">{order.id}</h1></div><span className="rounded-full bg-dhk-green100 px-3 py-1 text-xs font-bold text-dhk-green700">{order.paymentStatus}</span></div><div className="mt-5 space-y-0">{steps.map((s,i)=><div key={s} className="relative flex gap-3 pb-5"><div className="flex flex-col items-center"><div className={`grid h-7 w-7 place-items-center rounded-full ${i<=idx?'bg-dhk-green500 text-white':'bg-stone-100 text-stone-400'}`}>{i<idx?<Check size={14}/>:<span className="h-2 w-2 rounded-full bg-current"/>}</div>{i<steps.length-1&&<div className={`mt-1 w-0.5 flex-1 ${i<idx?'bg-dhk-green500':'bg-stone-200'}`}/>}</div><div><div className={`font-semibold ${i===idx?'text-dhk-green700':''}`}>{s}</div><div className="text-xs text-dhk-muted">{i<=idx?new Date(new Date(order.createdAt).getTime()+i*3*60000).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'Upcoming'}</div>{i===idx&&<div className="mt-1 text-xs text-dhk-muted">{s==='Preparing'?'Our kitchen is on it.':'We are processing your order.'}</div>}</div></div>)}</div></div>
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft"><h2 className="font-display text-lg font-bold">Items</h2>{order.lines.map(x=><div key={x.itemId} className="flex items-center justify-between border-b border-dhk-line py-3 text-sm"><div><div className="font-semibold">{x.name} × {x.qty}</div>{x.note&&<div className="text-xs text-dhk-muted">{x.note}</div>}</div><b>{money(x.subtotal)}</b></div>)}<div className="mt-3 flex justify-between font-display text-lg font-bold"><span>Total</span><span>{money(order.bill.total)}</span></div><div className="mt-2 text-xs text-dhk-muted">{order.customer.fullAddress}</div></div>
  </main><BottomNav/></div>
}

function AccountPage(){
  const store=useStore(); const [editing,setEditing]=useState(false); const [name,setName]=useState(store.name); const spent=store.orders.reduce((a,o)=>a+o.bill.total,0);
  return <div><Header onSearch={()=>{}}/><main className="mx-auto max-w-2xl px-4 pb-32 pt-6"><div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-soft"><div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-dhk-green300 to-dhk-green900 font-display text-2xl font-bold text-white">{(store.name||'D').charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="text-xs font-bold uppercase tracking-wider text-dhk-muted">Account</div>{editing?<input autoFocus value={name} onChange={e=>setName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-dhk-line bg-dhk-cream px-3 outline-none"/>:<h1 className="font-display text-2xl font-bold">{store.name||'Customer'}</h1>}<div className="text-xs text-dhk-muted">{store.phone||'Phone not saved'}</div></div><button onClick={()=>{if(editing){store.setName(name.trim()||store.name);setEditing(false)}else setEditing(true)}} className="grid h-10 w-10 place-items-center rounded-xl bg-dhk-green100 text-dhk-green700"><Pencil size={16}/></button></div>
    <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4 shadow-soft"><div className="text-xs text-dhk-muted">Total orders</div><div className="mt-1 font-display text-2xl font-bold">{store.orders.length}</div></div><div className="rounded-2xl bg-white p-4 shadow-soft"><div className="text-xs text-dhk-muted">Total spent</div><div className="mt-1 font-display text-2xl font-bold">{money(spent)}</div></div></div>
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Preferences</h2><p className="text-xs text-dhk-muted">Prioritise Jain choices in future browsing.</p></div><button onClick={()=>store.setShowJainFirst(!store.showJainFirst)} className={`h-7 w-12 rounded-full p-1 ${store.showJainFirst?'bg-dhk-green500':'bg-stone-200'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${store.showJainFirst?'translate-x-5':''}`}/></button></div></div>
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft"><h2 className="font-display text-lg font-bold">Saved addresses</h2>{store.addresses.length?<div className="mt-2 space-y-2">{store.addresses.map(a=><div key={a.id} className="rounded-xl bg-dhk-cream p-3"><b>{a.label}</b><div className="text-xs text-dhk-muted">{a.flat}, {a.area}, {a.landmark}, {a.pincode}</div></div>)}</div>:<p className="mt-2 text-sm text-dhk-muted">Addresses saved during checkout appear here.</p>}</div>
    <div className="mt-4 rounded-3xl bg-dhk-green900 p-5 text-white"><h2 className="font-display text-xl font-bold">Daily Healthy Kitchen</h2><p className="mt-1 text-sm text-white/75">Front of Bank of Baroda, Camp Rd, above SKY Bakery House, Vardhaman Nagar, Malegaon, Maharashtra 423105</p><p className="mt-2 text-sm text-white/75">11:00 AM – 11:00 PM</p><div className="mt-4 flex flex-wrap gap-2"><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-dhk-green900">WhatsApp</a><a href={INSTAGRAM} target="_blank" rel="noreferrer" className="rounded-xl border border-white/30 px-3 py-2 text-xs font-bold">Instagram</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANT_ADDRESS)}`} target="_blank" rel="noreferrer" className="rounded-xl border border-white/30 px-3 py-2 text-xs font-bold">Directions</a></div></div>
    <div className="mt-5 text-center text-xs text-dhk-muted">DHK app v1.0.0</div>
  </main><BottomNav/></div>
}

function OwnerPage(){
  const [token,setToken]=useState(localStorage.getItem('dhk-owner-token')||''); const [pass,setPass]=useState(''); const [loading,setLoading]=useState(false); const [err,setErr]=useState('');
  const store=useStore(); const [selectedOrder,setSelectedOrder]=useState<string|null>(null);
  const login=async()=>{setLoading(true);setErr('');try{const r=await fetch('/api/owner/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({passcode:pass})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Login failed');localStorage.setItem('dhk-owner-token',d.token);setToken(d.token)}catch(e:any){setErr(e.message)}finally{setLoading(false)}};
  if(!token)return <div className="min-h-[100svh] bg-dhk-cream px-4 py-10"><div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft"><img src="/assets/logo.png" className="mx-auto h-20 w-20 rounded-2xl object-cover" alt=""/><h1 className="mt-4 text-center font-display text-2xl font-bold">Owner panel</h1><p className="mt-1 text-center text-xs text-dhk-muted">Passcode is verified server-side.</p><input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="mt-5 h-12 w-full rounded-xl border border-dhk-line bg-dhk-cream px-3 outline-none" placeholder="Owner passcode"/>{err&&<p className="mt-2 text-xs font-semibold text-dhk-danger">{err}</p>}<button onClick={login} disabled={loading} className="mt-3 h-12 w-full rounded-xl bg-dhk-green500 font-bold text-white disabled:opacity-50">{loading?'Checking…':'Unlock owner panel'}</button></div></div>;
  return <div><header className="sticky top-0 z-40 border-b border-dhk-line bg-dhk-cream/95 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"><div className="flex items-center gap-2"><img src="/assets/logo.png" className="h-9 w-9 rounded-xl object-cover" alt=""/><b>Owner panel</b></div><button onClick={()=>{localStorage.removeItem('dhk-owner-token');setToken('')}} className="rounded-xl bg-white px-3 py-2 text-xs font-bold">Lock</button></div></header><main className="mx-auto max-w-5xl space-y-4 px-4 pb-20 pt-5">
    <div className="grid gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-white p-4 shadow-soft"><span className="text-xs text-dhk-muted">Orders</span><div className="font-display text-2xl font-bold">{store.orders.length}</div></div><div className="rounded-2xl bg-white p-4 shadow-soft"><span className="text-xs text-dhk-muted">Pending payment</span><div className="font-display text-2xl font-bold">{store.orders.filter(o=>o.paymentStatus==='Payment Submitted'||o.paymentStatus==='Pending Verification').length}</div></div><div className="rounded-2xl bg-white p-4 shadow-soft"><span className="text-xs text-dhk-muted">Unavailable items</span><div className="font-display text-2xl font-bold">{store.outOfStock.length}</div></div><div className="rounded-2xl bg-white p-4 shadow-soft"><span className="text-xs text-dhk-muted">Restaurant</span><div className="mt-1 flex items-center gap-2"><button onClick={()=>store.setManualOpen(store.manualOpen===true?false:true)} className={`h-7 w-12 rounded-full p-1 ${store.manualOpen===false?'bg-dhk-danger':'bg-dhk-green500'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${store.manualOpen===false?'':'translate-x-5'}`}/></button><span className="text-xs font-bold">{store.manualOpen===false?'Closed override':'Open override'}</span></div><button onClick={()=>store.setManualOpen(null)} className="mt-2 text-[10px] font-bold text-dhk-green500">Use time automatically</button></div></div>
    <div className="rounded-2xl bg-white p-4 shadow-soft"><h2 className="font-display text-xl font-bold">Orders</h2><div className="mt-3 space-y-2">{store.orders.map(o=><div key={o.id} className="rounded-2xl border border-dhk-line p-3"><div className="flex items-start justify-between gap-2"><div><b>{o.id}</b><div className="text-xs text-dhk-muted">{o.customer.name} · {o.customer.phone}</div><div className="text-xs text-dhk-muted">{o.customer.fullAddress}</div></div><b>{money(o.bill.total)}</b></div><div className="mt-2 flex flex-wrap gap-2"><select value={o.paymentStatus} onChange={e=>store.updateOrder(o.id,{paymentStatus:e.target.value as any})} className="rounded-lg border border-dhk-line bg-dhk-cream px-2 py-2 text-xs"><option>Payment Submitted</option><option>Pending Verification</option><option>Verified</option><option>Rejected</option></select><select value={o.orderStatus} onChange={e=>store.updateOrder(o.id,{orderStatus:e.target.value as any})} className="rounded-lg border border-dhk-line bg-dhk-cream px-2 py-2 text-xs">{['Payment Submitted','Order Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}</select><button onClick={()=>setSelectedOrder(selectedOrder===o.id?null:o.id)} className="rounded-lg bg-dhk-green100 px-3 py-2 text-xs font-bold">Details</button></div>{selectedOrder===o.id&&<div className="mt-3 rounded-xl bg-dhk-cream p-3 text-xs"><div><b>UTR:</b> {o.paymentRef}</div><div className="mt-1"><b>Items:</b> {o.lines.map(x=>`${x.name} × ${x.qty}`).join(', ')}</div></div>}</div>)}</div></div>
    <div className="rounded-2xl bg-white p-4 shadow-soft"><h2 className="font-display text-xl font-bold">Menu controls</h2><p className="mt-1 text-xs text-dhk-muted">Prices and bestseller flags are persisted locally for this demo owner panel.</p><div className="mt-3 grid gap-2">{menu.map(i=><div key={i.id} className="flex items-center gap-2 rounded-xl border border-dhk-line p-2"><div className="min-w-0 flex-1"><b className="text-sm">{i.name}</b><div className="text-[10px] text-dhk-muted">{categoryById[i.categoryId].name}</div></div><input value={store.priceOverrides[i.id]??i.price} onChange={e=>store.setPrice(i.id,Math.max(0,Number(e.target.value)))} className="w-20 rounded-lg border border-dhk-line px-2 py-2 text-xs"/><button onClick={()=>store.setBestseller(i.id,!((store.bestsellerOverrides[i.id]??i.isBestseller)))} className={`rounded-lg px-2 py-2 text-[10px] font-bold ${store.bestsellerOverrides[i.id]??i.isBestseller?'bg-dhk-gold text-white':'bg-stone-100'}`}>BEST</button><button onClick={()=>store.setOutOfStock(i.id,!store.outOfStock.includes(i.id))} className={`rounded-lg px-2 py-2 text-[10px] font-bold ${store.outOfStock.includes(i.id)?'bg-dhk-danger text-white':'bg-stone-100'}`}>{store.outOfStock.includes(i.id)?'OUT':'IN'}</button></div>)}</div></div>
  </main></div>
}

function AppShell(){
  const name=useStore(s=>s.name); const navigate=useNavigate();
  if(!name)return <Routes><Route path="*" element={<Welcome onDone={()=>navigate('/')} />}/></Routes>;
  return <Routes><Route path="/" element={<HomePage/>}/><Route path="/checkout" element={<CheckoutPage/>}/><Route path="/payment" element={<PaymentPage/>}/><Route path="/success/:id" element={<SuccessPage/>}/><Route path="/orders" element={<OrdersPage/>}/><Route path="/orders/:id" element={<OrderDetailPage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/owner" element={<OwnerPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}

export default function App(){return <BrowserRouter><AppShell/></BrowserRouter>}
