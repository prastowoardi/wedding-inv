/* =========================================================
   KONFIGURASI UNDANGAN
   Ubah semua data di file ini. Tidak perlu menyentuh HTML.
   ========================================================= */
window.WEDDING = {
  couple: {
    bride: {
      name: 'Arinta',
      fullName: 'Prasiddha Dyah Arinta Fitriani',
      order: 'Putri dari',
      parents: 'Alm. Bapak Suhadi & Ibu Setyo Supriyati',
      instagram: 'https://instagram.com/Arinta.rahma',
      instagramLabel: '@Arinta.rahma',
    },
    groom: {
      name: 'Fajar',
      fullName: 'Fajar Nuryanto',
      order: 'Putra dari',
      parents: 'Bapak Ir. Bambang Prakoso & Ibu Dewi Lestari',
      instagram: 'https://instagram.com/Fajarprakoso',
      instagramLabel: '@Fajarprakoso',
    },
    hashtag: '#ArintaFajarForever',
  },

  wedding: {
    dateISO: '2026-12-12T08:00:00+07:00',
    dateLabel: 'Sabtu, 12 Desember 2026',
    dateShort: '12 · 12 · 2026',
    city: 'Yogyakarta',
    calendarTitle: 'Pernikahan Arinta & Fajar',
    calendarDescription: 'Akad nikah dan resepsi pernikahan Arinta & Fajar.',
  },

  /* Teks sambutan. Boleh memakai tag <em> untuk aksen miring. */
  opening: {
    salam: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    verse:
      'Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, agar kamu merasa <em>tenteram</em> dan Dia menjadikan di antara kamu rasa kasih dan sayang.',
    verseSource: 'QS. Ar-Rum: 21',
    text: 'Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami. Merupakan suatu kebahagiaan bagi kami apabila Anda berkenan hadir untuk memberikan doa restu.',
    closingSalam: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
  },

  events: [
    {
      name: 'Akad Nikah',
      date: 'Sabtu, 12 Desember 2026',
      time: '08.00 - 10.00 WIB',
      venue: 'Masjid Gedhe Kauman Yogyakarta',
      address: 'Jl. Kauman No. 3, Ngupasan, Gondomanan, Kota Yogyakarta',
      mapQuery: 'Masjid Gedhe Kauman Yogyakarta',
    },
    {
      name: 'Resepsi',
      date: 'Sabtu, 12 Desember 2026',
      time: '11.00 - 15.00 WIB',
      venue: 'Gedung Agung Yogyakarta',
      address: 'Jl. Ahmad Yani No. 2, Ngupasan, Gondomanan, Kota Yogyakarta',
      mapQuery: 'Gedung Agung Yogyakarta',
    },
  ],

  /* Peta yang ditampilkan di bagian acara. */
  map: {
    query: 'Gedung Agung Yogyakarta',
  },

  story: [
    {
      date: '2019',
      title: 'Pertemuan pertama',
      text: 'Sebuah proyek kampus mempertemukan kami. Tidak ada yang istimewa saat itu, selain percakapan yang ternyata tidak pernah benar-benar selesai.',
    },
    {
      date: '2021',
      title: 'Mulai berjalan bersama',
      text: 'Setelah dua tahun saling mengenal, kami memutuskan untuk berjalan lebih jauh. Lewat hujan, jarak, dan semua rencana yang berubah.',
    },
    {
      date: '2024',
      title: 'Lamaran',
      text: 'Di depan keluarga kecil kami, sebuah pertanyaan sederhana diucapkan. Jawabannya juga sederhana, tetapi mengubah banyak hal.',
    },
    {
      date: '2026',
      title: 'Menikah',
      text: 'Dan di hari ini, kami memilih untuk saling menjaga, bukan hanya sampai acara selesai, tetapi untuk seluruh perjalanan setelahnya.',
    },
  ],

  gallery: [
    { src: 'assets/images/couple-field.jpg', alt: 'Pasangan pengantin berjalan di padang rumput saat senja', caption: 'Sore di Lembang' },
    { src: 'assets/images/couple-laugh.jpg', alt: 'Pasangan pengantin tertawa bersama', caption: 'Tawa yang sama' },
    { src: 'assets/images/rings.jpg', alt: 'Dua cincin pernikahan di atas kain', caption: 'Dua cincin' },
    { src: 'assets/images/details.jpg', alt: 'Detail dekorasi dan buket pernikahan', caption: 'Detail kecil' },
    { src: 'assets/images/couple-walk.jpg', alt: 'Pasangan pengantin melangkah berdampingan', caption: 'Langkah yang sama' },
    { src: 'assets/images/reception.jpg', alt: 'Meja resepsi pernikahan dengan lilin', caption: 'Meja panjang' },
    { src: 'assets/images/rings-2.jpg', alt: 'Cincin pernikahan berkilau di bawah cahaya lembut', caption: 'Janji' },
  ],

  rsvp: {
    /* Kosongkan untuk mode demo (localStorage).
       Isi dengan endpoint POST, misalnya Formspree / Google Apps Script. */
    endpoint: 'https://script.google.com/macros/s/AKfycbzvYZOw9WimjnXhnV25mtNZMl22J7rkMCE3AxJTbtxemc3okAaKidaCM2o5n7kZn7VfaQ/exec',
    seedWishes: [
      
    ],
  },

  gifts: [
    {
      bank: 'BCA',
      label: 'Transfer bank',
      number: '1234567890',
      holder: 'Prasiddha Dyah Arinta Fitriani',
    },
    {
      bank: 'Mandiri',
      label: 'Transfer bank',
      number: '0987654321',
      holder: 'Fajar Nuryanto',
    },
  ],
  giftAddress: {
    recipient: 'Arinta & Fajar',
    address: 'Jl. Malioboro No. 123, Gondomanan, Kota Yogyakarta, DIY 55122',
  },

  contact: {
    whatsapp: '6281234567890',
    whatsappLabel: '+62 812 3456 7890',
  },

  share: {
    title: 'Arinta & Fajar — The Wedding',
    text: 'Kami menantikan kehadiran dan doa Anda di hari bahagia kami. Sabtu, 12 Desember 2026, Yogyakarta.',
  },

  music: {
    enabled: true,
    volume: 0.35,
  },
};
