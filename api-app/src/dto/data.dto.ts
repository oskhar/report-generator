export interface DataDto {
  judul: string;
  tabel: {
    nama: string;
    dansos: number;
    kas: number;
  }[];
  keterangan: string;
}
