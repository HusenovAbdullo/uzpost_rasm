<template>
  <div class="dashboard">
    <!-- Banner -->
    <div class="banner">
      <h2>GIBRID XATLARINI TOPSHIRILISHINI NAZORAT QILISH DASTURI</h2>
      <button @click="logout" class="logout-button">Chiqish</button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-card">
        <select v-model="localRegion" @change="updateDistricts">
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
          <option value="Qoraqalpog'iston Respublikasi">Qoraqalpog'iston Respublikasi</option>
        </select>

        <select v-model="localDistrict">
          <option value="">Tumanlar</option>
          <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
        </select>

        <input v-model="barcode" placeholder="Barcode" />
        <input v-model="localFish" placeholder="F.I.SH" />
        <input v-model="post_name" placeholder="Aloqa bo'lim" />
        <input v-model="date" placeholder="ДД.ММ.РРРР" type="date" />

        <!-- <select v-model="is_person">
          <option value="">Haqiqiyligini tekshirish</option>
          <option value="True">Xato</option>
          <option value="False">To'g'ri</option>
        </select> -->

        <button @click="applyFilter">Filterni qo'llash</button>
        <button @click="goToStatistics" style="background-color: green;">Statistika</button>
      </div>
    </div>

    <!-- Results -->
    <div class="results">
      <div
        v-for="item in images"
        :key="item.id"
        class="image-card"
        @click="openPopup(item)"
        title="To‘liq ma’lumotni ko‘rish"
      >
        <img
          :src="normalizePhoto(item.photo)"
          loading="lazy"
          alt="Image"
          @error="onImgError($event)"
        />
      </div>
    </div>

    <!-- Popup -->
    <div v-if="showPopup" class="popup" @click.self="closePopup">
      <div class="popup-content">
        <span class="close" @click="closePopup">&times;</span>

        <img
          :src="normalizePhoto(popupImage)"
          alt="Popup Image"
          class="popup-image"
          @error="onImgError($event)"
        />

        <div v-if="popupLoading" style="margin-top:8px;">Yuklanmoqda...</div>

        <template v-else>
          <p v-if="popupData.barcode">Barcode: {{ popupData.barcode }}</p>
          <p v-if="popupData.fish">F.I.SH: {{ popupData.fish }}</p>
          <p v-if="popupData.region_name">Viloyat: {{ popupData.region_name }}</p>
          <p v-if="popupData.district_name">Tuman: {{ popupData.district_name }}</p>
          <p v-if="popupData.delivery_date">Sana: {{ formatDate(popupData.delivery_date) }}</p>
          <p v-if="popupData.post_name">Aloqa bo'lim: {{ popupData.post_name }}</p>
          <p v-if="popupData.street_name">Oluvchi manzili: {{ popupData.street_name }}</p>
          <a
            v-if="popupData.lon && popupData.lat"
            :href="`https://yandex.uz/maps/?pt=${popupData.lon},${popupData.lat}&z=15`"
            target="_blank"
          >
            Yetkazilgan manzilni ko'rish
          </a>
        </template>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="goToPage(currentPage - 1)" :disabled="!hasPrev" class="pag-button">
        Orqaga
      </button>
      <span class="page-info" style="color: #fff;">{{ currentPage }} ... {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="!hasNext" class="pag-button">
        Oldinga
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import "lazysizes";

export default {
  name: "DashboardPage",
  props: ["fish", "region", "district"],
  data() {
    return {
      barcode: "",
      localFish: this.fish || "",
      localRegion: this.region || this.$route.params.region || "",
      localDistrict: this.district || this.$route.params.district || "",
      post_name: "",
      date: "",
      images: [],
      currentPage: 1, // UI: 1-based
      totalPages: 1,
      showPopup: false,
      popupData: {},
      popupImage: "",       // modal ochilganda darhol rasm ko‘rsatish uchun (grid dagisi)
      popupLoading: false,  // to‘liq ma’lumot yuklanishi holati
      itemsPerPage: 56,
      districts: [],
      is_person: "",
      isAdmin: true,
      imgFallback:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
    };
  },

  computed: {
    hasPrev() {
      return this.currentPage > 1;
    },
    hasNext() {
      return this.currentPage < this.totalPages;
    },
  },

  watch: {
    "$route.params.region"(newRegion) {
      this.localRegion = newRegion || "";
      this.updateDistricts();
      this.applyFilter();
    },
    "$route.params.district"(newDistrict) {
      this.localDistrict = newDistrict || "";
      this.applyFilter();
    },
    "$route.params.fish"(newFish) {
      this.localFish = newFish ? decodeURIComponent(newFish) : "";
      this.applyFilter();
    },
  },

  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push({ name: "Login" });
    },
    goToStatistics() {
      this.$router.push("/statistika");
    },

    normalizePhoto(photo) {
      if (!photo) return this.imgFallback;
      const p = String(photo).trim();
      if (/^https?:\/\//i.test(p)) return p;                         // http/https
      if (p.startsWith("//")) return "https:" + p;                   // //host/path
      if (p.startsWith("trackapi.pochta.uz")) return "https://" + p; // host (schema yo‘q)
      if (p.startsWith("/")) return "https://trackapi.pochta.uz" + p; // /media/...
      return "https://trackapi.pochta.uz/" + p.replace(/^\/+/, "");
    },

    onImgError(e) {
      e.target.src = this.imgFallback;
    },

    formatDate(iso) {
      // YYYY-MM-DDTHH:mm:ss → DD.MM.YYYY
      try {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
      } catch {
        return iso;
      }
    },

    updateDistricts() {
      if (this.localRegion === "Buxoro") {
        this.districts = ["Jondor","Buxoro Tuman","Peshku","Qorovulbozor","Buxoro Shahar","G'ijduvon","Shofirkon","Kogon","Olot","Romitan","Vobkent","Qorako'l"];
      } else if (this.localRegion === "Toshkent shahar") {
        this.districts = ["Bektemir","Chilanzar","Mirabad","Mirzo Ulugbek","Olmazor","Shayhontohur","Sirgali","Uchtepa","Yashnabad","Yangi Hayot","Yunusabad","Yakkasaray"];
      } else if (this.localRegion === "Samarqand") {
        this.districts = ["Samarqand","Nurobod","Kattaqo'rg'on","Payariq","Samarqand shahri","Pastdarg'om","Ishtixon","Oqdaryo","Narpay","Qo'shhrabot","Urgut","Jomboy","Toyloq","Samarqand tumani","Paxtachi","Bulung'ur","Kattaqo'rg'on tumani"];
      } else if (this.localRegion === "Andijon") {
        this.districts = ["Izboskan","Oltinko'l","Buloqboshi","Andijon shahri","Jalolquduq","Xo'jaobod","Honobod","Paxtaobod Andijon","Shahrixon","Asaka","Marhamat","Ulug'nor","Baliqchi","Bo'ston","Qo'rg'ontepa"];
      } else if (this.localRegion === "Surxondaryo") {
        this.districts = ["Sho'rchi","Boysun","Muzrabot","Oltinsoy","Qumqo'rg'on","Jarqo'rg'on","Angor","Bandixon","Sherobod","Termiz","Sariosiyo","Uzun","Qiziriq","Denov"];
      } else if (this.localRegion === "Namangan") {
        this.districts = ["Namangan shahri","Uychi","Pop","Chust","Yangiqo'rg'on","To'raqo'rg'on","Mingbuloq","Chortoq","Kosonsoy","Namangan Tumani","Uchqo'rg'on","Norin"];
      } else if (this.localRegion === "Farg'ona") {
        this.districts = ["Dang'ara","Beshariq","Oltiariq","Furqat","Qushtepa","Yozyovon","O'zbekiston tumani","Quvasoy","Quva","Farg'ona shahar","Farg'ona tumani","Toshloq","Rishton","Buvayda","Qo'qon Shahri","Uchko'prik","So'x","Bog'dod","Marg'ilon"];
      } else if (this.localRegion === "Jizzax") {
        this.districts = ["Mirzacho'l","Jizzax shahri","Sharof Rashidov","G'allaorol","Zomin","Zafarobod","Forish","Paxtakor","Do'stlik","Yangiobod","Arnasoy","Baxmal","Zarbdor"];
      } else if (this.localRegion === "Sirdaryo") {
        this.districts = ["Oqoltin","Guliston","Dehqonobod Sirdaryo","Sirdaryo tuman","Xovos","Boyovut tumani","Sayxunobod","Sardoba","Mirzaobod"];
      } else if (this.localRegion === "Qashqadaryo") {
        this.districts = ["Beshkent","Qamashi","G'uzor","Qarshi Shahri","Nishon","Mirishkor","Koson","Yakkabog'","Kitob","Chiroqchi","Kasbi","Muborak","Dehqonobod","Shahrisabz"];
      } else if (this.localRegion === "Toshkent viloyati") {
        this.districts = ["Olmaliq shahri","Buka","Oqqo'rg'on","Urta Chirchiq","Bekobod shahri","Chirchiq shahri","Ohangaron","Quyi Chirchiq","Bekobod tumani","Toshkent Tuman","Yangiyul shahri","Qibray","Angren Shahri","Parkent","Piskent","Yangiyul tumani","Yuqori Chirchiq","Bostanlik","Chinaz","Zangiota"];
      } else if (this.localRegion === "Xorazm") {
        this.districts = ["Tuproqqal'a","Xonqa","Urganch Shahri","Shovot","Urganch tumani","Yangibozor","Bog'ot","Qo'shko'pir","Gurlan","Yangiariq","Xiva","Hazorasp"];
      } else if (this.localRegion === "Navoiy") {
        this.districts = ["Karmana","Konimex","Qiziltepa","Xatirchi","Navoiy Shahri","Uchquduq","Navbahor","Nurota","Zarafshan"];
      } else if (this.localRegion === "Qoraqalpog'iston Respublikasi") {
        this.districts = ["Ellikqala","Qo'ng'irot","Nukus Shahar","Nukus tumani","Moynoq","Xo'jayli","Beruniy Tumani","Chimboy tumani","Shumanay","Taxtako'pir","Qorao'zak","Amudaryo Tumani","Kegeyli","To'rtko'l","Qanliko'l"];
      } else {
        this.districts = [];
      }
      this.localDistrict = "";
      if (this.$route.params.district && this.districts.includes(this.$route.params.district)) {
        this.localDistrict = this.$route.params.district;
      }
    },

    async fetchData() {
      try {
        const token = localStorage.getItem("token");
        const pageZero = Math.max(0, this.currentPage - 1); // server 0-based

        const { data } = await axios.get(
          "https://trackapi.pochta.uz/api/show_photos/users/",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              barcode: this.barcode,
              fish: this.localFish,
              region: this.localRegion,
              district: this.localDistrict,
              post_name: this.post_name,
              delivery_date: this.date,
              is_person: this.is_person,
              page: pageZero,
              page_size: this.itemsPerPage,
            },
          }
        );

        // Yangi JSON: { count, admin, current_page, total_pages, images: [ {id, photo}, ... ] }
        this.images = Array.isArray(data.images) ? data.images : [];

        const totalPagesFromApi = Number(data.total_pages);
        const countFromApi = Number(data.count);
        this.totalPages =
          Number.isFinite(totalPagesFromApi) && totalPagesFromApi > 0
            ? totalPagesFromApi
            : Math.max(
                1,
                Math.ceil(
                  (Number.isFinite(countFromApi) ? countFromApi : 0) /
                    this.itemsPerPage
                )
              );

        if (Number.isFinite(Number(data.current_page))) {
          this.currentPage = Math.min(
            Math.max(1, Number(data.current_page) + 1),
            this.totalPages
          );
        } else {
          this.currentPage = Math.min(
            Math.max(1, this.currentPage),
            this.totalPages
          );
        }

        this.isAdmin = !!data.admin;
      } catch (error) {
        if (error?.response?.status === 401) {
          this.logout();
        } else {
          console.error("Error fetching data:", error);
        }
      }
    },

    applyFilter() {
      this.currentPage = 1;
      this.fetchData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchData();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },

    async openPopup(item) {
      // Avval popupni ochamiz va kartadagi rasmni ko‘rsatib turamiz
      this.popupImage = item?.photo || "";
      this.popupData = {};
      this.popupLoading = true;
      this.showPopup = true;

      try {
        const token = localStorage.getItem("token");
        // ID bo‘yicha to‘liq ma’lumot
        const url = `https://trackapi.pochta.uz/api/show_photos/users/${item.id}`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Kutilgan JSON:
        // {
        //   "photo_id": 177328,
        //   "barcode": "ALQ7246315",
        //   "fish": "Zulfizar Xamirbekova",
        //   "region_id": 14, "region_name": "...",
        //   "district_id": 156, "district_name": "...",
        //   "street_name": "...",
        //   "delivery_date": "2025-11-06T23:59:00",
        //   "post_name": "...",
        //   "lat": "40.86...", "lon": "69.60...",
        //   "photo": "/media/ALQ7246315.jpg"
        // }
        this.popupData = data || {};
        // Agar detaldan kelgan rasm bo‘lsa, uni ko‘rsatamiz
        if (data?.photo) this.popupImage = data.photo;
      } catch (error) {
        if (error?.response?.status === 401) {
          this.logout();
        } else {
          console.error("Error fetching detail:", error);
        }
      } finally {
        this.popupLoading = false;
      }
    },

    closePopup() {
      this.showPopup = false;
      this.popupData = {};
      this.popupImage = "";
      this.popupLoading = false;
    },
  },

  mounted() {
    this.localRegion = this.$route.params.region || this.region || "";
    this.updateDistricts();
    if (this.$route.params.district) this.localDistrict = this.$route.params.district;
    if (this.$route.params.fish) this.localFish = decodeURIComponent(this.$route.params.fish);
    this.fetchData();
  },
};
</script>

<style scoped>
/* Banner and Header */
.banner {
  background-color: #303294;
  color: #fff;
  padding: 12px 10px;
  text-align: center;
  border-radius: 5px;
  z-index: 1000;
  position: sticky;   /* oldingi fixed o‘rniga */
  top: 0;
}
.banner h2 { font-size: 36px; font-weight: bold; }
.logout-button {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  background-color: red; color: white; border: none; cursor: pointer;
  font-size: 16px; padding: 10px 20px; border-radius: 5px;
}
.logout-button:hover { background-color: darkred; }

/* Filters */
.filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  background-color: #303294;
  z-index: 999;
  padding: 10px 20px;
  box-shadow: 0 2px 4px #303294;

  position: sticky;   /* oldingi fixed va top:85px o‘rniga */
  top: 0;             /* banner ham sticky bo‘lgani uchun ustiga chiqmaydi */
  margin-bottom: 20px;
}
.filter-card {
  display: flex; flex-wrap: wrap; gap: 15px;
  background-color: #303294; padding: 10px; border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.filters input, .filters select {
  padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 160px;
}
.filters button {
  padding: 8px 12px; background-color: #d37e39; color: white;
  border: none; border-radius: 4px; cursor: pointer;
}
.filters button:hover { background-color: #f3a05c; }

/* Results */
.results {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;
  margin-top: 16px;   /* oldingi 200px ni olib tashlang */
}
.image-card {
  border: 1px solid #ccc; border-radius: 5px; padding: 10px;
  width: 180px; height: 180px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  text-align: center; cursor: pointer; overflow: hidden;
}
.image-card img {
  width: 100%; height: 100%; object-fit: cover; margin-bottom: 10px;
}
.image-card p { margin: 5px 0; font-size: 14px; color: #333; }

/* Popup */
.popup {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.popup-content {
  background: white; padding: 15px; border-radius: 8px;
  width: 410px; max-width: 90%; position: relative;
}
.popup-image { width: 400px; height: 550px; display: block; margin: 0; object-fit: contain; }
.close { position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer; }

.pagination {
  display: flex; justify-content: center; align-items: center; margin-top: 20px;
}
.pag-button {
  padding: 8px 12px; background-color: #d37e39; color: white; border: none; border-radius: 4px; cursor: pointer;
}
.pag-button:disabled { background-color: #ccc; cursor: not-allowed; }
.pag-button:hover:not(:disabled) { background-color: #303294; }

p { line-height: 1; text-align: left; }
.image-container { text-align: left; }
.page-info { margin: 0 20px; }

.lazyload { opacity: 0; transition: opacity 0.3s ease-in-out; }
.lazyloaded { opacity: 1; }
</style>
