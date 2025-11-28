
import React, { useMemo } from 'react';
import { Employee } from '../types';
import { Mail, Calendar, Briefcase, RotateCw } from 'lucide-react';

interface GalleryViewProps {
  employees: Employee[];
}

const FLIP_DIRECTIONS = [
  'group-hover:rotate-y-180',
  'group-hover:-rotate-y-180',
  'group-hover:rotate-x-180',
  'group-hover:rotate-diagonal',
];

const GalleryView: React.FC<GalleryViewProps> = ({ employees }) => {
  
  // Memoize random assignments so they don't change on re-renders
  const randomizedEmployees = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      flipClass: FLIP_DIRECTIONS[Math.floor(Math.random() * FLIP_DIRECTIONS.length)],
      transitionDelay: `${Math.random() * 100}ms`
    }));
  }, [employees]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
      {randomizedEmployees.map((emp) => {
        let initialBackRotation = '';
        if (emp.flipClass.includes('rotate-x')) initialBackRotation = 'rotate-x-180';
        else if (emp.flipClass.includes('diagonal')) initialBackRotation = 'rotate-diagonal';
        else if (emp.flipClass.includes('-rotate-y')) initialBackRotation = '-rotate-y-180';
        else initialBackRotation = 'rotate-y-180';

        return (
          <div key={emp.id} className="group h-80 w-full perspective-1000 cursor-pointer">
            <div 
              className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${emp.flipClass} shadow-xl rounded-2xl`}
              style={{ transitionDelay: emp.transitionDelay }}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-slate-200 bg-white z-10">
                <div className="absolute top-2 right-2 z-20 opacity-50 bg-black/20 p-1 rounded-full text-white">
                    <RotateCw size={14} />
                </div>
                <img 
                  src={emp.avatarUrl} 
                  alt={emp.fullName} 
                  className="w-full h-56 object-cover object-center"
                />
                <div className="p-4 bg-white absolute bottom-0 w-full border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{emp.fullName}</h3>
                  <p className="text-indigo-600 text-sm font-medium truncate">{emp.role}</p>
                  <div className="mt-2 w-12 h-1 bg-slate-900 rounded-full"></div>
                </div>
              </div>

              {/* Back of Card */}
              <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-slate-900 text-white p-6 flex flex-col justify-between ${initialBackRotation}`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{emp.department}</span>
                    <div className={`w-2 h-2 rounded-full ${emp.status === '在职' ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{emp.fullName}</h3>
                  <p className="text-slate-400 text-sm mb-4">{emp.role}</p>
                  
                  <p className="text-sm text-slate-300 line-clamp-4 leading-relaxed italic">
                    "{emp.bio}"
                  </p>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} />
                    <span>{new Date(emp.joinDate).getFullYear()} 年入职</span>
                  </div>
                  {emp.skills && emp.skills.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Briefcase size={14} />
                      <span className="truncate">{emp.skills.slice(0, 2).join(', ')}...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GalleryView;
