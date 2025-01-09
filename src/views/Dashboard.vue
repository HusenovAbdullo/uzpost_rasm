<template>
  <div class="dashboard">
    <div class="banner">
      <h2>GIBRID XATLARINI TOPSHIRILISHINI NAZORAT QILISH DASTURI</h2>
      <button @click="logout" class="logout-button">Chiqish</button>
    </div>
    <div class="filters">
      <div class="filter-card">
        <select v-model="region" @change="updateDistricts">
          <option value="">Viloyatlar</option>
          <option value="Toshkent shahar">Toshkent shahar</option>
          <option value="Surxondaryo">Surxondaryo</option>
          <option value="Samarqand">Samarqand</option>
          <option value="Buxoro">Buxoro</option>
          <option value="Andijon">Andijon</option>
          <option value="Namangan">Namangan</option>
          <option value="Farg'ona">Farg'ona</option>
          <option value="Jizzax">Jizzax</option>
          <option value="Sirdaryo">Sirdaryo</option>
          <option value="Qashqadaryo">Qashqadaryo</option>
          <option value="Toshkent viloyati">Toshkent viloyati</option>
          <option value="Xorazm">Xorazm</option>
          <option value="Navoiy">Navoiy</option>
          <option value="Qoraqalpog'iston Respublikasi">
            Qoraqalpog'iston Respublikasi
          </option>

          <!-- Boshqa viloyatlar qo'shilishi mumkin -->
          <!-- Boshqa viloyatlar qo'shilishi mumkin -->
        </select>
        <select v-model="district">
          <option value="">Tumanlar</option>
          <option v-for="d in districts" :key="d" :value="d">
            {{ d }}
          </option>
        </select>
        <input v-model="barcode" placeholder="Barcode" />
        <input v-model="fish" placeholder="F.I.SH" />
        <input v-model="post_name" placeholder="Aloqa bo'lim" />
        <input v-model="date" placeholder="ДД.ММ.РРРР" type="date" />
        <select v-model="is_person">
          <option value="">Haqiqiyligini tekshirish</option>
          <option value="True">Xato</option>
          <option value="False">To'g'ri</option>
        </select>
        <button @click="applyFilter">Filterni qo'llash</button>
      </div>
    </div>
    <div class="results">
      <div v-for="item in images" :key="item.barcode" class="image-card" @click="openPopup(item)">
        <img :src="`https://trackapi.pochta.uz/${item.photo}`" alt="Image" />
      </div>
    </div>

    <!-- Popup Section -->
    <div v-if="showPopup" class="popup" @click.self="closePopup">
      <div class="popup-content">
        <span class="close" @click="closePopup">&times;</span>
        <img :src="`https://trackapi.pochta.uz/${popupData.photo}`" alt="Popup Image" @click="toggleFullScreen"
          class="popup-image image-container" />
        <p>Barcode: {{ popupData.barcode }}</p>
        <p>F.I.SH: {{ popupData.fish }}</p>
        <p>Viloyat: {{ popupData.region__name }}</p>
        <p>Tuman: {{ popupData.district__name }}</p>
        <p>Sana: {{ popupData.delivery_date }}</p>
        <p>Aloqa bo'lim: {{ popupData.post_name }}</p>
        <p>Oluvchi manzili: {{ popupData.street_name }}</p>
      </div>
    </div>

    <!-- Pagination controls -->
    <div class="pagination">
      <button @click="goToPage(currentPage - 1)" :disabled="!previous" class="pag-button">
        Orqaga
      </button>
      <span class="page-info">{{ currentPage }} ... {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="!next" class="pag-button">
        Oldinga
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DashboardPage",
  data() {
    return {
      barcode: "",
      fish: "",
      region: "",
      district: "",
      post_name: "",
      date: "",
      images: [],
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      showPopup: false,
      popupData: {},
      itemsPerPage: 200, // Qo'shilgan o'zgaruvchi
      districts: [], // Tumonlar uchun o'zgaruvchi
      is_person: "", // Yangi filter uchun o'zgaruvchi
    };
  },
  beforeRouteEnter(to, from, next) {
    const token = localStorage.getItem("token");
    if (token) {
      next();
    } else {
      next({ name: "Login" });
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push({ name: "Login" });
    },
    updateDistricts() {
      if (this.region === "Buxoro") {
        this.districts = [
          "Jondor",
          "Buxoro Tuman",
          "Peshku",
          "Qorovulbozor",
          "Buxoro Shahar",
          "G'ijduvon",
          "Shofirkon",
          "Kogon",
          "Olot",
          "Romitan",
          "Vobkent",
          "Qorako'l",
        ];
      } else if (this.region === "Toshkent shahar") {
        this.districts = [
          "Bektemir",
          "Chilanzar",
          "Mirabad",
          "Mirzo Ulugbek",
          "Olmazor",
          "Shayhontohur",
          "Sirgali",
          "Uchtepa",
          "Yashnabad",
          "Yangi Hayot",
          "Yunusabad",
          "Yakkasaray",
        ];
      } else if (this.region === "Samarqand") {
        this.districts = [
          "Samarqand",
          "Nurobod",
          "Kattaqo'rg'on",
          "Payariq",
          "Samarqand shahri",
          "Pastdarg'om",
          "Ishtixon",
          "Oqdaryo",
          "Narpay",
          "Qo'shhrabot",
          "Urgut",
          "Jomboy",
          "Toyloq",
          "Samarqand tumani",
          "Paxtachi",
          "Bulung'ur",
          "Kattaqo'rg'on tumani",
        ];
      } else if (this.region === "Andijon") {
        this.districts = [
          "Izboskan",
          "Oltinko'l",
          "Buloqboshi",
          "Andijon shahri",
          "Jalolquduq",
          "Xo'jaobod",
          "Honobod",
          "Paxtaobod Andijon",
          "Shahrixon",
          "Asaka",
          "Marhamat",
          "Ulug'nor",
          "Baliqchi",
          "Bo'ston",
          "Qo'rg'ontepa",
        ];
      } else if (this.region === "Surxondaryo") {
        this.districts = [
          "Sho'rchi",
          "Boysun",
          "Muzrabot",
          "Oltinsoy",
          "Qumqo'rg'on",
          "Jarqo'rg'on",
          "Angor",
          "Bandixon",
          "Sherobod",
          "Termiz",
          "Sariosiyo",
          "Uzun",
          "Qiziriq",
          "Denov",
        ];
      } else if (this.region === "Namangan") {
        this.districts = [
          "Namangan shahri",
          "Uychi",
          "Pop",
          "Chust",
          "Yangiqo'rg'on",
          "To'raqo'rg'on",
          "Mingbuloq",
          "Chortoq",
          "Kosonsoy",
          "Namangan Tumani",
          "Uchqo'rg'on",
          "Norin",
        ];
      } else if (this.region === "Farg'ona") {
        this.districts = [
          "Dang'ara",
          "Beshariq",
          "Oltiariq",
          "Furqat",
          "Qushtepa",
          "Yozyovon",
          "O'zbekiston tumani",
          "Quvasoy",
          "Quva",
          "Farg'ona shahar",
          "Farg'ona tumani",
          "Toshloq",
          "Rishton",
          "Buvayda",
          "Qo'qon Shahri",
          "Uchko'prik",
          "So'x",
          "Bog'dod",
          "Marg'ilon",
        ];
      } else if (this.region === "Jizzax") {
        this.districts = [
          "Mirzacho'l",
          "Jizzax shahri",
          "Sharof Rashidov",
          "G'allaorol",
          "Zomin",
          "Zafarobod",
          "Forish",
          "Paxtakor",
          "Do'stlik",
          "Yangiobod",
          "Arnasoy",
          "Baxmal",
          "Zarbdor",
        ];
      } else if (this.region === "Sirdaryo") {
        this.districts = [
          "Oqoltin",
          "Guliston",
          "Dehqonobod Sirdaryo",
          "Sirdaryo tuman",
          "Xovos",
          "Boyovut tumani",
          "Sayxunobod",
          "Sardoba",
          "Mirzaobod",
        ];
      } else if (this.region === "Qashqadaryo") {
        this.districts = [
          "Beshkent",
          "Qamashi",
          "G'uzor",
          "Qarshi Shahri",
          "Nishon",
          "Mirishkor",
          "Koson",
          "Yakkabog'",
          "Kitob",
          "Chiroqchi",
          "Kasbi",
          "Muborak",
          "Dehqonobod",
          "Shahrisabz",
        ];
      } else if (this.region === "Toshkent viloyati") {
        this.districts = [
          "Olmaliq shahri",
          "Buka",
          "Oqqo'rg'on",
          "Urta Chirchiq",
          "Bekobod shahri",
          "Chirchiq shahri",
          "Ohangaron",
          "Quyi Chirchiq",
          "Bekobod tumani",
          "Toshkent Tuman",
          "Yangiyul shahri",
          "Qibray",
          "Angren Shahri",
          "Parkent",
          "Piskent",
          "Yangiyul tumani",
          "Yuqori Chirchiq",
          "Bostanlik",
          "Chinaz",
          "Zangiota",
        ];
      } else if (this.region === "Xorazm") {
        this.districts = [
          "Tuproqqal'a",
          "Xonqa",
          "Urganch Shahri",
          "Shovot",
          "Urganch tumani",
          "Yangibozor",
          "Bog'ot",
          "Qo'shko'pir",
          "Gurlan",
          "Yangiariq",
          "Xiva",
          "Hazorasp",
        ];
      } else if (this.region === "Navoiy") {
        this.districts = [
          "Karmana",
          "Konimex",
          "Qiziltepa",
          "Xatirchi",
          "Navoiy Shahri",
          "Uchquduq",
          "Navbahor",
          "Nurota",
          "Zarafshan",
        ];
      } else if (this.region === "Qoraqalpog'iston Respublikasi") {
        this.districts = [
          "Ellikqala",
          "Qo'ng'irot",
          "Nukus Shahar",
          "Nukus tumani",
          "Moynoq",
          "Xo'jayli",
          "Beruniy Tumani",
          "Chimboy tumani",
          "Shumanay",
          "Taxtako'pir",
          "Qorao'zak",
          "Amudaryo Tumani",
          "Kegeyli",
          "To'rtko'l",
          "Qanliko'l",
        ];
      } else {
        this.districts = []; // Mintaqa topilmasa, tumanlarni tozalash
      }
      this.district = ""; // Tumanni tozalash
    },

    async fetchData(params = {}) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://10.100.0.28/api/show_photos/users/",
          {
            headers: {
              Authorization: `Bearer ${token}`,

            },
            params: {
              barcode: params.barcode || this.barcode,

              fish: params.fish || this.fish,

              region: params.region || this.region,

              district: params.district || this.district,

              post_name: params.post_name || this.post_name,
              delivery_date: params.date || this.date, // delivery_date parametri qo‘shildi
              is_person: params.is_person || this.is_person, // Yangi parametr
              page: this.currentPage,
              page_size: this.itemsPerPage, // Bu joyda itemsPerPage qo'shiladi
            },
          }
        );
        this.images = response.data.results.images;
        this.totalPages = Math.ceil(response.data.count / this.itemsPerPage); // itemsPerPage ni ishlatish
        this.next = response.data.next;
        this.previous = response.data.previous;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.logout();
        } else {
          console.error("Error fetching data:", error);
        }
      }
    },
    applyFilter() {
      this.currentPage = 1; // Filter qo'llanganda sahifani birinchiga qaytaramiz
      this.fetchData();
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchData();
      }
    },
    openPopup(item) {
      this.popupData = item;
      this.showPopup = true;
    },
    closePopup() {
      this.showPopup = false;
      this.popupData = {};
    },
    toggleFullScreen() {
      const popupImage = document.querySelector(".popup-image");
      if (popupImage.requestFullscreen) {
        popupImage.requestFullscreen();
      } else if (popupImage.mozRequestFullScreen) {
        // Firefox
        popupImage.mozRequestFullScreen();
      } else if (popupImage.webkitRequestFullscreen) {
        // Chrome, Safari, and Opera
        popupImage.webkitRequestFullscreen();
      } else if (popupImage.msRequestFullscreen) {
        // IE/Edge
        popupImage.msRequestFullscreen();
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
/* Banner and Header */
.banner {
  background-color: #303294;
  color: white;
  padding: 10px, 10px, 10px, 10px;
  text-align: center;
  border-radius: 5px;
  margin-bottom: 20px;
  position: relative;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.banner h2 {
  font-size: 36px;
  /* Yozuvning kattaligi */
  font-weight: bold;
  /* Yozuvning qalinligi */
}

.logout-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
}

.logout-button:hover {
  background-color: darkred;
}

/* Filter Section */
.filters {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;

  position: fixed;
  top: 85px;
  /* Banner balandligini hisobga olish kerak */
  left: 0;
  width: 100%;
  background-color: #303294;
  z-index: 999;
  padding: 10px 20px;
  box-shadow: 0 2px 4px #303294;
}

.filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background-color: #303294;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.filters input,
.filters select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 160px;
}

.filters button {
  padding: 8px 12px;
  background-color: #d37e39;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filters button:hover {
  background-color: #f3a05c;
}

/* Results Section */
.results {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-top: 200px;
  /* Banner va filters bo'shlig'ini hisobga olish */
}

.image-card {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  width: 180px;
  /* Kichikroq o'lcham */
  height: 180px;
  /* Kichikroq o'lcham */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  /* To'liq ko'rinish uchun overflow yashirish */
}

.image-card img {
  width: 100%;
  height: 100%;
  /* Barcha bo'sh joyni to'ldirish */
  object-fit: cover;
  /* Rasmni to'ldirish */
  margin-bottom: 10px;
}

.image-card p {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}

/* Popup Section */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  padding: 15px;
  border-radius: 8px;
  width: 410px;
  /* Kichikroq o'lcham */
  max-width: 90%;
  /* Ekran o'lchamidan kelib chiqqan holda */
  position: relative;
}

.popup-image {
  width: 400px;
  /* Rasmning kengligini 200px ga kamaytirish */
  height: 550px;
  /* Moslashtirilgan balandlik */
  display: block;
  /* Rasmni blok darajasidagi elementga aylantirish */
  margin: 0;
  /* Agar kerak bo'lsa, marginni o'rnatish */
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
}

/* Pagination Section */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pag-button {
  padding: 8px 12px;
  background-color: #303294;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pag-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pag-button:hover:not(:disabled) {
  background-color: #303294;
}

p {
  line-height: 1;
  /* Qatorlar orasini yaqinlashtirish uchun */
  text-align: left;
  /* Chap tomonga tekislash */
}

.image-container {
  text-align: left;
  /* Chap tomonga tekislash */
}

.page-info {
  margin: 0 20px;
  /* Raqamlar va tugmalar o'rtasidagi bo'sh joy */
}
</style>
