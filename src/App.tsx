import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FilePlus, 
  History, 
  Menu, 
  X, 
  Building2, 
  ShieldCheck, 
  Info, 
  UserCircle,
  ChevronRight,
  Search,
  Copy,
  Trash2,
  FileDown,
  FileSpreadsheet,
  Calendar,
  Tag,
  Send,
  Loader2,
  Filter,
  ArrowUpDown,
  BarChart3,
  TrendingUp,
  Clock,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Mail,
  FileText,
  CheckCircle2,
  MousePointer2,
  Key,
  Quote,
  Check
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase } from './lib/supabase';
import { cn, formatDate } from './lib/utils';
import type { Surat, SuratInsert } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { format, subDays, isWithinInterval, parseISO, getYear, startOfYear, endOfYear } from 'date-fns';

const formatFullNomor = (kode: string, nomor: number | string) => {
  const formattedNomor = String(nomor).padStart(2, '0');
  // Jika kode diakhiri titik, hapus titiknya lalu tambah strip
  const cleanKode = kode.endsWith('.') ? kode.slice(0, -1) : kode;
  return `${cleanKode}-${formattedNomor}`;
};

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'ambil', label: 'Ambil Nomor', icon: FilePlus },
    { id: 'riwayat', label: 'Riwayat & Statistik', icon: History },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-gradient text-white border-b border-gold/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="rounded-full shadow-gold/20 shadow-lg flex items-center justify-center w-10 h-10 md:w-12 md:h-12 overflow-hidden"
            >
              <img 
                src="https://iili.io/B1rLqTN.md.png" 
                alt="Logo Rutan Sabang" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-black text-sm md:text-xl tracking-tighter leading-none">SIPENSUS</span>
              <span className="text-[10px] md:text-xs text-gold font-bold tracking-widest uppercase">Rutan Sabang</span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm",
                  activeTab === item.id 
                    ? "bg-gold text-navy shadow-lg shadow-gold/20" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-gold hover:bg-white/10 rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-navy-light border-t border-gold/20 overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-4 w-full px-5 py-4 rounded-xl transition-all font-bold",
                    activeTab === item.id 
                      ? "bg-gold text-navy shadow-lg" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const generateGuidePDF = () => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(10, 15, 44);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PANDUAN PENGGUNAAN SIPENSUS', 105, 25, { align: 'center' });
  
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(12);
  doc.text('Rutan Kelas IIB Sabang', 105, 33, { align: 'center' });

  // Content
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PENDAHULUAN', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const intro = 'SIPENSUS (Sistem Pengambilan Nomor Surat Khusus) adalah aplikasi digital untuk mempermudah pengambilan nomor surat secara otomatis dan terintegrasi di Rutan Sabang.';
  doc.text(doc.splitTextToSize(intro, 170), 20, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('2. LANGKAH PENGAMBILAN NOMOR', 20, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const steps = [
    'Buka menu "AMBIL NOMOR" pada navigasi atas atau klik tombol di beranda.',
    'Pilih "Kode Surat" sesuai dengan jenis surat yang akan dibuat.',
    'Isi "Perihal Surat" dengan ringkasan isi surat.',
    'Isi "Tujuan Surat" (Instansi atau perorangan yang dituju).',
    'Isi "Pemohon/Keterangan" (Nama bagian atau petugas yang meminta).',
    'Klik tombol "SIMPAN & TERBITKAN NOMOR".',
    'Nomor surat akan muncul otomatis. Klik ikon salin untuk menyalin nomor.'
  ];
  
  let y = 87;
  steps.forEach((step, i) => {
    doc.text(`${i + 1}. ${step}`, 25, y);
    y += 8;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('3. RIWAYAT & STATISTIK', 20, 150);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const history = 'Anda dapat melihat semua riwayat nomor surat yang telah diterbitkan pada menu "RIWAYAT & STATISTIK". Di sana Anda juga dapat melakukan pencarian, filter tanggal, dan ekspor data ke format PDF atau Excel.';
  doc.text(doc.splitTextToSize(history, 170), 20, 157);

  // Footer
  doc.setDrawColor(212, 175, 55);
  doc.line(20, 270, 190, 270);
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('SIPENSUS Sabang - Inovasi Digital Pemasyarakatan', 105, 277, { align: 'center' });

  doc.save('Panduan_SIPENSUS_Sabang.pdf');
  toast.success('Panduan PDF berhasil diunduh');
};

const Hero = ({ onAction, onDownloadGuide }: { onAction: () => void, onDownloadGuide: () => void }) => (
  <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://iili.io/B1inD8u.md.jpg" 
        alt="Background" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-transparent to-navy/80" />
    </div>
    
    <div className="relative z-10 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="text-left"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center border-2 border-gold/20"
          >
            <Key className="w-10 h-10 md:w-12 md:h-12 text-navy" />
          </motion.div>
          <div className="flex flex-col">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-2"
            >
              <Sparkles className="w-3 h-3 text-gold" />
              Direktorat Jenderal Pemasyarakatan
            </motion.div>
            <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Kementerian Imigrasi dan Pemasyarakatan</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter font-display">
          RUMAH TAHANAN NEGARA <br />
          <span className="text-gold">KELAS IIB SABANG</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl font-medium leading-relaxed">
          Sistem Penomoran Surat Digital yang Modern dan Efisien untuk Pelayanan Administrasi yang Lebih Baik.
        </p>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onAction}
            className="px-8 py-4 bg-gold text-navy rounded-2xl font-black flex items-center gap-3 hover:bg-white transition-all shadow-xl shadow-gold/20 group"
          >
            AMBIL NOMOR SURAT
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={onDownloadGuide}
            className="px-8 py-4 bg-white/5 text-white border-2 border-white/20 rounded-2xl font-black flex items-center gap-3 hover:bg-white/10 hover:border-gold transition-all shadow-lg group"
          >
            <FileDown className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
            PANDUAN PENGGUNAAN
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative flex items-center justify-center mt-16 lg:mt-0"
      >
        <div className="relative">
          {/* Main Icon Circle */}
          <motion.div 
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-navy-light to-navy flex items-center justify-center shadow-2xl relative z-10 border-4 md:border-8 border-white/20"
          >
            <div className="absolute inset-0 bg-gold/10 rounded-[2.5rem] animate-pulse" />
            <Mail className="w-32 h-32 md:w-40 md:h-40 text-gold" />
          </motion.div>

          {/* Floating Decorative Icons */}
          <motion.div 
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 -right-8 md:-top-12 md:-right-12 w-16 h-16 md:w-24 md:h-24 bg-gold rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-center z-20 border-2 md:border-4 border-navy"
          >
            <FileText className="w-8 h-8 md:w-10 md:h-10 text-navy" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl md:rounded-[2rem] shadow-xl flex items-center justify-center z-20 border border-navy/5"
          >
            <div className="text-center">
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-navy mx-auto mb-1" />
              <p className="text-[8px] md:text-[10px] font-black text-navy uppercase tracking-widest">Aman</p>
              <p className="text-sm md:text-lg font-black text-gold">100%</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-1/2 -right-12 md:-right-20 w-16 h-16 md:w-20 md:h-20 bg-navy-light rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center z-20 border-2 md:border-4 border-white/20"
          >
            <Send className="w-6 h-6 md:w-8 md:h-8 text-gold" />
          </motion.div>

          {/* Background Glow */}
          <div className="absolute inset-0 bg-gold/20 blur-[80px] md:blur-[100px] -z-10 rounded-full scale-150" />
        </div>
      </motion.div>
    </div>
  </section>
);

const FungsiAplikasi = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-navy mb-4 tracking-tight">Fungsi Aplikasi</h2>
        <p className="text-slate-500 font-medium">Fitur utama untuk mendukung produktivitas kerja</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Generate Otomatis', desc: 'Nomor surat otomatis dengan format terstruktur.' },
          { title: 'Penyimpanan Aman', desc: 'Data surat tersimpan secara digital dan terpusat.' },
          { title: 'Export Data', desc: 'Cetak riwayat ke format PDF dan Excel dengan mudah.' },
          { title: 'Riwayat Lengkap', desc: 'Pantau semua surat yang pernah dibuat kapan saja.' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-gold/30 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Check className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-xl font-black text-navy mb-3">{item.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const StatsDashboard = ({ data }: { data: Surat[] }) => {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(date => ({
      name: format(parseISO(date), 'dd MMM'),
      value: data.filter(s => s.tanggal === date).length
    })).filter(item => item.value > 0); // Only show days with data in PieChart
  }, [data]);

  const totalSurat = data.length;
  const suratHariIni = data.filter(s => s.tanggal === format(new Date(), 'yyyy-MM-dd')).length;
  const suratTerakhir = data.length > 0 ? data[0] : null;

  const COLORS = ['#0A0F2C', '#D4AF37', '#1A1F3C', '#B8860B', '#C0C0C0', '#F1C40F', '#2A2F4C'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 card bg-white overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-navy flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-gold" />
            Distribusi Surat (7 Hari Terakhir)
          </h3>
          <div className="px-3 py-1 bg-gold/10 text-gold-dark text-xs font-bold rounded-full uppercase tracking-widest">
            Pie Chart View
          </div>
        </div>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <BarChart3 className="w-12 h-12 opacity-20" />
              <p className="font-bold">Belum ada data untuk ditampilkan</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card bg-navy text-white border-none shadow-gold/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gold rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-navy" />
            </div>
            <div>
              <p className="text-gold/80 text-sm font-bold uppercase tracking-widest">Total Surat</p>
              <h4 className="text-4xl font-black">{totalSurat}</h4>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-white border-gold/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-navy rounded-2xl shadow-lg">
              <Clock className="w-8 h-8 text-gold" />
            </div>
            <div>
              <p className="text-navy/60 text-sm font-bold uppercase tracking-widest">Surat Hari Ini</p>
              <h4 className="text-4xl font-black text-navy">{suratHariIni}</h4>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card navy-gold-gradient text-white border-none relative overflow-hidden"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Nomor Terakhir</p>
              <h4 className="text-xl md:text-2xl font-black truncate">
                {suratTerakhir ? formatFullNomor(suratTerakhir.kode_surat, suratTerakhir.nomor) : '-'}
              </h4>
              {suratTerakhir && (
                <p className="text-[10px] text-gold font-bold truncate mt-1">
                  {suratTerakhir.perihal}
                </p>
              )}
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ShieldCheck className="w-24 h-24" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const RiwayatData = () => {
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Surat, direction: 'asc' | 'desc' }>({ key: 'nomor', direction: 'desc' });

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('surat')
        .select('*')
        .order('nomor', { ascending: false });

      if (error) throw error;
      setSuratList(data || []);
    } catch (error: any) {
      toast.error('Gagal mengambil data riwayat', {
        description: error.message || 'Terjadi kesalahan pada database.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurat();
    const channel = supabase
      .channel('surat_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surat' }, () => fetchSurat())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredAndSortedSurat = useMemo(() => {
    let result = [...suratList];

    // Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.perihal.toLowerCase().includes(lowerSearch) ||
        s.kode_surat.toLowerCase().includes(lowerSearch) ||
        s.tujuan.toLowerCase().includes(lowerSearch)
      );
    }

    // Date Range Filter
    if (dateRange.start && dateRange.end) {
      result = result.filter(s => 
        isWithinInterval(parseISO(s.tanggal), {
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end)
        })
      );
    }

    // Sorting
    result.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [suratList, searchTerm, dateRange, sortConfig]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      const { error } = await supabase.from('surat').delete().eq('id', id);
      if (error) throw error;
      toast.success('Data berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Kode surat disalin ke clipboard');
  };

  const exportToPDF = () => {
    if (filteredAndSortedSurat.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(10, 15, 44);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RIWAYAT NOMOR SURAT - RUTAN SABANG', 105, 15, { align: 'center' });
    
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(10);
    doc.text('Sistem Informasi Pengambilan Nomor Surat Khusus (SIPENSUS)', 105, 22, { align: 'center' });

    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 38);
    
    const tableData = filteredAndSortedSurat.map(s => [
      s.nomor,
      formatFullNomor(s.kode_surat, s.nomor),
      s.perihal,
      formatDate(s.tanggal),
      s.tujuan,
      s.keterangan || '-'
    ]);

    autoTable(doc, {
      head: [['No.', 'Nomor Lengkap', 'Perihal', 'Tanggal', 'Tujuan', 'Pemohon']],
      body: tableData,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [10, 15, 44], textColor: [212, 175, 55], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 25 }
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9 }
    });

    doc.save(`Riwayat_Surat_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    toast.success('Riwayat PDF berhasil diunduh');
  };

  const exportToExcel = () => {
    if (filteredAndSortedSurat.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredAndSortedSurat.map(s => ({
      'No.': s.nomor,
      'Nomor Lengkap': formatFullNomor(s.kode_surat, s.nomor),
      'Perihal': s.perihal,
      'Tanggal': s.tanggal,
      'Tujuan': s.tujuan,
      'Pemohon': s.keterangan,
      'Dibuat Pada': s.created_at
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Surat");
    XLSX.writeFile(wb, `Riwayat_Surat_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <StatsDashboard data={suratList} />

      {/* Filters & Controls */}
      <div className="card border-gold/20 bg-white/80 backdrop-blur-md sticky top-24 z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perihal, kode, atau tujuan..."
              className="input-field pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="lg:col-span-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                className="input-field pl-10 text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <span className="text-slate-400 font-bold">s/d</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                className="input-field pl-10 text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          {/* Sort & Export */}
          <div className="lg:col-span-4 flex gap-3">
            <select 
              className="input-field text-sm font-bold flex-1"
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-') as [keyof Surat, 'asc' | 'desc'];
                setSortConfig({ key, direction });
              }}
            >
              <option value="nomor-desc">Nomor Terbesar</option>
              <option value="nomor-asc">Nomor Terkecil</option>
              <option value="created_at-desc">Terbaru</option>
              <option value="created_at-asc">Terlama</option>
              <option value="kode_surat-asc">Kode (A-Z)</option>
              <option value="kode_surat-desc">Kode (Z-A)</option>
            </select>
            
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToPDF} 
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 border border-red-500/20 font-bold text-xs"
              >
                <FileDown className="w-4 h-4" /> PDF
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToExcel} 
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 border border-green-500/20 font-bold text-xs"
              >
                <FileSpreadsheet className="w-4 h-4" /> EXCEL
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card p-0 overflow-hidden border-gold/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy text-white">
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-gold">No.</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-gold">Nomor Lengkap</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-gold">Perihal</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-gold">Tanggal</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-gold">Tujuan</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-gold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-6">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredAndSortedSurat.length > 0 ? (
                filteredAndSortedSurat.map((surat) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={surat.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-6">
                      <span className="font-black text-navy/40 text-xs">#{surat.nomor}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy font-bold text-xs border border-navy/10">
                          {surat.kode_surat.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-black text-navy">{formatFullNomor(surat.kode_surat, surat.nomor)}</span>
                          <button 
                            onClick={() => handleCopy(formatFullNomor(surat.kode_surat, surat.nomor))} 
                            className="text-[10px] text-gold-dark font-bold hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-2.5 h-2.5" /> Salin Kode
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-navy leading-tight">{surat.perihal}</p>
                      {surat.keterangan && <p className="text-[11px] text-slate-400 mt-1 line-clamp-1"><span className="font-black text-gold/80">Pemohon:</span> {surat.keterangan}</p>}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-gold" />
                        <span className="text-xs font-bold">{formatDate(surat.tanggal)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-navy/5 text-navy text-[11px] font-black border border-navy/10 uppercase">
                        {surat.tujuan}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleCopy(formatFullNomor(surat.kode_surat, surat.nomor))}
                          className="p-2.5 text-gold hover:text-gold-dark hover:bg-gold/10 rounded-xl transition-all"
                          title="Salin Nomor Surat"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Search className="w-12 h-12 opacity-20" />
                      <p className="font-bold">Tidak ada data yang sesuai dengan filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FormAmbilNomor = ({ onSuccess }: { onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SuratInsert>({
    perihal: '',
    kode_surat: '',
    tanggal: format(new Date(), 'yyyy-MM-dd'),
    tujuan: '',
    keterangan: '',
    nomor: 0 // Akan dihitung saat submit
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Hitung nomor urut berdasarkan tahun dari tanggal surat
      const selectedDate = parseISO(formData.tanggal);
      const year = getYear(selectedDate);
      const startDate = format(startOfYear(selectedDate), 'yyyy-MM-dd');
      const endDate = format(endOfYear(selectedDate), 'yyyy-MM-dd');

      // Ambil nomor terakhir di tahun tersebut
      const { data: lastSurat, error: fetchError } = await supabase
        .from('surat')
        .select('nomor')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('nomor', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextNomor = lastSurat && lastSurat.length > 0 ? lastSurat[0].nomor + 1 : 1;

      // 2. Simpan data dengan nomor yang sudah dihitung
      const dataToInsert = { ...formData, nomor: nextNomor };
      const { data: insertedData, error } = await supabase.from('surat').insert([dataToInsert]).select();
      
      if (error) throw error;
      
      const newSurat = insertedData?.[0];
      const fullNomor = formatFullNomor(formData.kode_surat, newSurat?.nomor || nextNomor);
      toast.success('Nomor surat berhasil dibuat!', {
        description: `Nomor Lengkap: ${fullNomor}`,
        duration: 5000,
      });
      setFormData({ 
        perihal: '', 
        kode_surat: '', 
        tanggal: format(new Date(), 'yyyy-MM-dd'), 
        tujuan: '', 
        keterangan: '',
        nomor: 0
      });
      onSuccess();
    } catch (error: any) {
      toast.error('Gagal membuat nomor surat', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="card card-gradient p-8 md:p-12 border-gold/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-navy via-gold to-navy" />
        
        <div className="mb-10 text-center">
          <div className="inline-flex p-4 bg-navy/5 rounded-3xl mb-4 border border-navy/10">
            <FilePlus className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-3xl font-black text-navy tracking-tight">Ambil Nomor Surat</h2>
          <p className="text-slate-500 font-medium">Lengkapi formulir di bawah untuk mendapatkan nomor resmi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold" /> Kode Surat
              </label>
              <input
                required
                type="text"
                placeholder="W1.PAS.PAS.10..."
                className="input-field py-4 font-mono font-bold"
                value={formData.kode_surat}
                onChange={(e) => setFormData({...formData, kode_surat: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" /> Tanggal Surat
              </label>
              <input
                required
                type="date"
                className="input-field py-4 font-bold"
                value={formData.tanggal}
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-navy uppercase tracking-widest">Perihal</label>
            <input
              required
              type="text"
              placeholder="Contoh: Permohonan Cuti Tahunan"
              className="input-field py-4 font-bold"
              value={formData.perihal}
              onChange={(e) => setFormData({...formData, perihal: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-navy uppercase tracking-widest">Tujuan Surat</label>
            <input
              required
              type="text"
              placeholder="Contoh: Kanwil Kemenimipas Aceh"
              className="input-field py-4 font-bold"
              value={formData.tujuan}
              onChange={(e) => setFormData({...formData, tujuan: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-navy uppercase tracking-widest">Nama Pemohon</label>
            <textarea
              rows={4}
              placeholder="Masukkan nama pemohon atau detail khusus jika ada..."
              className="input-field py-4 font-medium resize-none"
              value={formData.keterangan}
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gold hover:bg-gold-dark text-navy py-5 flex items-center justify-center gap-4 text-xl rounded-xl font-bold transition-all duration-300 disabled:opacity-70 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <>
                <Send className="w-6 h-6" />
                SIMPAN & TERBITKAN NOMOR
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-gold/30 selection:text-navy">
      <Toaster position="top-right" richColors closeButton />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-16 md:pt-20">
        <AnimatePresence mode="wait">
          {activeTab === 'beranda' && (
            <motion.div
              key="beranda"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero 
                onAction={() => setActiveTab('ambil')} 
                onDownloadGuide={generateGuidePDF}
              />
              
              {/* About Section */}
              <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="space-y-10"
                    >
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gold/10 text-gold-dark text-xs font-black uppercase tracking-widest mb-4">
                          Profil Instansi
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-navy mb-6 tracking-tighter leading-none">
                          Tentang <br />
                          <span className="text-gold">Rutan Sabang</span>
                        </h2>
                        <div className="w-32 h-2 bg-gold rounded-full" />
                      </div>
                      <p className="text-xl text-slate-600 leading-relaxed font-medium">
                        Rumah Tahanan Negara Kelas IIB Sabang berdiri sejak tahun 1985, berkomitmen memberikan pelayanan terbaik dalam sistem pemasyarakatan Indonesia.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="card border-none bg-slate-50 p-8 hover:bg-navy hover:text-white transition-all duration-500 group">
                          <h3 className="font-black text-navy group-hover:text-gold mb-3 uppercase tracking-widest text-xs">Visi Kami</h3>
                          <p className="text-sm text-slate-500 group-hover:text-slate-300 leading-relaxed">Terwujudnya Sistem Pemasyarakatan yang Profesional.</p>
                        </div>
                        <div className="card border-none bg-slate-50 p-8 hover:bg-gold hover:text-navy transition-all duration-500 group">
                          <h3 className="font-black text-navy group-hover:text-navy mb-3 uppercase tracking-widest text-xs">Misi Kami</h3>
                          <p className="text-sm text-slate-500 group-hover:text-navy/70 leading-relaxed">Melaksanakan pembinaan tahanan secara optimal dengan mengedepankan HAM dan nilai-nilai kemanusiaan.</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      <div className="card bg-navy p-12 text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold rounded-3xl flex items-center justify-center shadow-xl rotate-12">
                          <ShieldCheck className="w-14 h-14 text-navy" />
                        </div>
                        <h3 className="text-3xl font-black mb-8 text-gold uppercase tracking-tighter">Apa itu SIPENSUS?</h3>
                        <p className="text-lg text-slate-300 leading-relaxed mb-10">
                          SIPENSUS (Sistem Pengambilan Nomor Surat Khusus) adalah platform digital resmi Rutan Sabang yang dirancang untuk mengotomatisasi proses administrasi persuratan. Sistem ini memastikan setiap nomor surat tercatat secara akurat, mencegah duplikasi, dan memudahkan pengarsipan data secara terpusat.
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-1.5 bg-gold rounded-full" />
                          <span className="font-black tracking-widest uppercase text-xs text-gold">Efisiensi • Transparansi • Akurasi</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              <FungsiAplikasi />

              <AlurPengambilan />

              <AppDescription />
              
              <footer className="py-20 bg-navy text-white border-t border-gold/20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src="https://iili.io/B1rLqTN.md.png" 
                        alt="Logo Rutan Sabang" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-2xl tracking-tighter leading-none">SIPENSUS</span>
                      <span className="text-xs text-gold font-bold tracking-widest uppercase">Rutan Sabang</span>
                    </div>
                  </div>
                  <p className="text-slate-400 max-w-md mx-auto mb-10 font-medium">
                    Sistem informasi persuratan resmi Rumah Tahanan Negara Kelas IIB Sabang.
                  </p>
                  <div className="w-full h-px bg-white/10 mb-10" />
                  <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
                    KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN
                  </p>
                </div>
              </footer>
            </motion.div>
          )}

          {activeTab === 'ambil' && (
            <motion.div
              key="ambil"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-7xl mx-auto px-4 py-16 md:py-24"
            >
              <FormAmbilNomor onSuccess={() => setActiveTab('riwayat')} />
            </motion.div>
          )}

          {activeTab === 'riwayat' && (
            <motion.div
              key="riwayat"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-7xl mx-auto px-4 py-16 md:py-24"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gold/10 text-gold-dark text-xs font-black uppercase tracking-widest mb-3"
                  >
                    <History className="w-3.5 h-3.5" /> Monitoring & Arsip
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tighter">Riwayat & Statistik</h1>
                  <p className="text-slate-500 text-lg font-medium mt-2">Analisis data dan pengelolaan nomor surat secara komprehensif</p>
                </div>
              </div>
              <RiwayatData />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const AlurPengambilan = () => {
  const steps = [
    {
      title: 'Akses Menu',
      desc: 'Klik menu "Ambil Nomor" pada navigasi atas.',
      icon: MousePointer2,
      color: 'bg-blue-500'
    },
    {
      title: 'Isi Data',
      desc: 'Lengkapi formulir perihal, kode, dan tujuan surat.',
      icon: FileText,
      color: 'bg-gold'
    },
    {
      title: 'Terbitkan',
      desc: 'Klik tombol "Simpan & Terbitkan" untuk memproses.',
      icon: Send,
      color: 'bg-navy'
    },
    {
      title: 'Selesai',
      desc: 'Salin nomor surat lengkap yang muncul otomatis.',
      icon: CheckCircle2,
      color: 'bg-green-500'
    }
  ];

  return (
    <section className="py-24 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Alur Pengambilan <span className="text-gold">Nomor Surat</span></h2>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto">Ikuti langkah-langkah sederhana berikut untuk mendapatkan nomor surat resmi Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gold/20 -translate-x-1/2 z-0" />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border-4 border-white/10", step.color)}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="bg-gold text-navy w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-4 border-4 border-navy">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AppDescription = () => (
  <section className="py-32 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-5xl font-black text-navy mb-20 tracking-tight">Keunggulan <span className="gold-gradient-text">Sistem Kami</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { 
            title: 'Digitalisasi Total', 
            desc: 'Meninggalkan pencatatan manual yang berisiko hilang atau rusak.',
            icon: LayoutDashboard,
            color: 'from-navy to-navy-light'
          },
          { 
            title: 'Akurasi Data', 
            desc: 'Sistem penomoran otomatis yang menjamin urutan tetap konsisten.',
            icon: ShieldCheck,
            color: 'from-gold-dark to-gold'
          },
          { 
            title: 'Analisis Realtime', 
            desc: 'Pantau volume persuratan setiap hari melalui dashboard statistik.',
            icon: BarChart3,
            color: 'from-navy-light to-navy'
          }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="group relative"
          >
            <div className="card h-full p-10 border-none shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className={cn("inline-flex p-5 rounded-3xl bg-gradient-to-br text-white mb-8 shadow-lg group-hover:scale-110 transition-transform", item.color)}>
                <item.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-navy">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
