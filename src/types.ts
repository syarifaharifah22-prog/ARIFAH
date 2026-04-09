export interface Surat {
  id: string;
  nomor: number;
  perihal: string;
  kode_surat: string;
  tanggal: string;
  tujuan: string;
  keterangan: string;
  created_at: string;
}

export type SuratInsert = Omit<Surat, 'id' | 'created_at'>;
