/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, UserCheck, GraduationCap, Map, Landmark, PieChart, TrendingUp, Sparkles, Filter, Percent } from 'lucide-react';
import { HrEmployee, Location, District } from '../types';
import { mockLocations, mockDistricts } from '../data/seedData';

interface DashboardViewProps {
  employees: HrEmployee[];
  locations: Location[];
  districts: District[];
}

export default function DashboardView({ employees, locations, districts }: DashboardViewProps) {
  const [selectedGov, setSelectedGov] = useState<number | 'all'>('all');

  // Filter employees
  const filteredEmployees = selectedGov === 'all' 
    ? employees 
    : employees.filter(e => e.currentLocationId === selectedGov);

  // Statistics
  const totalEmployees = filteredEmployees.length;
  const adminCadre = filteredEmployees.filter(e => e.cadreTypeId === 1).length;
  const teacherCadre = filteredEmployees.filter(e => e.cadreTypeId === 2).length;

  const maleCount = filteredEmployees.filter(e => e.gender === 'ذكر').length;
  const femaleCount = filteredEmployees.filter(e => e.gender === 'أنثى').length;

  const malePercent = totalEmployees > 0 ? Math.round((maleCount / totalEmployees) * 100) : 0;
  const femalePercent = totalEmployees > 0 ? Math.round((femaleCount / totalEmployees) * 100) : 0;

  // Average Salary
  const totalSalary = filteredEmployees.reduce((sum, e) => sum + Number(e.baseSalary), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;

  // Level counts
  const ministriesCount = 1; // Central
  const govCount = locations.length;
  const districtsCount = districts.length;
  const schoolsCount = 15412; // National scale estimate

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* Filters and Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-lg text-slate-800 flex items-center gap-2">
            <Users className="text-emerald-700 h-5 w-5" />
            <span>لوحة المؤشرات والتحليلات الجغرافية والوظيفية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">مؤشرات موثوقة ومحدثة على مستوى المحافظات والمديريات والمدارس</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 font-medium whitespace-nowrap">المستوى الإداري (المحافظة):</span>
          <select 
            value={selectedGov} 
            onChange={(e) => setSelectedGov(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs rounded-lg px-3 py-1.5 font-sans text-slate-800 focus:outline-none focus:border-emerald-700 transition-all font-semibold"
          >
            <option value="all">عرض الجمهورية بأكملها (الكل)</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium block">إجمالي كادر الوزارة والمحافظات</span>
            <span className="text-2xl font-bold font-sans text-slate-800">{totalEmployees}</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">نشط بالكامل</span>
          </div>
          <div className="bg-emerald-600/10 p-3.5 rounded-xl text-emerald-700">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium block">الكادر التربوي والتعليمي</span>
            <span className="text-2xl font-bold font-sans text-slate-800">{teacherCadre}</span>
            <span className="text-xs text-slate-500 block">معلمون ومعلمات في الفصول الدراسية</span>
          </div>
          <div className="bg-amber-600/10 p-3.5 rounded-xl text-amber-700">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium block">متوسط الراتب الأساسي</span>
            <span className="text-2xl font-bold font-sans text-slate-800">{avgSalary.toLocaleString()} ر.ي</span>
            <span className="text-xs text-indigo-600 font-semibold block">مستحق الصرف الموحد شهرياً</span>
          </div>
          <div className="bg-indigo-600/10 p-3.5 rounded-xl text-indigo-700">
            <Landmark className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium block">الكادر الإداري والتنظيمي</span>
            <span className="text-2xl font-bold font-sans text-slate-800">{adminCadre}</span>
            <span className="text-xs text-slate-500 block">تخطيط، رقابة، وموارد بشرية</span>
          </div>
          <div className="bg-pink-600/10 p-3.5 rounded-xl text-pink-700">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 4 Levels Hierarchy Display Map */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Map className="h-4 w-4 text-emerald-700" />
          <span>هيكلية المستويات الإدارية الأربعة لوزارة التربية والتعليم</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 text-center space-y-1 border border-slate-800">
            <span className="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">مستوى 1</span>
            <h4 className="font-bold text-xs">ديوان عام الوزارة</h4>
            <p className="text-lg font-bold font-mono">{ministriesCount}</p>
            <p className="text-[10px] text-slate-400">التشريع، الميزانية والموافقة النهائية</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4 text-center space-y-1 border border-slate-100">
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">مستوى 2</span>
            <h4 className="font-bold text-xs text-slate-700">مكاتب التربية بالمحافظات</h4>
            <p className="text-lg font-bold font-mono text-slate-800">{govCount}</p>
            <p className="text-[10px] text-slate-500">التوزيع المالي وتنسيق الفروقات والبدلات</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-center space-y-1 border border-slate-100">
            <span className="bg-slate-850 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">مستوى 3</span>
            <h4 className="font-bold text-xs text-slate-700">إدارات التربية بالمديريات</h4>
            <p className="text-lg font-bold font-mono text-slate-800">{districtsCount}</p>
            <p className="text-[10px] text-slate-500">الموارد البشرية الأولية والعمل الجماعي</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-center space-y-1 border border-slate-100">
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">مستوى 4</span>
            <h4 className="font-bold text-xs text-slate-700">المدارس والمراكز</h4>
            <p className="text-lg font-bold font-mono text-slate-800">{schoolsCount.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">مستوى إدخال الحضور والتنفيذ المباشر</p>
          </div>
        </div>
      </div>

      {/* Gender Distribution and Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 lg:col-span-1 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <PieChart className="h-4 w-4 text-pink-600" />
            <span>توزيع القوى العاملة حسب الجنس</span>
          </h3>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-emerald-700 rounded-full inline-block"></span>
                <span>الذكور</span>
              </span>
              <span>{maleCount} موظف ({malePercent}%)</span>
            </div>
            
            <div className="min-h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-700 transition-all duration-500" style={{ width: `${malePercent}%` }}></div>
              <div className="bg-pink-500 transition-all duration-500" style={{ width: `${femalePercent}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-pink-500 rounded-full inline-block"></span>
                <span>الإناث</span>
              </span>
              <span>{femaleCount} موظفة ({femalePercent}%)</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
            <Sparkles className="h-4.5 w-4.5 text-amber-600 float-right mr-1 ml-2 mt-0.5" />
            <span><strong>توصية التنوع الوظيفي:</strong> تدعم الوزارة تفعيل برامج تأهيل الكادر النسائي التعليمي في الأرياف والمناطق النائية لرفع كفاءة تعليم الفتيات.</span>
          </div>
        </div>

        {/* Geographic Breakdown Cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 lg:col-span-2 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-700" />
            <span>كثافة وتواجد الموظفين في المحافظات الرئيسية المدرجة</span>
          </h3>

          <div className="space-y-3 pt-1">
            {locations.map(loc => {
              const matchedEmpCount = employees.filter(e => e.currentLocationId === loc.id).length;
              const percent = employees.length > 0 ? Math.round((matchedEmpCount / employees.length) * 100) : 0;
              
              return (
                <div key={loc.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{loc.name}</span>
                    <span className="text-slate-500">{matchedEmpCount} معلمين وعاملين ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="h-full bg-slate-800 rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
