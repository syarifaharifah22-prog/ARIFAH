-- Create the surat table
CREATE TABLE IF NOT EXISTS public.surat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor SERIAL,
  perihal TEXT NOT NULL,
  kode_surat TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  tujuan TEXT NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.surat ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access (for development)
-- You can harden this later based on your needs
CREATE POLICY "Allow all access for everyone" ON public.surat
  FOR ALL
  USING (true)
  WITH CHECK (true);
