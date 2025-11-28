
import { GoogleGenAI } from "@google/genai";
import { Employee } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateEmployeeBio = async (name: string, role: string, department: string, joinDate: string, skills: string[]): Promise<string> => {
  if (!apiKey) {
    return "未找到 API Key，请检查环境配置。";
  }

  try {
    const prompt = `
      请为以下公司员工撰写一段专业、吸引人且略带温暖的中文职业简介（约2-3句）。
      员工姓名: ${name}
      职位: ${role}
      部门: ${department}
      入职日期: ${joinDate}
      核心技能: ${skills.join(', ')}
      
      语调: 商务但具有人文关怀。如果该员工入职时间较长，请强调其资历和贡献。请直接输出简介内容，不要包含"简介："等前缀。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "简介生成失败。";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "暂时无法生成简介。";
  }
};

export const analyzeCompanyEra = async (year: number, employees: Employee[]): Promise<string> => {
  if (!apiKey) return "AI 分析需要 API Key。";
  
  const employeesList = employees.map(e => `${e.role} (${e.department})`).join(', ');
  
  const prompt = `
    请分析该公司在 ${year} 年入职的员工职位列表。
    列表: ${employeesList}
    
    请给这一年起一个简短的中文"年度主题"（例如"技术扩张之年"或"设计变革元年"）。
    然后用一句话解释原因。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "无法进行分析。";
  } catch (error) {
    return "暂时无法进行分析。";
  }
};
