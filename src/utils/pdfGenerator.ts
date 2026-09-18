import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const generateSPPD = (data: any, principal: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PEMERINTAH KABUPATEN JAYAPURA', 105, 20, { align: 'center' });
  doc.text('DINAS PENDIDIKAN', 105, 26, { align: 'center' });
  doc.text('SMP NEGERI 7 SENTANI', 105, 32, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Alamat: Jl. Raya Sentani, Kabupaten Jayapura, Papua', 105, 38, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(1);
  doc.line(20, 42, 190, 42);
  doc.setLineWidth(0.5);
  doc.line(20, 43, 190, 43);

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT PERINTAH PERJALANAN DINAS (SPPD)', 105, 53, { align: 'center' });
  doc.text(`Nomor: 094 / ${data.id.substring(0,4)} / SMPN7 / 2026`, 105, 59, { align: 'center' });

  // Body
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const bodyData = [
    ['1', 'Pejabat yang memberi perintah', 'Kepala SMP Negeri 7 Sentani'],
    ['2', 'Nama / NIP Pegawai yang diperintah', `${data.staffName} / ${data.staffNip}`],
    ['3', 'Pangkat dan Golongan', data.staffRank || '-'],
    ['4', 'Jabatan / Instansi', `${data.staffPosition} / SMP Negeri 7 Sentani`],
    ['5', 'Tingkat Biaya Perjalanan Dinas', 'Tingkat C'],
    ['6', 'Maksud Perjalanan Dinas', data.purpose],
    ['7', 'Alat Angkutan yang dipergunakan', data.transportType || 'Kendaraan Umum'],
    ['8', 'Tempat Berangkat / Tujuan', `${data.departureCity || 'Sentani'} / ${data.destinationCity}`],
    ['9', 'Lamanya Perjalanan Dinas', `${data.lengthOfJourney || 1} hari`],
    ['10', 'Tanggal Berangkat', format(new Date(data.startDate), 'dd MMMM yyyy', { locale: id })],
    ['11', 'Tanggal Harus Kembali', format(new Date(data.endDate), 'dd MMMM yyyy', { locale: id })],
    ['12', 'Pembebanan Anggaran', 'Dana BOS / Sekolah'],
  ];

  (doc as any).autoTable({
    startY: 65,
    head: [],
    body: bodyData,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { cellWidth: 100 }
    }
  });

  // Footer / Signatures
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text(`Dikeluarkan di: Sentani`, 130, finalY);
  doc.text(`Pada tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, 130, finalY + 5);
  doc.text('Kepala SMP Negeri 7 Sentani,', 130, finalY + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.text(principal?.name || '______________________', 130, finalY + 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${principal?.nip || '______________________'}`, 130, finalY + 40);

  // --- PAGE 2: Stamps ---
  doc.addPage();
  
  const stampData = [
    [
      'I. Tiba di :\nPada Tanggal :\nPejabat yang memberi perintah:\n\n\n\n______________________\nNIP.',
      'Berangkat dari :\nKe :\nPada Tanggal :\nPejabat yang memberi perintah:\n\n\n\n______________________\nNIP.'
    ],
    [
      'II. Tiba di :\nPada Tanggal :\nPejabat yang memberi perintah:\n\n\n\n______________________\nNIP.',
      'Berangkat dari :\nKe :\nPada Tanggal :\nPejabat yang memberi perintah:\n\n\n\n______________________\nNIP.'
    ],
    [
      'III. Tiba di :\nPada Tanggal :\nPejabat yang memberi perintah:\n\n\n\n______________________\nNIP.',
      'Berangkat dari :\nKe :\nPada Tanggal :\nPejabat yang memberi perintah:\n\n\n\n______________________\nNIP.'
    ],
    [
      'IV. Tiba kembali di (Tempat Kedudukan) : Sentani\nPada Tanggal :\n\n\n\n______________________\nNIP.',
      'Telah diperiksa dengan keterangan bahwa perjalanan\ntersebut di atas benar dilakukan atas perintahnya dan\nsemata-mata untuk kepentingan jabatan.\n\nPejabat yang memberi perintah\n\n\n______________________\nNIP.'
    ]
  ];

  (doc as any).autoTable({
    startY: 20,
    head: [],
    body: stampData,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 5, minCellHeight: 50 },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 85 }
    }
  });

  return doc;
};

export const generateSP = (data: any, principal: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PEMERINTAH KABUPATEN JAYAPURA', 105, 20, { align: 'center' });
  doc.text('DINAS PENDIDIKAN', 105, 26, { align: 'center' });
  doc.text('SMP NEGERI 7 SENTANI', 105, 32, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Alamat: Jl. Raya Sentani, Kabupaten Jayapura, Papua', 105, 38, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(1);
  doc.line(20, 42, 190, 42);
  doc.setLineWidth(0.5);
  doc.line(20, 43, 190, 43);

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT PERINTAH TUGAS', 105, 55, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Nomor: 094 / ${data.id.substring(0,4)} / SMPN7 / 2026`, 105, 61, { align: 'center' });

  // Body
  doc.setFontSize(11);
  doc.text('Kepala SMP Negeri 7 Sentani, dengan ini memberi tugas kepada:', 20, 75);

  const staffData = [
    ['1.', 'Nama', `: ${data.staffName}`],
    ['2.', 'NIP', `: ${data.staffNip || '-'}`],
    ['3.', 'Pangkat/Golongan', `: ${data.staffRank || '-'}`],
    ['4.', 'Jabatan', `: ${data.staffPosition}`]
  ];

  (doc as any).autoTable({
    startY: 82,
    head: [],
    body: staffData,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 11, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 130 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.text('Untuk melaksanakan perjalanan dinas dalam rangka:', 20, finalY);
  
  // Create a block for the purpose that wraps text
  const purposeLines = doc.splitTextToSize(data.purpose, 170);
  doc.setFont('helvetica', 'bold');
  doc.text(purposeLines, 20, finalY + 8);
  doc.setFont('helvetica', 'normal');
  
  const nextY = finalY + 10 + (purposeLines.length * 5) + 5;
  
  doc.text(`Tempat Tujuan     : ${data.destinationCity}`, 20, nextY);
  doc.text(`Waktu Pelaksanaan : ${format(new Date(data.startDate), 'dd MMMM yyyy', { locale: id })} s.d. ${format(new Date(data.endDate), 'dd MMMM yyyy', { locale: id })}`, 20, nextY + 8);
  
  const textBody = doc.splitTextToSize('Demikian Surat Perintah Tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab dan setelah selesai agar membuat laporan tertulis.', 170);
  doc.text(textBody, 20, nextY + 22);

  // Signatures
  doc.text(`Ditetapkan di : Sentani`, 130, nextY + 45);
  doc.text(`Pada tanggal : ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, 130, nextY + 51);
  doc.text('Kepala SMP Negeri 7 Sentani,', 130, nextY + 59);
  
  doc.setFont('helvetica', 'bold');
  doc.text(principal?.name || '______________________', 130, nextY + 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${principal?.nip || '______________________'}`, 130, nextY + 91);

  return doc;
};
