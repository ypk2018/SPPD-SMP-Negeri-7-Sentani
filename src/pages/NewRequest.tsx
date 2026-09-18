import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

export default function NewRequest() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    staffId: '',
    purpose: '',
    departureCity: 'Sentani',
    destinationCity: '',
    transportType: 'Kendaraan Umum',
    startDate: '',
    endDate: '',
    transportCost: 0,
    dailyCost: 0,
    accommodationCost: 0
  });

  useEffect(() => {
    const fetchStaff = async () => {
      const q = query(collection(db, 'staff'));
      const snapshot = await getDocs(q);
      const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(staff);
    };
    fetchStaff();
  }, []);

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const staffId = e.target.value;
    const staff = staffList.find(s => s.id === staffId);
    setSelectedStaff(staff);
    setFormData({ ...formData, staffId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff) {
      alert('Pilih staf terlebih dahulu');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const lengthOfJourney = Math.max(1, differenceInDays(end, start) + 1);

    try {
      await addDoc(collection(db, 'travel_requests'), {
        staffId: selectedStaff.id,
        staffUid: profile?.uid, // Untuk melacak siapa yang membuat (bisa staf itu sendiri atau admin)
        staffName: selectedStaff.name,
        staffNip: selectedStaff.nip,
        staffPosition: selectedStaff.position,
        staffRank: selectedStaff.rank,
        purpose: formData.purpose,
        departureCity: formData.departureCity,
        destinationCity: formData.destinationCity,
        transportType: formData.transportType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        lengthOfJourney,
        budget: {
          transport: Number(formData.transportCost),
          daily: Number(formData.dailyCost),
          accommodation: Number(formData.accommodationCost),
          total: Number(formData.transportCost) + Number(formData.dailyCost) + Number(formData.accommodationCost)
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      alert('Pengajuan SPPD berhasil dikirim. Menunggu persetujuan Kepala Sekolah.');
      navigate('/requests');
    } catch (error) {
      console.error('Gagal mengajukan SPPD', error);
      alert('Gagal mengajukan SPPD');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Pengajuan SPPD Baru</h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Staf (Guru / TU)</label>
              <select 
                required 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.staffId}
                onChange={handleStaffChange}
              >
                <option value="">-- Pilih Staf --</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.position}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maksud Perjalanan Dinas</label>
              <textarea 
                required 
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
                placeholder="Contoh: Mengikuti Bimbingan Teknis Kurikulum Merdeka"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Berangkat</label>
              <input 
                required 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.departureCity}
                onChange={e => setFormData({...formData, departureCity: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Tujuan</label>
              <input 
                required 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.destinationCity}
                onChange={e => setFormData({...formData, destinationCity: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alat Angkutan</label>
              <select 
                required 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.transportType}
                onChange={e => setFormData({...formData, transportType: e.target.value})}
              >
                <option value="Kendaraan Umum">Kendaraan Umum (Bus/Travel)</option>
                <option value="Kendaraan Dinas">Kendaraan Dinas</option>
                <option value="Pesawat Udara">Pesawat Udara</option>
                <option value="Kapal Laut">Kapal Laut</option>
              </select>
            </div>
            
            <div className="hidden md:block"></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berangkat</label>
              <input 
                required 
                type="date" 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Harus Kembali</label>
              <input 
                required 
                type="date" 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rincian Estimasi Biaya (Opsional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Transportasi (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.transportCost}
                  onChange={e => setFormData({...formData, transportCost: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uang Harian (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.dailyCost}
                  onChange={e => setFormData({...formData, dailyCost: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Penginapan (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.accommodationCost}
                  onChange={e => setFormData({...formData, accommodationCost: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/requests')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Ajukan SPPD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
