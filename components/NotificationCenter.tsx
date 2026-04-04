
import React from 'react';
import { Bell, Send, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import Button from './ui/Button';

const NotificationCenter: React.FC = () => {
  return (
    <div className="space-y-10">
       <div>
          <h2 className="header-font text-4xl font-black text-white mb-2">Comms Center</h2>
          <p className="text-slate-500 font-medium">Центр взаимодействия с клиентами и сервисные уведомления</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5">
              <h3 className="header-font text-xl font-bold mb-8 flex items-center gap-3">
                 <Mail className="text-blue-500" /> Шаблоны рассылок
              </h3>
              <div className="space-y-4">
                 {[
                   { title: 'Подтверждение записи', status: 'Активен', icon: MessageSquare },
                   { title: 'Напоминание за 2 часа', status: 'Активен', icon: Bell },
                   { title: 'Поздравление с ДР', status: 'Отключен', icon: Mail },
                   { title: 'Запрос отзыва', status: 'Активен', icon: MessageSquare },
                 ].map((t, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer transition-all border border-white/5 hover:border-white/10 group">
                      <div className="flex items-center gap-4">
                         <t.icon size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                         <span className="font-black text-sm text-slate-300 group-hover:text-white transition-colors">{t.title}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${t.status === 'Активен' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>{t.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-tr from-blue-600/5 to-transparent flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                 <Send className="text-blue-500" size={32} />
              </div>
              <h4 className="header-font text-lg font-bold mb-4">Ручная рассылка</h4>
              <p className="text-sm text-slate-500 max-w-xs mb-8">Отправьте мгновенное уведомление всем активным клиентам о спецпредложении или изменении графика.</p>
              <Button 
                variant="primary" 
                className="px-10 py-4"
              >
                Создать кампанию
              </Button>
           </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex items-center gap-6 bg-white/5">
           <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
              <AlertCircle size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">System Advisory</p>
              <p className="text-sm font-bold text-slate-300">Все внешние уведомления требуют предварительной настройки API шлюза (не входит в базовый пакет).</p>
           </div>
        </div>
    </div>
  );
};

export default NotificationCenter;
