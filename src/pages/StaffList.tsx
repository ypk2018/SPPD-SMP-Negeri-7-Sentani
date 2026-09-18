import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function StaffList() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', nip: '', position: '', rank: '', type: 'guru' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const q = query(collection(db, 'staff'));
    const snapshot = await getDocs(q);
    setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'staff'), formData);
    setIsModalOpen(false);
    setFormData({ name: '', nip: '', position: '', rank: '', type: 'guru' });
    fetchStaff();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus data staf ini?')) {
      await deleteDoc(doc(db, 'staff', id));
      fetchStaff();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Staf</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Staf
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-medium text-gray-600">Nama / NIP</th>
              <th className="p-4 font-medium text-gray-600">Jabatan</th>
              <th className="p-4 font-medium text-gray-600">Pangkat/Golongan</th>
              <th className="p-4 font-medium text-gray-600">Jenis</th>
              <th className="p-4 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.nip || '-'}</div>
                </td>
                <td className="p-4 text-gray-700">{s.position}</td>
                <td className="p-4 text-gray-700">{s.rank}</td>
                <td className="p-4 text-gray-700 capitalize">{s.type}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Staf</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NIP (Kosongkan jika non-PNS)</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jabatan</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pangkat/Golongan</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Staf</label>
                <select className="w-full border rounded-lg p-2" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="guru">Guru</option>
                  <option value="tu">Tata Usaha</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
