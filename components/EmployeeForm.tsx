
import React, { useState, useRef } from 'react';
import { Employee, Department, EmploymentStatus, DEPARTMENTS, STATUSES } from '../types';
import { generateEmployeeBio } from '../services/geminiService';
import { Sparkles, Save, X, Lock, Upload, Camera } from 'lucide-react';

interface EmployeeFormProps {
  initialData?: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSave, onCancel, readOnly = false }) => {
  const [formData, setFormData] = useState<Partial<Employee>>(initialData || {
    id: crypto.randomUUID(),
    fullName: '',
    role: '',
    department: Department.ENGINEERING,
    joinDate: new Date().toISOString().split('T')[0],
    status: EmploymentStatus.ACTIVE,
    bio: '',
    skills: [],
    avatarUrl: `https://picsum.photos/seed/${Math.random()}/200/200`
  });

  const [skillInput, setSkillInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (readOnly) return;
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (readOnly) return;
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skillToRemove)
    }));
  };

  // Image Compression and Upload Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to Base64 with reduced quality (0.7) to save LocalStorage space
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateBio = async () => {
    if (readOnly) return;
    if (!formData.fullName || !formData.role) {
      alert("请先填写姓名和职位。");
      return;
    }
    setIsGenerating(true);
    const bio = await generateEmployeeBio(
      formData.fullName,
      formData.role,
      formData.department as string,
      formData.joinDate as string,
      formData.skills || []
    );
    setFormData(prev => ({ ...prev, bio }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (formData.fullName && formData.role && formData.joinDate) {
      onSave(formData as Employee);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-auto border border-slate-100 relative animate-fade-in">
      {readOnly && (
        <div className="absolute top-0 right-0 p-4 z-10">
           <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Lock size={12} /> 只读模式
           </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData ? '员工档案' : '新增员工'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Upload Section */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg bg-slate-50">
              <img 
                src={formData.avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {!readOnly && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              >
                <Camera size={24} />
                <span className="text-xs font-medium mt-1">更换头像</span>
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
            <input
              required
              disabled={readOnly}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="例如：张三"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">职位 / 头衔</label>
            <input
              required
              disabled={readOnly}
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="例如：高级产品经理"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">所属部门</label>
            <select
              disabled={readOnly}
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">当前状态</label>
            <select
              disabled={readOnly}
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            >
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">入职日期</label>
            <input
              disabled={readOnly}
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">离职日期 (可选)</label>
            <input
              disabled={readOnly}
              type="date"
              name="leaveDate"
              value={formData.leaveDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">技能标签</label>
          {!readOnly && (
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="输入技能并按回车添加"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                添加
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.skills?.map(skill => (
              <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-1">
                {skill}
                {!readOnly && <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500"><X size={14}/></button>}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
             <label className="block text-sm font-medium text-slate-700">个人简介</label>
             {!readOnly && (
               <button
                type="button"
                onClick={handleGenerateBio}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
               >
                 <Sparkles size={14} />
                 {isGenerating ? 'AI 撰写中...' : '使用 Gemini 生成简介'}
               </button>
             )}
          </div>
          <textarea
            disabled={readOnly}
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="关于这位员工的故事..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {readOnly ? '关闭' : '取消'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all"
            >
              <Save size={18} />
              保存档案
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
