
import React, { useState, useEffect, useRef } from 'react';
import { Employee, ViewMode, Department, EmploymentStatus } from './types';
import { LayoutGrid, List, BarChart3, Plus, Search, Building2, Lock, LogOut, Images, Download, Upload, Loader2, Database } from 'lucide-react';

import TimelineView from './components/TimelineView';
import StatsView from './components/StatsView';
import GalleryView from './components/GalleryView';
import EmployeeForm from './components/EmployeeForm';
import LoginModal from './components/LoginModal';
import { dbService } from './services/storageService';

// Initial Mock Data with Chinese Enum Values
const MOCK_DATA: Employee[] = [
  {
    id: '1',
    fullName: 'Sarah Jenkins',
    role: '创始人 & CEO',
    department: Department.LEADERSHIP,
    joinDate: '2014-03-15',
    status: EmploymentStatus.ACTIVE,
    bio: '从一个小车库开始创业的愿景家。Sarah 带领公司经历了三次主要转型，并成功完成了 IPO。',
    skills: ['领导力', '战略规划', '公众演讲'],
    avatarUrl: 'https://picsum.photos/seed/sarah/200/200'
  },
  {
    id: '2',
    fullName: 'David Chen',
    role: 'CTO',
    department: Department.ENGINEERING,
    joinDate: '2014-04-01',
    status: EmploymentStatus.ACTIVE,
    bio: '核心平台的架构师。David 以在服务器宕机时的冷静态度和对函数式编程的热爱而闻名。',
    skills: ['系统架构', 'Go 语言', '技术指导'],
    avatarUrl: 'https://picsum.photos/seed/david/200/200'
  },
  {
    id: '3',
    fullName: 'Emily Thorne',
    role: '销售总监',
    department: Department.SALES,
    joinDate: '2015-01-10',
    leaveDate: '2020-05-15',
    status: EmploymentStatus.ALUMNI,
    bio: '从零开始建立了我们的销售团队。现在在一家大型金融科技独角兽公司负责增长业务。',
    skills: ['商务谈判', '团队建设'],
    avatarUrl: 'https://picsum.photos/seed/emily/200/200'
  },
  {
    id: '4',
    fullName: 'Marcus Johnson',
    role: '高级工程师',
    department: Department.ENGINEERING,
    joinDate: '2016-08-20',
    status: EmploymentStatus.ACTIVE,
    bio: '数据库优化的首选专家。Marcus 已经指导了超过 20 名初级工程师。',
    skills: ['PostgreSQL', 'React', 'Node.js'],
    avatarUrl: 'https://picsum.photos/seed/marcus/200/200'
  },
  {
    id: '5',
    fullName: 'Jessica Alba',
    role: '产品设计师',
    department: Department.DESIGN,
    joinDate: '2018-02-14',
    status: EmploymentStatus.ACTIVE,
    bio: '定义了我们的视觉语言 "Aurora"。热衷于无障碍设计和以用户为中心的设计体验。',
    skills: ['Figma', '用户体验研究', '原型设计'],
    avatarUrl: 'https://picsum.photos/seed/jessica/200/200'
  },
   {
    id: '6',
    fullName: 'Robert Speed',
    role: '运维工程师',
    department: Department.OPERATIONS,
    joinDate: '2019-11-02',
    status: EmploymentStatus.ACTIVE,
    bio: '自动化了一切可以自动化的东西。',
    skills: ['Kubernetes', 'Terraform', 'CI/CD'],
    avatarUrl: 'https://picsum.photos/seed/rob/200/200'
  }
];

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('TIMELINE');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('chronos_auth') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Hidden file input for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Load with Migration
  useEffect(() => {
    const initData = async () => {
      try {
        const data = await dbService.migrateFromLocalStorage(MOCK_DATA);
        setEmployees(data);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('chronos_auth', 'true');
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('chronos_auth');
  };

  const handleSaveEmployee = async (emp: Employee) => {
    if (!isAdmin) return;
    
    // Optimistic Update
    setEmployees(prev => {
      const exists = prev.find(e => e.id === emp.id);
      if (exists) {
        return prev.map(e => e.id === emp.id ? emp : e);
      }
      return [...prev, emp];
    });

    // Async Save to DB
    try {
      await dbService.saveEmployee(emp);
    } catch (error) {
      console.error("Failed to save to DB", error);
      alert("保存失败，请检查浏览器存储空间");
    }

    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

  // Export Data to JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(employees, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
           setIsLoading(true);
           await dbService.saveAll(importedData);
           setEmployees(importedData);
           alert(`成功导入 ${importedData.length} 条数据`);
        } else {
          alert('文件格式错误，请导入正确的 JSON 备份文件');
        }
      } catch (err) {
        console.error(err);
        alert('导入失败，文件可能已损坏');
      } finally {
        setIsLoading(false);
        // Clear input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Building2 size={18} className="text-white"/>
             </div>
             <h1 className="text-xl font-bold tracking-tight">Chronos</h1>
          </div>
          <p className="text-slate-400 text-xs mt-2">企业人才时光轴</p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => setViewMode('TIMELINE')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${viewMode === 'TIMELINE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <List size={20} />
            <span>时光轴</span>
          </button>

          <button 
            onClick={() => setViewMode('GALLERY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${viewMode === 'GALLERY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Images size={20} />
            <span>照片墙</span>
          </button>
          
          <button 
            onClick={() => setViewMode('STATS')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${viewMode === 'STATS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart3 size={20} />
            <span>数据仪表盘</span>
          </button>

           <div className="pt-8 px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">管理后台</p>
              
              {isAdmin ? (
                <>
                  <button 
                    onClick={() => { setSelectedEmployee(null); setIsFormOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg border border-slate-700 transition-colors mb-2"
                  >
                    <Plus size={16} />
                    <span>新增记录</span>
                  </button>

                  {/* Data Management Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                     <button 
                       onClick={handleExportData}
                       className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded-lg border border-slate-700 transition-colors text-xs"
                       title="导出备份"
                     >
                       <Download size={14} />
                       <span>备份</span>
                     </button>
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded-lg border border-slate-700 transition-colors text-xs"
                       title="恢复备份"
                     >
                       <Upload size={14} />
                       <span>恢复</span>
                     </button>
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       onChange={handleImportData} 
                       className="hidden" 
                       accept=".json"
                     />
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <LogOut size={14} />
                    <span>退出管理</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Lock size={16} />
                  <span>管理员登录</span>
                </button>
              )}
           </div>
        </nav>

        <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-green-500' : 'bg-slate-500'}`}></div>
             <div className="flex flex-col">
               <span>{isAdmin ? '管理员模式' : '访客浏览模式'}</span>
               <span className="text-[10px] opacity-60 flex items-center gap-1"><Database size={8}/> IndexedDB 存储</span>
             </div>
           </div>
           <p className="mt-2 opacity-50">v2.0.0 Pro</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 p-4 md:px-8 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-opacity-90 backdrop-blur-md">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索姓名或职位..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
             <span className="hidden md:inline">
                总记录数: <strong>{employees.length}</strong>
             </span>
             <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold transition-colors ${isAdmin ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
               {isAdmin ? '管' : '客'}
             </div>
          </div>
        </header>

        {/* Content View */}
        <div className="p-4 md:p-8">
           {isLoading ? (
             <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
               <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
               <p>正在读取加密数据库...</p>
             </div>
           ) : isFormOpen ? (
             <EmployeeForm 
                initialData={selectedEmployee || undefined}
                onSave={handleSaveEmployee}
                onCancel={() => { setIsFormOpen(false); setSelectedEmployee(null); }}
                readOnly={!isAdmin}
             />
           ) : (
             <>
               {viewMode === 'TIMELINE' && (
                 <div className="animate-fade-in">
                    <div className="mb-8">
                       <h2 className="text-3xl font-bold text-slate-800">公司发展历程</h2>
                       <p className="text-slate-500">记录每一位伙伴的加入，见证团队的成长。</p>
                    </div>
                    <TimelineView 
                      employees={filteredEmployees} 
                      onSelectEmployee={(emp) => { setSelectedEmployee(emp); setIsFormOpen(true); }}
                    />
                 </div>
               )}

               {viewMode === 'GALLERY' && (
                 <div className="animate-fade-in">
                    <div className="mb-8">
                       <h2 className="text-3xl font-bold text-slate-800">团队风采墙</h2>
                       <p className="text-slate-500">将鼠标悬停在卡片上，发现更多伙伴故事。</p>
                    </div>
                    <GalleryView employees={filteredEmployees} />
                 </div>
               )}

               {viewMode === 'STATS' && (
                  <div className="animate-fade-in">
                      <div className="mb-8">
                       <h2 className="text-3xl font-bold text-slate-800">人才数据分析</h2>
                       <p className="text-slate-500">深度解读团队增长、留存与多元化数据。</p>
                    </div>
                    <StatsView employees={employees} />
                  </div>
               )}
             </>
           )}
        </div>
      </main>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <LoginModal 
          onLogin={handleLoginSuccess}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

    </div>
  );
};

export default App;
