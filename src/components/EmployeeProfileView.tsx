/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, HrEmployee, HrEmployeeQualification, Document, DocumentType } from '../types';
import { mockQualifications, mockDocumentTypes, mockDocuments } from '../data/seedData';
import { Award, Briefcase, FileText, Upload, Check, UserCheck, ShieldAlert, Sparkles, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeProfileViewProps {
  currentUser: User | null;
  employees: HrEmployee[];
  onAddAuditLog: (action: string, table: string, id: number, valOld?: string, valNew?: string) => void;
}

export default function EmployeeProfileView({ currentUser, employees, onAddAuditLog }: EmployeeProfileViewProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<number>(1002); // Primary teacher default
  const [activeTab, setActiveTab] = useState<'personal' | 'assignment' | 'qualification' | 'documents'>('personal');
  
  // States for simulated drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Omit<Document, 'sha256Hash'> & { hash: string }[]>(
    mockDocuments.map(d => ({ ...d, hash: d.sha256Hash }))
  );
  
  // Selected QR code info
  const [qrContent, setQrContent] = useState<string | null>(null);

  const employee = employees.find(e => e.employeeId === selectedEmpId);
  const qualifications = mockQualifications.filter(q => q.employeeId === selectedEmpId);
  
  if (!employee) {
    return <div className="p-6 text-center text-red-500">حدث خطأ: الموظف المحدد غير متوفر حالياً.</div>;
  }

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle Drop file drop simulation
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate drop
    const fileTitle = `ملف ثبوتي مضاف - ${employee.fullName.split(' ')[0]}`;
    const newDocId = Math.floor(Math.random() * 9000) + 1000;
    const randomHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newDoc: Omit<Document, 'sha256Hash'> & { hash: string } = {
      documentId: newDocId,
      title: fileTitle,
      employeeId: employee.employeeId,
      documentTypeId: 2, // Defaulting to qualification
      uploadedAt: new Date().toISOString(),
      hash: randomHash
    };

    setUploadedFiles(prev => [newDoc, ...prev]);

    onAddAuditLog(
      'INSERT',
      'Documents',
      newDocId,
      undefined,
      JSON.stringify({ message: "Simulated drag and drop upload", file: fileTitle, hash: randomHash })
    );
  };

  // Click file upload simulation
  const triggerManualUpload = () => {
    const fileTitle = `وثيقة تعميد منبثقة للوزارة [#${Math.floor(Math.random() * 800) + 100}]`;
    const newDocId = Math.floor(Math.random() * 9000) + 1000;
    const randomHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newDoc: Omit<Document, 'sha256Hash'> & { hash: string } = {
      documentId: newDocId,
      title: fileTitle,
      employeeId: employee.employeeId,
      documentTypeId: 3, // Decision
      uploadedAt: new Date().toISOString(),
      hash: randomHash
    };

    setUploadedFiles(prev => [newDoc, ...prev]);
    onAddAuditLog(
      'INSERT',
      'Documents',
      newDocId,
      undefined,
      JSON.stringify({ message: "Manual browser select", file: fileTitle, hash: randomHash })
    );
  };

  // QR trigger helper
  const selectFileForQrCode = (doc: any) => {
    const jsonToVerify = `وزارة التربية والتعليم - الجمهورية اليمنية\\nالرقم المرجعي للملف: DOC-${doc.documentId}\\nنوع المستند: ${mockDocumentTypes.find(t => t.id === doc.documentTypeId)?.name || 'غير معروف'}\\nعنوان الملف: ${doc.title}\\nبصمة الأمان SHA256: ${doc.hash}`;
    setQrContent(jsonToVerify);
  };

  return (
    <div id="emp-profile-viewer" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar: Selector & Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 lg:col-span-1 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block" htmlFor="emp-select">تصفح ملفات الموظفين والمعلمين</label>
          <select
            id="emp-select"
            value={selectedEmpId}
            onChange={(e) => {
              setSelectedEmpId(Number(e.target.value));
              setQrContent(null);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-600 font-sans font-semibold text-slate-800"
          >
            {employees.map(emp => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.fullName} ({emp.cadreTypeId === 1 ? 'إداري' : 'معلم'})
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-slate-100 pt-4 text-center space-y-2">
          <div className="h-16 w-16 bg-slate-800 text-slate-100 font-sans font-black flex items-center justify-center text-xl rounded-2xl mx-auto shadow-sm">
            {employee.fullName.split(' ')[0][0]} {employee.fullName.split(' ')[1]?.[0] || ''}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 leading-tight">{employee.fullName}</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full inline-block mt-1 font-mono">{employee.employeeNo}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-500">الحالة الوظيفية:</span>
            <span className="text-emerald-700 font-bold">على رأس العمل</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">تاريخ التعيين:</span>
            <span className="text-slate-800 font-mono font-bold">{employee.hireDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">الراتب الأساسي:</span>
            <span className="text-slate-800 font-bold">{employee.baseSalary.toLocaleString()} ر.ي</span>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'personal' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>البيانات الأساسية</span>
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'assignment' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>التكليف والتموضع</span>
            </button>
            <button
              onClick={() => setActiveTab('qualification')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'qualification' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>المؤهلات والتأهيل العلمي</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'documents' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>الأرشيف والمستندات</span>
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                >
                  <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 font-semibold block">الرقم الوطني المشفّر (IAM Encryption)</span>
                    <span className="text-slate-800 font-mono text-xs font-bold">●●●●●●●●●●● (تشفير AES-256)</span>
                  </div>
                  <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 font-semibold block">سكن الموظف الحالي والموقع الجغرافي</span>
                    <span className="text-slate-800 font-bold block">{employee.currentLocationId === 1 ? 'أمانة العاصمة' : employee.currentLocationId === 2 ? 'محافظة عدن' : employee.currentLocationId === 3 ? 'تعز' : 'حضرموت'} - مديرية {employee.currentDistrictId === 10 ? 'التحرير' : employee.currentDistrictId === 20 ? 'صيرة' : 'أخرى'}</span>
                  </div>
                  <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 font-semibold block">الجنس</span>
                    <span className="text-slate-800 font-bold block">{employee.gender}</span>
                  </div>
                  <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 font-semibold block">تاريخ الميلاد</span>
                    <span className="text-slate-800 font-mono font-bold block">{employee.birthDate}</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'assignment' && (
                <motion.div
                  key="assignment-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3 text-xs"
                >
                  <div className="p-4 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                      <span className="font-bold text-slate-800">التكليف الحالي النشط</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-800 px-2 py-0.5 rounded font-bold">نشط</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 mt-2">
                      <p><strong>طبيعة مكان العمل:</strong> {employee.cadreTypeId === 2 ? 'مدرسة التربية للتعليم الأساسي والمراهقين' : 'ديوان التربية والتعليم بالمديرية'}</p>
                      <p><strong>المسمى الوظيفي:</strong> {employee.cadreTypeId === 2 ? 'معلم متخصص فئة (أ)' : 'موظف تخطيط ودراسات إحصائية'}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'qualification' && (
                <motion.div
                  key="qualification-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3 text-xs"
                >
                  {qualifications.map(q => (
                    <div key={q.qualificationId} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-sans font-black text-sm text-slate-800 block">{q.degreeName} في {q.specialization}</span>
                        <p className="text-slate-500 font-semibold">{q.university} - عام التخرج: {q.graduationYear}</p>
                      </div>
                      <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div
                  key="documents-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragging ? 'border-emerald-600 bg-emerald-500/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-xs font-bold text-slate-800">اسحب وأفلت مستند ممسوح ضوئياً هنا للرفع</h3>
                    <p className="text-[10px] text-slate-400 mt-1">تنسيقات مدعومة: PDF, JPG, PNG (بحد أقصى 10 ميجا)</p>
                    
                    <button 
                      type="button" 
                      onClick={triggerManualUpload}
                      className="mt-3 bg-slate-900 text-white hover:bg-teal-900 border border-slate-800 text-[10px] px-3 py-1.5 rounded-lg font-bold"
                    >
                      أو تصفح الملفات يدوياً
                    </button>
                  </div>

                  {/* Document List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700">الملفات الثبوتية المسجلة بالأرشيف الإلكتروني الآمن</h4>
                    
                    <div className="space-y-2">
                      {uploadedFiles.filter(d => d.employeeId === employee.employeeId).map(doc => (
                        <div 
                          key={doc.documentId} 
                          onClick={() => selectFileForQrCode(doc)}
                          className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-emerald-500/55 cursor-pointer bg-white scale-100 active:scale-[0.99] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-xs text-right">
                              <span className="font-bold text-slate-800 block">{doc.title}</span>
                              <span className="text-[9px] font-mono text-slate-400 block truncate max-w-xs md:max-w-md">SHA256: {doc.hash}</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-1 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 text-slate-400 transition-all">
                            <QrCode className="h-5 w-5" title="معاينة رمز التحقق المرئي QR" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Verifiable QR Section */}
        {qrContent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 border border-slate-800 shadow-lg"
          >
            <div className="bg-white p-3.5 rounded-xl block shadow-md shrink-0">
              {/* Representing visual QR code using SVG */}
              <svg width="128" height="128" viewBox="0 0 29 29" className="mx-auto select-none">
                <rect width="29" height="29" fill="white" />
                <path d="M0 0h7v7H0zm2 2v3h3V2zm0 0h1v1H2zm7 0h1v1H9zm2 0h3v3h-3zm1 1v1h1V3zm5-3h7v7h-7zm2 2v3h3V2zm2 0h1v1h-1zm-13 7h1v1H9zm2 0h1v1h-1zm1 1h1v1h-1zm-4 1h1v1H9zm1 1h2v1h-2zm-5-3h1v1H5zm1 1h1v1H6zm-3 2h2v1H3zm13-3h1v1h-1zm1 1h1v1h-1zm2-2h1v1h-1zm3 1h1v1h-1zm-3 2h3v1h-3zm-6 2h1v1h-1zm1 1h1v1h-1zm2-1h1v1H20zm1 1h1v1H21zm1 1h1v1H22zm1-2h1v1H23zm4 0h1v1h-1zm0 2h1v1h-1z" fill="#0f172a" />
                <path d="M22 22h7v7h-7zm2 2v3h3V24zm-22 0h7v7H0zm2 2v3h3v-3z" fill="#0c5e40" />
              </svg>
              <span className="text-[8px] font-mono text-slate-500 font-semibold block text-center mt-2 tracking-wider">SECURE_VERIFIABLE_MEMBER</span>
            </div>
            
            <div className="space-y-2 text-right">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                مستند معمد ورقمي آمن (MoE Verified Cryptographic Hash)
              </span>
              <h3 className="font-sans font-bold text-sm text-slate-100">رمز الاستجابة السريعة للتحقق الفوري من التواقيع</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                عند طباعة هذا المستند، تولد الخوارزمية تلقائياً رمز QR ورأسية تشفير مطابقة للنموذج المركزي بسحابية الخدمة، مما يمنع التزوير والتعديل المالي العشوائي.
              </p>
              <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                <span className="text-[9px] font-mono text-emerald-400 block break-all leading-tight max-w-sm">
                  {qrContent}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
