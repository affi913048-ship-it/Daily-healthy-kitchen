import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { menu } from './data/menu';

export type CartLine = {
  itemId: string; qty: number; note?: string;
};
export type Address = {
  id: string; label: 'HOME'|'WORK'|'OTHER'; name: string; phone: string;
  flat: string; area: string; landmark: string; pincode: string; isDefault?: boolean;
};
export type OrderLine = CartLine & { name: string; price: number; image: string; subtotal: number; isJain: boolean };
export type Order = {
  id: string; createdAt: string; lines: OrderLine[]; customer: {
    name:string; phone:string; location:string; fullAddress:string; landmark:string; pincode:string; addressLabel?:string;
  };
  bill: { itemTotal:number; packaging:number; delivery:number; gst:number; discount:number; total:number; coupon?:string };
  paymentRef: string; paymentStatus: 'Payment Submitted'|'Verified'|'Rejected'|'Pending Verification';
  orderStatus: 'Payment Submitted'|'Order Confirmed'|'Preparing'|'Out for Delivery'|'Delivered'|'Cancelled';
  eta: string;
};
type Store = {
  name: string; phone: string; location: string; addresses: Address[]; cart: CartLine[]; orders: Order[];
  favourites: string[]; outOfStock: string[]; priceOverrides: Record<string,number>;
  bestsellerOverrides: Record<string,boolean>; manualOpen: boolean|null; showJainFirst: boolean;
  setName:(name:string)=>void; setPhone:(phone:string)=>void; addToCart:(itemId:string,qty?:number,note?:string)=>void;
  setQty:(itemId:string,qty:number)=>void; removeFromCart:(itemId:string)=>void; setNote:(itemId:string,note:string)=>void;
  clearCart:()=>void; addAddress:(a:Address)=>void; updateAddress:(a:Address)=>void; deleteAddress:(id:string)=>void;
  toggleFavourite:(id:string)=>void; setShowJainFirst:(v:boolean)=>void; addOrder:(o:Order)=>void;
  updateOrder:(id:string, patch:Partial<Order>)=>void; setOutOfStock:(id:string,v:boolean)=>void;
  setPrice:(id:string,v:number)=>void; setBestseller:(id:string,v:boolean)=>void; setManualOpen:(v:boolean|null)=>void;
};

export const useStore = create<Store>()(persist((set) => ({
  name:'', phone:'', location:'Malegaon, Maharashtra', addresses:[], cart:[], orders:[], favourites:[],
  outOfStock:[], priceOverrides:{}, bestsellerOverrides:{}, manualOpen:null, showJainFirst:false,
  setName:(name)=>set({name}),
  setPhone:(phone)=>set({phone}),
  addToCart:(itemId,qty=1,note='')=>set(s=>{
    const existing=s.cart.find(x=>x.itemId===itemId);
    if(existing) return {cart:s.cart.map(x=>x.itemId===itemId?{...x,qty:x.qty+qty,note:note||x.note}:x)};
    return {cart:[...s.cart,{itemId,qty,note}]};
  }),
  setQty:(itemId,qty)=>set(s=>({cart:qty<=0?s.cart.filter(x=>x.itemId!==itemId):s.cart.map(x=>x.itemId===itemId?{...x,qty}:x)})),
  removeFromCart:(itemId)=>set(s=>({cart:s.cart.filter(x=>x.itemId!==itemId)})),
  setNote:(itemId,note)=>set(s=>({cart:s.cart.map(x=>x.itemId===itemId?{...x,note}:x)})),
  clearCart:()=>set({cart:[]}),
  addAddress:(a)=>set(s=>({addresses:[...s.addresses.filter(x=>x.id!==a.id),a]})),
  updateAddress:(a)=>set(s=>({addresses:s.addresses.map(x=>x.id===a.id?a:x)})),
  deleteAddress:(id)=>set(s=>({addresses:s.addresses.filter(x=>x.id!==id)})),
  toggleFavourite:(id)=>set(s=>({favourites:s.favourites.includes(id)?s.favourites.filter(x=>x!==id):[...s.favourites,id]})),
  setShowJainFirst:(v)=>set({showJainFirst:v}),
  addOrder:(o)=>set(s=>({orders:[o,...s.orders],cart:[]})),
  updateOrder:(id,patch)=>set(s=>({orders:s.orders.map(o=>o.id===id?{...o,...patch}:o)})),
  setOutOfStock:(id,v)=>set(s=>({outOfStock:v?[...new Set([...s.outOfStock,id])]:s.outOfStock.filter(x=>x!==id)})),
  setPrice:(id,v)=>set(s=>({priceOverrides:{...s.priceOverrides,[id]:v}})),
  setBestseller:(id,v)=>set(s=>({bestsellerOverrides:{...s.bestsellerOverrides,[id]:v}})),
  setManualOpen:(v)=>set({manualOpen:v}),
}),{name:'dhk-store'}));
