import { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Check, X, Download, FileText, Search, FileBadge } from 'lucide-react';
import { generateSPPD, generateSP } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [profile]);

  const fetchRequests = async () => {
    if (!profile) return;
    
    let q;
    if (profile.role === 'staff') {
      q = query(collection(db, 'travel_requests'), where('staffUid', '==', profile.uid));
    } else {
      q = query(collection(db, 'travel_requests'), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleStatusChange = async (reqId: string, status: string) => {
    await updateDoc(doc(db, 'travel_requests', reqId), {
      status,
      approvedBy: profile?.name,
      updatedAt: new Date().toISOString()
    });
    fetchRequests();
    // Simulasi Notifikasi Email
    alert(`Notifikasi email dikirim ke pemohon: Status pengajuan diubah menjadi ${status}`);
  };

  const handleDownloadPDF = async (request: any, type: 'SP' | 'SPPD') => {
    try {
      const staffQuery = query(collection(db, 'staff'), where('position', '==', 'Kepala Sekolah'));
      const staffSnap = await getDocs(staffQuery);
      let principal = { name: 'Kepala Sekolah', nip: '' };
      if (!staffSnap.empty) {
        principal = staffSnap.docs[0].data() as any;
      }
      
      const doc = type === 'SPPD' ? generateSPPD(request, principal) : generateSP(request, principal);
      doc.save(`${type}_${request.staffName}_${format(new Date(request.startDate), 'ddMMyyyy')}.pdf`);
    } catch (error) {
      console.error("Gagal generate PDF", error);
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(requests.map(r => ({
      ID: r.id,
      'Nama Staf': r.staffName,
      'Tujuan': r.destinationCity,
      'Maksud': r.purpose,
      'Mulai': r.startDate,
      'Selesai': r.endDate,
      'Status': r.status,
      'Transport (Rp)': r.budget?.transport || 0,
      'Harian (Rp)': r.budget?.daily || 0,
      'Penginapan (Rp)': r.budget?.accommodation || 0
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap SPPD");
    XLSX.writeFile(wb, "Rekap_SPPD.xlsx");
  };

  const filteredRequests = requests.filter(r => 
    r.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.destinationCity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pengajuan SPPD</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau tujuan..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {(profile?.role === 'admin' || profile?.role === 'principal') && (
            <button 
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 whitespace-nowrap"
            >
              <Download size={18} />
              Export Excel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-medium text-gray-600">Tanggal Pengajuan</th>
                <th className="p-4 font-medium text-gray-600">Nama Staf</th>
                <th className="p-4 font-medium text-gray-600">Tujuan & Waktu</th>
                <th className="p-4 font-medium text-gray-600">Maksud</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">
                    {req.createdAt ? format(new Date(req.createdAt), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{req.staffName}</div>
                    <div className="text-xs text-gray-500">{req.staffNip}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-medium text-gray-800">{req.destinationCity}</div>
                    <div className="text-gray-500">
                      {req.startDate && format(new Date(req.startDate), 'dd MMM', { locale: id })} - 
                      {req.endDate && format(new Date(req.endDate), 'dd MMM yyyy', { locale: id })}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700 max-w-xs truncate" title={req.purpose}>
                    {req.purpose}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {req.status === 'approved' && (
                        <>
                          <button 
                            onClick={() => handleDownloadPDF(req, 'SP')}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Download Surat Perintah (SP)"
                          >
                            <FileBadge size={18} />
                          </button>
                          <button 
                            onClick={() => handleDownloadPDF(req, 'SPPD')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Download SPPD"
                          >
                            <FileText size={18} />
                          </button>
                        </>
                      )}
                      
                      {profile?.role === 'principal' && req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(req.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Setujui"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(req.id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Tolak"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Tidak ada data pengajuan SPPD
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
