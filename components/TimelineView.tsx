
import React, { useMemo, useState } from 'react';
import { Employee, EmploymentStatus } from '../types';
import { User, Calendar, Briefcase, Award } from 'lucide-react';
import { analyzeCompanyEra } from '../services/geminiService';

interface TimelineViewProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ employees, onSelectEmployee }) => {
  const [analyzingYear, setAnalyzingYear] = useState<number | null>(null);
  const [yearAnalysis, setYearAnalysis] = useState<Record<number, string>>({});

  const timelineData = useMemo(() => {
    // Group by Year
    const groups: Record<number, Employee[]> = {};
    employees.forEach(emp => {
      const year = new Date(emp.joinDate).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(emp);
    });

    // Sort years ascending for Heritage feel
    const sortedYears = Object.keys(groups).map(Number).sort((a, b) => a - b);
    
    return sortedYears.map(year => ({
      year,
      employees: groups[year].sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime())
    }));
  }, [employees]);

  const handleAnalyzeEra = async (year: number, emps: Employee[]) => {
    if (yearAnalysis[year]) return; // Already done
    
    setAnalyzingYear(year);
    const analysis = await analyzeCompanyEra(year, emps);
    setYearAnalysis(prev => ({ ...prev, [year]: analysis }));
    setAnalyzingYear(null);
  };

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Calendar size={48} className="mb-4 opacity-50" />
        <p className="text-lg">暂无历史记录。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="relative border-l-4 border-slate-200 ml-4 md:ml-1/2 space-y-16">
        {timelineData.map(({ year, employees }) => (
          <div key={year} className="relative">
             {/* Year Marker */}
            <div className="absolute -left-[27px] bg-slate-900 text-white font-bold py-1 px-3 rounded-full border-4 border-white shadow-md z-10 text-sm">
              {year}
            </div>

            <div className="ml-8 md:ml-12 mb-6">
               <div className="flex items-center gap-3">
                 <h3 className="text-2xl font-bold text-slate-800">{employees.length} 位新成员</h3>
                 <button 
                  onClick={() => handleAnalyzeEra(year, employees)}
                  className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                  disabled={analyzingYear === year}
                 >
                   {analyzingYear === year ? 'AI 分析中...' : '生成年度总结'}
                 </button>
               </div>
               {yearAnalysis[year] && (
                 <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 text-sm italic">
                   ✨ {yearAnalysis[year]}
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8 md:ml-0">
               {employees.map((employee, index) => {
                 const isAlumni = employee.status === EmploymentStatus.ALUMNI;
                 
                 return (
                   <div 
                    key={employee.id}
                    onClick={() => onSelectEmployee(employee)}
                    className={`
                      relative group cursor-pointer transition-all duration-300 hover:-translate-y-1
                      bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-xl
                      ${isAlumni ? 'opacity-80 grayscale-[0.5] hover:grayscale-0' : ''}
                    `}
                   >
                     {isAlumni && (
                       <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                         校友
                       </div>
                     )}
                     
                     <div className="flex items-start gap-4">
                       <img 
                        src={employee.avatarUrl} 
                        alt={employee.fullName} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-50"
                       />
                       <div>
                         <h4 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                           {employee.fullName}
                         </h4>
                         <p className="text-sm text-slate-500 flex items-center gap-1">
                           <Briefcase size={12} /> {employee.role}
                         </p>
                         <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                           <Calendar size={12} /> {new Date(employee.joinDate).toLocaleDateString('zh-CN')}
                         </p>
                       </div>
                     </div>
                     
                     {employee.bio && (
                       <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                         {employee.bio}
                       </p>
                     )}
                     
                     {/* Ten Year Badge Check */}
                     {new Date().getFullYear() - new Date(employee.joinDate).getFullYear() >= 10 && (
                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Award size={12} />
                          十年功勋
                        </div>
                     )}
                   </div>
                 );
               })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
