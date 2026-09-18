import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'travel_requests'));
      const snapshot = await getDocs(q);
      
      let total = 0;
      let approved = 0;
      let pending = 0;
      const frequencyMap: Record<string, number> = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'approved') approved++;
        if (data.status === 'pending') pending++;
        
        const staffName = data.staffName || 'Unknown';
        frequencyMap[staffName] = (frequencyMap[staffName] || 0) + 1;
      });

      setStats({ total, approved, pending });
      
      const chart = Object.keys(frequencyMap).map(name => ({
        name,
        count: frequencyMap[name]
      })).sort((a, b) => b.count - a.count).slice(0, 10);
      
      setChartData(chart);
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Ringkasan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Pengajuan</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Disetujui</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Menunggu Persetujuan</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Frekuensi Perjalanan Dinas (Top 10)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{fontSize: 12}} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
