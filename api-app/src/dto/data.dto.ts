export interface DataDto {
  judul: string;
  tabel: {
    id: number;
    nama: string;
    dansos: number;
    kas: number;
  }[];
  keterangan: string;
}
