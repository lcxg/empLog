
import React, { useMemo } from 'react';
import { Employee, Department, EmploymentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserPlus, Clock } from 'lucide-react';

interface StatsViewProps {
  employees: Employee[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const StatsView: React.FC<StatsViewProps> = ({ employees }) => {
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === EmploymentStatus.ACTIVE).length;
    
    // Tenure calculation
    const totalTenureDays = employees.reduce((acc, emp) => {
      const start = new Date(emp.joinDate).getTime();
      const end = emp.leaveDate ? new Date(emp.leaveDate).getTime() : new Date().getTime();
      return acc + (end - start);
    }, 0);
    const avgYears = total > 0 ? (totalTenureDays / (1000 * 60 * 60 * 24 * 365)) / total : 0;

    // By Department
    const deptCounts: Record<string, number> = {};
    employees.forEach(e => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });
    const departmentData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

    // Hiring Trend (Last 10 Years)
    const currentYear = new Date().getFullYear();
    const trendData = [];
    for(let i = 9; i >= 0; i--) {
        const year = currentYear - i;
        const count = employees.filter(e => new Date(e.joinDate).getFullYear() === year).length;
        trendData.push({ year: year.toString(), employees: count });
    }

    return { total, active, avgYears, departmentData, trendData };
  }, [employees]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">总记录数</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
            <p className="text-xs text-slate-400">{stats.active} 位在职员工</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-full">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">平均司龄</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.avgYears.toFixed(1)} <span className="text-sm font-normal">年</span></h3>
             <p className="text-xs text-slate-400">忠诚度指标</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">公司历史</p>
             <h3 className="text-2xl font-bold text-slate-800">
                {employees.length > 0 ? (new Date().getFullYear() - Math.min(...employees.map(e => new Date(e.joinDate).getFullYear()))) : 0} <span className="text-sm font-normal">年</span>
             </h3>
             <p className="text-xs text-slate-400">自首位员工入职起</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">人员增长趋势 (近10年)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar name="入职人数" dataKey="employees" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">部门分布</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {stats.departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-wrap justify-center gap-4 mt-4">
                {stats.departmentData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-xs text-slate-500">{entry.name}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
