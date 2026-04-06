
import React from 'react';
import { Client } from '../types';
import { Gift, Award, Star } from 'lucide-react';
import Button from './ui/Button';

const LoyaltyManager: React.FC<{ clients: Client[], onUpdateClients: (cs: Client[]) => void }> = ({ clients, onUpdateClients }) => {
  return (
    <div className="space-y-10">
       <div className="flex justify-between items-end">
          <div>
            <h2 className="header-font text-4xl font-black text-slate-800 mb-2">Royal Club</h2>
            <p className="text-slate-600 font-medium">Управление привилегиями и бонусами клиентов</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'VIP Status', icon: Award, count: clients.filter(c => c.status === 'VIP').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
             { label: 'Баллы на счетах', icon: Star, count: clients.reduce((s, c) => s + (c.points || 0), 0), color: 'text-orange-600', bg: 'bg-orange-500/10' },
             { label: 'Клиенты с баллами', icon: Gift, count: clients.filter(c => (c.points || 0) > 0).length, color: 'text-orange-500', bg: 'bg-orange-500/10' },
           ].map((box, i) => (
             <div key={i} className="glass-panel p-10 rounded-[2.5rem] border border-slate-200 relative overflow-hidden group">
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${box.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                <box.icon className={box.color} size={40} />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-8 mb-2">{box.label}</p>
                <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{box.count.toLocaleString()}</h4>
             </div>
           ))}
        </div>

        <div className="glass-panel rounded-[2.5rem] border border-slate-200 overflow-hidden">
           <div className="p-10 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="header-font text-lg font-bold text-slate-800">База лояльности</h3>
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-100">
                 <tr>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest">Клиент</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest">Текущие баллы</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest">Уровень</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest text-right">Действие</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                 {clients.length > 0 ? clients.map(c => (
                   <tr key={c.id} className="hover:bg-orange-50 transition-colors group">
                      <td className="px-10 py-8 font-black text-slate-800 tracking-tight">{c.name}</td>
                      <td className="px-10 py-8">
<div className="flex items-center gap-2">
                              <Star size={14} className="text-orange-600" />
                              <span className="text-orange-600 font-black text-lg">{c.points || 0}</span>
                         </div>
                      </td>
                      <td className="px-10 py-8 uppercase text-[10px] font-black">
                         <span className={`px-4 py-1.5 rounded-full border ${c.status === 'VIP' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-200'}`}>
                           {c.status}
                         </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <Button 
                          variant="ghost" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                         >
                          Начислить баллы
                         </Button>
                      </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={4} className="px-10 py-24 text-center text-slate-500 uppercase font-black tracking-widest opacity-20">Данные отсутствуют</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
    </div>
  );
};

export default LoyaltyManager;
