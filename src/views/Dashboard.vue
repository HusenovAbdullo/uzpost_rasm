<template>
  <div class="dashboard v2">
    <!-- AppBar -->
    <header class="appbar">
      <div class="appbar__inner">
        <div class="appbar__left">
          <h1
            class="appbar__title"
            :title="$t('app.title')"
          >
            {{ $t('app.title') }}
          </h1>
          <span v-if="isAdmin" class="badge badge--admin">
            {{ $t('app.admin') }}
          </span>
        </div>
        <div class="appbar__right">
          <!-- Til switcher -->
          <div class="lang-switch">
            <button
              v-for="lng in locales"
              :key="lng"
              type="button"
              class="lang-btn"
              :class="{ 'lang-btn--active': currentLocale === lng }"
              @click="changeLocale(lng)"
            >
              {{ lng.toUpperCase() }}
            </button>
          </div>

          <button class="btn btn--ghost" @click="goToStatistics">
            {{ $t('buttons.statistics') }}
          </button>
          <button class="btn btn--danger" @click="logout">
            {{ $t('buttons.logout') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Body: Sidebar + Content -->
    <div class="dashboard__body">
      <!-- Sidebar Filters -->
      <aside class="sidebar">
        <div class="sidebar__section">
          <div class="sidebar__header">
            <h2>{{ $t('filters.title') }}</h2>
            <button class="link-button" type="button" @click="resetFilters">
              {{ $t('buttons.clear') }}
            </button>
          </div>

          <div class="form-group">
            <label>{{ $t('filters.region') }}</label>
            <select v-model="localRegion" @change="updateDistricts">
              <option value="">{{ $t('filters.allRegions') }}</option>
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
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('filters.district') }}</label>
            <select v-model="localDistrict">
              <option value="">{{ $t('filters.allDistricts') }}</option>
              <option v-for="d in districts" :key="d" :value="d">
                {{ d }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('filters.barcode') }}</label>
            <input
              v-model="barcode"
              :placeholder="$t('filters.barcodePlaceholder')"
              @keyup.enter="applyFilter"
            />
          </div>

          <div class="form-group">
            <label>{{ $t('filters.fish') }}</label>
            <input
              v-model="localFish"
              :placeholder="$t('filters.fishPlaceholder')"
              @keyup.enter="applyFilter"
            />
          </div>

          <div class="form-group">
            <label>{{ $t('filters.post') }}</label>
            <input
              v-model="post_name"
              :placeholder="$t('filters.postPlaceholder')"
              @keyup.enter="applyFilter"
            />
          </div>

          <div class="form-group">
            <label>{{ $t('filters.date') }}</label>
            <input v-model="date" type="date" />
          </div>

          <!-- is_person filtri -->
          <div class="form-group">
            <label>{{ $t('filters.person') }}</label>
            <select v-model="is_person">
              <option value="">{{ $t('filters.personAll') }}</option>
              <option value="true">{{ $t('filters.personTrue') }}</option>
              <option value="false">{{ $t('filters.personFalse') }}</option>
            </select>
          </div>

          <div class="sidebar__actions">
            <button class="btn btn--primary" type="button" @click="applyFilter">
              {{ $t('buttons.applyFilters') }}
            </button>
          </div>
        </div>

        <div class="sidebar__section sidebar__section--stats">
          <h3>{{ $t('sidebar.summaryTitle') }}</h3>
          <p>
            {{ $t('sidebar.totalRecords') }}
            <strong>{{ totalCount || (loading ? "..." : images.length) }}</strong>
          </p>
          <p>
            {{ $t('sidebar.page') }}
            <strong>{{ currentPage }} / {{ totalPages }}</strong>
          </p>
        </div>

        <div class="sidebar__footer">
          <small>
            {{ $t('app.developer') }}:
            <a
              href="https://t.me/Husenov_Abdullo"
              target="_blank"
              rel="noopener"
              class="devlink"
              title="Telegramda ochish"
            >
              Husenov Abdullo
            </a>
          </small>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="content" ref="content">
        <!-- Toolbar -->
        <div class="content__toolbar">
          <div class="content__toolbar-left">
            <span class="toolbar__title">{{ $t('toolbar.results') }}</span>
            <span class="toolbar__meta">
              {{ $t('toolbar.pageShort') }} {{ currentPage }} / {{ totalPages }}
              <span v-if="totalCount">
                · {{ totalCount }} {{ $t('toolbar.recordsShort') }}
              </span>
            </span>
          </div>
          <div class="content__toolbar-right">
            <button
              class="btn btn--ghost"
              type="button"
              :disabled="loading"
              @click="fetchData"
            >
              {{ $t('buttons.refresh') }}
            </button>
            <div class="pagination pagination--top">
              <button
                class="pag-button"
                type="button"
                @click="goToPage(1)"
                :disabled="!hasPrev || loading"
              >
                «
              </button>
              <button
                class="pag-button"
                type="button"
                @click="goToPage(currentPage - 1)"
                :disabled="!hasPrev || loading"
              >
                {{ $t('buttons.prev') }}
              </button>
              <span class="page-info">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                class="pag-button"
                type="button"
                @click="goToPage(currentPage + 1)"
                :disabled="!hasNext || loading"
              >
                {{ $t('buttons.next') }}
              </button>
              <button
                class="pag-button"
                type="button"
                @click="goToPage(totalPages)"
                :disabled="!hasNext || loading"
              >
                »
              </button>
            </div>
          </div>
        </div>

        <!-- Loading / Empty / Grid -->
        <div v-if="loading" class="content__state content__state--loading">
          <div class="spinner"></div>
          <p>{{ $t('states.loading') }}</p>
        </div>

        <div
          v-else-if="!loading && images.length === 0"
          class="content__state content__state--empty"
        >
          <p>{{ $t('states.noResults') }}</p>
          <button
            class="btn btn--ghost"
            type="button"
            @click="resetFilters"
          >
            {{ $t('buttons.clearFilters') }}
          </button>
        </div>

        <div v-else class="grid">
          <article
            v-for="item in images"
            :key="item.id"
            class="card"
            @click="openPopup(item)"
            :title="item.barcode || $t('card.moreTooltip')"
          >
            <div class="card__thumb">
              <img
                class="card__image"
                :src="normalizePhoto(item.photo)"
                loading="lazy"
                :alt="$t('card.imageAlt')"
                @error="onImgError($event)"
              />
              <div class="card__badge" v-if="item.delivery_date">
                {{ formatDate(item.delivery_date) }}
              </div>
            </div>
            <div class="card__body">
              <p class="card__barcode">
                {{ item.barcode ? item.barcode : $t('card.noBarcode') }}
              </p>
              <p class="card__fish" v-if="item.fish">
                {{ item.fish }}
              </p>
              <p
                class="card__location"
                v-if="item.region_name || item.district_name"
              >
                <span v-if="item.region_name">{{ item.region_name }}</span>
                <span v-if="item.region_name && item.district_name"> / </span>
                <span v-if="item.district_name">
                  {{ item.district_name }}
                </span>
              </p>
              <p class="card__post" v-if="item.post_name">
                {{ item.post_name }}
              </p>
            </div>
          </article>
        </div>

        <!-- Bottom Pagination -->
        <div class="pagination pagination--bottom">
          <button
            class="pag-button"
            type="button"
            @click="goToPage(currentPage - 1)"
            :disabled="!hasPrev || loading"
          >
            {{ $t('buttons.prev') }}
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button
            class="pag-button"
            type="button"
            @click="goToPage(currentPage + 1)"
            :disabled="!hasNext || loading"
          >
            {{ $t('buttons.next') }}
          </button>
        </div>
      </main>
    </div>

    <!-- Modal Popup -->
    <transition name="drawer">
      <div v-if="showPopup" class="drawer" @click.self="closePopup">
        <div class="drawer__panel">
          <button class="drawer__close" type="button" @click="closePopup">
            &times;
          </button>

          <div class="drawer__content">
            <div class="drawer__image-wrap">
              <img
                :src="normalizePhoto(popupImage)"
                :alt="$t('card.imageAlt')"
                class="drawer__image"
                @error="onImgError($event)"
                @click.stop="openImageFullscreen"
              />
            </div>

            <div class="drawer__info">
              <h2>{{ $t('modal.title') }}</h2>

              <div v-if="popupLoading" class="drawer__loading">
                <div class="spinner spinner--small"></div>
                <p>{{ $t('modal.loading') }}</p>
              </div>

              <template v-else>
                <!-- Yuqori qism: Barcode chip + ism -->
                <div class="info-header">
                  <div
                    v-if="popupData.barcode"
                    class="chip chip--barcode"
                  >
                    <span>{{ popupData.barcode }}</span>
                    <button
                      class="iconbtn"
                      type="button"
                      :title="$t('buttons.copy')"
                      @click.stop="copyToClipboard(popupData.barcode)"
                      :aria-label="$t('buttons.copy')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect
                          x="9"
                          y="9"
                          width="11"
                          height="11"
                          rx="3"
                          stroke="currentColor"
                          stroke-width="1.5"
                        />
                        <rect
                          x="4"
                          y="4"
                          width="11"
                          height="11"
                          rx="3"
                          stroke="currentColor"
                          stroke-width="1.5"
                          opacity=".6"
                        />
                      </svg>
                    </button>
                  </div>

                  <div
                    v-if="popupData.fish"
                    class="chip chip--name"
                    :title="popupData.fish"
                  >
                    <span class="chip__text">{{ popupData.fish }}</span>
                    <button
                      class="iconbtn iconbtn--inline"
                      type="button"
                      :aria-label="$t('buttons.copy')"
                      :title="$t('buttons.copy')"
                      @click.stop="copyToClipboard(popupData.fish)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect
                          x="9"
                          y="9"
                          width="11"
                          height="11"
                          rx="3"
                          stroke="currentColor"
                          stroke-width="1.5"
                        />
                        <rect
                          x="4"
                          y="4"
                          width="11"
                          height="11"
                          rx="3"
                          stroke="currentColor"
                          stroke-width="1.5"
                          opacity=".6"
                        />
                      </svg>
                    </button>
                  </div>

                  <div class="subline">
                    <span
                      v-if="popupData.region_name"
                      class="pill"
                    >
                      {{ popupData.region_name }}
                    </span>
                    <span
                      v-if="popupData.district_name"
                      class="pill"
                    >
                      {{ popupData.district_name }}
                    </span>
                    <span
                      v-if="popupData.delivery_date"
                      class="pill"
                    >
                      {{ formatDate(popupData.delivery_date) }}
                    </span>
                  </div>
                </div>

                <!-- Pastki qism: kalit-qiymat kartalari -->
                <div class="kv-grid">
                  <!-- Aloqa bo‘lim -->
                  <div v-if="popupData.post_name" class="kv kv--span2">
                    <span class="kv__label">{{ $t('modal.postLabel') }}</span>
                    <span class="kv__value">
                      <span class="kv__text">{{ popupData.post_name }}</span>
                      <button
                        class="iconbtn iconbtn--inline"
                        type="button"
                        :title="$t('buttons.copy')"
                        @click.stop="copyToClipboard(popupData.post_name)"
                        :aria-label="$t('buttons.copy')"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect
                            x="9"
                            y="9"
                            width="11"
                            height="11"
                            rx="3"
                            stroke="currentColor"
                            stroke-width="1.5"
                          />
                          <rect
                            x="4"
                            y="4"
                            width="11"
                            height="11"
                            rx="3"
                            stroke="currentColor"
                            stroke-width="1.5"
                            opacity=".6"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>

                  <!-- Oluvchi manzili -->
                  <div v-if="popupData.street_name" class="kv kv--span2">
                    <span class="kv__label">{{ $t('modal.addressLabel') }}</span>
                    <span class="kv__value">
                      <span class="kv__text">{{ popupData.street_name }}</span>
                      <button
                        class="iconbtn iconbtn--inline"
                        type="button"
                        :title="$t('buttons.copy')"
                        @click.stop="copyToClipboard(popupData.street_name)"
                        :aria-label="$t('buttons.copy')"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect
                            x="9"
                            y="9"
                            width="11"
                            height="11"
                            rx="3"
                            stroke="currentColor"
                            stroke-width="1.5"
                          />
                          <rect
                            x="4"
                            y="4"
                            width="11"
                            height="11"
                            rx="3"
                            stroke="currentColor"
                            stroke-width="1.5"
                            opacity=".6"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>

                <!-- Xarita kartasi -->
                <div v-if="popupData.lon && popupData.lat" class="map-wrap">
                  <a
                    class="map-card"
                    :href="`https://yandex.uz/maps/?pt=${popupData.lon},${popupData.lat}&z=${mapZoom}`"
                    target="_blank"
                    rel="noopener"
                  >
                    <div class="map-card__inner">
                      <img
                        class="map-card__image"
                        :src="staticMapUrl(popupData.lon, popupData.lat, mapZoom)"
                        :alt="$t('map.deliveredAddressAlt')"
                      />
                      <span class="map-card__pin"></span>
                    </div>
                    <div class="map-meta">
                      <span class="map-meta__badge">
                        {{ $t('map.viewOnMap') }}
                      </span>
                      <span
                        class="map-meta__coord"
                        v-if="popupData.lon && popupData.lat"
                      >
                        {{ Number(popupData.lat).toFixed(6) }},
                        {{ Number(popupData.lon).toFixed(6) }}
                      </span>
                    </div>
                  </a>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Fullscreen image preview -->
    <transition name="fade">
      <div
        v-if="showImageFullscreen"
        class="fullscreen"
        @click.self="closeImageFullscreen"
      >
        <button
          class="fullscreen__close"
          type="button"
          @click="closeImageFullscreen"
        >
          &times;
        </button>

        <img
          :src="normalizePhoto(fullscreenImage || popupImage)"
          :alt="$t('card.imageAlt')"
          class="fullscreen__image"
          @error="onImgError($event)"
        />
      </div>
    </transition>
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
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      loading: false,

      showPopup: false,
      popupData: {},
      popupImage: "",
      popupLoading: false,

      showImageFullscreen: false,
      fullscreenImage: "",

      itemsPerPage: 56,
      districts: [],
      is_person: "",      // "" | "true" | "false"
      isAdmin: true,

      mapZoom: 10,

      imgFallback:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",

      locales: ["uz", "ru", "en"]
    };
  },

  computed: {
    hasPrev() {
      return this.currentPage > 1;
    },
    hasNext() {
      return this.currentPage < this.totalPages;
    },
    currentLocale() {
      return this.$i18n?.locale || "uz";
    }
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
    // MUHIM: Statistika sahifasidan keladigan ?is_person= query ni kuzatamiz
    "$route.query.is_person"(newVal) {
      if (newVal === "true" || newVal === "false") {
        this.is_person = newVal;
      } else {
        this.is_person = "";
      }
      this.applyFilter();
    }
  },

  methods: {
    changeLocale(locale) {
      if (!this.locales.includes(locale)) return;
      if (this.$i18n) this.$i18n.locale = locale;
      try {
        localStorage.setItem("locale", locale);
      } catch (e) {
        // localStorage bo'lmasa jim
      }
    },

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
      if (/^https?:\/\//i.test(p)) return p;
      if (p.startsWith("//")) return "https:" + p;
      if (p.startsWith("trackapi.pochta.uz")) return "https://" + p;
      if (p.startsWith("/")) return "https://trackapi.pochta.uz" + p;
      return "https://trackapi.pochta.uz/" + p.replace(/^\/+/, "");
    },

    onImgError(e) {
      e.target.src = this.imgFallback;
    },

    formatDate(iso) {
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

    staticMapUrl(lon, lat, zoom) {
      const lonEnc = encodeURIComponent(lon);
      const latEnc = encodeURIComponent(lat);
      const z = Number.isFinite(zoom) ? zoom : this.mapZoom;
      return `https://static-maps.yandex.ru/1.x/?ll=${lonEnc},${latEnc}&z=${z}&size=650,350&l=map&pt=${lonEnc},${latEnc},pm2rdm`;
    },

    updateDistricts() {
      if (this.localRegion === "Buxoro") {
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
          "Qorako'l"
        ];
      } else if (this.localRegion === "Toshkent shahar") {
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
          "Yakkasaray"
        ];
      } else if (this.localRegion === "Samarqand") {
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
          "Kattaqo'rg'on tumani"
        ];
      } else if (this.localRegion === "Andijon") {
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
          "Qo'rg'ontepa"
        ];
      } else if (this.localRegion === "Surxondaryo") {
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
          "Denov"
        ];
      } else if (this.localRegion === "Namangan") {
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
          "Norin"
        ];
      } else if (this.localRegion === "Farg'ona") {
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
          "Marg'ilon"
        ];
      } else if (this.localRegion === "Jizzax") {
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
          "Zarbdor"
        ];
      } else if (this.localRegion === "Sirdaryo") {
        this.districts = [
          "Oqoltin",
          "Guliston",
          "Dehqonobod Sirdaryo",
          "Sirdaryo tuman",
          "Xovos",
          "Boyovut tumani",
          "Sayxunobod",
          "Sardoba",
          "Mirzaobod"
        ];
      } else if (this.localRegion === "Qashqadaryo") {
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
          "Shahrisabz"
        ];
      } else if (this.localRegion === "Toshkent viloyati") {
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
          "Zangiota"
        ];
      } else if (this.localRegion === "Xorazm") {
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
          "Hazorasp"
        ];
      } else if (this.localRegion === "Navoiy") {
        this.districts = [
          "Karmana",
          "Konimex",
          "Qiziltepa",
          "Xatirchi",
          "Navoiy Shahri",
          "Uchquduq",
          "Navbahor",
          "Nurota",
          "Zarafshan"
        ];
      } else if (this.localRegion === "Qoraqalpog'iston Respublikasi") {
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
          "Qanliko'l"
        ];
      } else {
        this.districts = [];
      }

      this.localDistrict = "";
      if (
        this.$route.params.district &&
        this.districts.includes(this.$route.params.district)
      ) {
        this.localDistrict = this.$route.params.district;
      }
    },

    async fetchData() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        const pageZero = Math.max(0, this.currentPage - 1);

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
              is_person: this.is_person, // MUHIM: query’dan kelgan qiymat
              page: pageZero,
              page_size: this.itemsPerPage
            }
          }
        );

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

        this.totalCount = Number.isFinite(countFromApi)
          ? countFromApi
          : this.images.length;

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
      } finally {
        this.loading = false;
      }
    },

    applyFilter() {
      this.currentPage = 1;
      this.fetchData();
      this.scrollContentTop();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    resetFilters() {
      this.barcode = "";
      this.localFish = "";
      this.localRegion = "";
      this.localDistrict = "";
      this.post_name = "";
      this.date = "";
      this.is_person = "";
      this.updateDistricts();
      this.applyFilter();
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchData();
        this.scrollContentTop();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },

    scrollContentTop() {
      this.$refs.content?.scrollTo({ top: 0, behavior: "smooth" });
    },

    async openPopup(item) {
      this.popupImage = item?.photo || "";
      this.popupData = {};
      this.popupLoading = true;
      this.showPopup = true;

      try {
        const token = localStorage.getItem("token");
        const url = `https://trackapi.pochta.uz/api/show_photos/users/${item.id}`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.popupData = data || {};
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
      this.showImageFullscreen = false;
      this.popupData = {};
      this.popupImage = "";
      this.popupLoading = false;
      this.fullscreenImage = "";
    },

    openImageFullscreen() {
      if (!this.popupImage) return;
      this.fullscreenImage = this.popupImage;
      this.showImageFullscreen = true;
    },

    closeImageFullscreen() {
      this.showImageFullscreen = false;
      this.fullscreenImage = "";
    },

    copyToClipboard(text) {
      if (!text) return;
      navigator.clipboard?.writeText(String(text)).catch(() => {});
    }
  },

  mounted() {
    // URL parametrlaridan region/district/fish
    this.localRegion = this.$route.params.region || this.region || "";
    this.updateDistricts();

    if (this.$route.params.district) {
      this.localDistrict = this.$route.params.district;
    }

    if (this.$route.params.fish) {
      this.localFish = decodeURIComponent(this.$route.params.fish);
    }

    // Statistika sahifasidan keladigan ?is_person=true/false ni o‘qish
    const qp = this.$route.query?.is_person;
    if (qp === "true" || qp === "false") {
      this.is_person = qp;
    } else {
      this.is_person = "";
    }

    this.fetchData();
  }
};
</script>

<style scoped>
/* Scrollbar dizayni */
:global(::-webkit-scrollbar) {
  width: 9px;
  background: transparent;
}

:global(::-webkit-scrollbar-track) {
  background: transparent;
}

:global(::-webkit-scrollbar-thumb) {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 999px;
  border: 2px solid rgba(249, 250, 251, 0.95);
}

:global(::-webkit-scrollbar-thumb:hover) {
  background: rgba(107, 114, 128, 0.9);
}

:global(html) {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.7) transparent;
}

:root {
  --bg: #f3f4f6;
  --bg-elevated: #ffffff;
  --border-subtle: rgba(15, 23, 42, 0.08);
  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --danger: #ef4444;
  --text: #0f172a;
  --text-soft: #6b7280;
}

/* Root */
.dashboard.v2 {
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(180deg, #e5edff 0, #f9fafb 40%, #f3f4f6 100%);
  color: var(--text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-bottom: 0px;
}

/* AppBar */
.appbar {
  position: sticky;
  top: 0;
  z-index: 20;
  margin-bottom: 16px;
}

.appbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.appbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.appbar__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin: 0;
  color: #0f172a;
}

.appbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Til switcher */
.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.lang-btn {
  border: none;
  background: transparent;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4b5563;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease-out;
}

.lang-btn:hover {
  background: rgba(191, 219, 254, 0.7);
  color: #1d4ed8;
}

.lang-btn--active {
  background: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.45);
}

/* Badge */
.badge {
  padding: 3px 10px;
  font-size: 11px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
}

.badge--admin {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
}

/* Buttons */
.btn {
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.16s ease-out;
  white-space: nowrap;
}

/* Filterni qo‘llash – oq pill, ko‘k nur */
.btn--primary {
  background: #ffffff;
  color: #1d4ed8;
  box-shadow:
    0 0 0 1px rgba(37, 99, 235, 0.18),
    0 14px 30px rgba(191, 219, 254, 0.9);
}

.btn--primary:hover {
  background: #eff6ff;
  box-shadow:
    0 0 0 1px rgba(37, 99, 235, 0.28),
    0 18px 34px rgba(191, 219, 254, 1);
}

/* Chiqish – oq pill, qizil nur */
.btn--danger {
  background: #ffffff;
  color: var(--danger);
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.35),
    0 12px 28px rgba(254, 202, 202, 0.9);
}

.btn--danger:hover:not(:disabled) {
  background: #fef2f2;
  color: #b91c1c;
}

.btn--ghost {
  background: #ffffff;
  color: var(--text);
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.btn--ghost:hover:not(:disabled) {
  background: #eef2ff;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Link button */
.link-button {
  border: none;
  background: transparent;
  color: var(--accent-strong);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

/* Layout */
.dashboard__body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 18px;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  background: var(--bg-elevated);
  border-radius: 22px;
  padding: 14px 16px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar__section {
  padding: 10px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.sidebar__section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.sidebar__header h2 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
}

.sidebar__section--stats h3 {
  font-size: 13px;
  margin: 0 0 8px 0;
  color: var(--text-soft);
}

.sidebar__section--stats p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: var(--text-soft);
}

.sidebar__section--stats strong {
  color: #0f172a;
}

.sidebar__actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

/* Form elements */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.form-group label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-soft);
}

.form-group input,
.form-group select {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  background: #f9fafb;
  padding: 6px 12px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: rgba(148, 163, 184, 0.9);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35);
  background: #ffffff;
}

/* Content */
.content {
  background: var(--bg-elevated);
  border-radius: 22px;
  padding: 14px 16px 18px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
  height: 100%;
  padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  scroll-padding-bottom: 80px;
}

/* Toolbar */
.content__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
  margin-bottom: 12px;
}

.content__toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toolbar__title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.toolbar__meta {
  font-size: 12px;
  color: var(--text-soft);
}

.content__toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination--top .pag-button {
  padding: 4px 10px;
  font-size: 11px;
}

.pagination--bottom {
  justify-content: center;
  margin-top: 14px;
  background: var(--bg-elevated);
  padding: 25px 0;
}

.pag-button {
  padding: 6px 12px;
  background: #ffffff;
  color: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.8);
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  min-width: 70px;
  text-align: center;
  transition: all 0.14s ease-out;
}

.pag-button:hover:not(:disabled) {
  background: #eff6ff;
  border-color: var(--accent-strong);
}

.pag-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: var(--text-soft);
}

/* States */
.content__state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-soft);
  text-align: center;
}

/* Spinner */
.spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(148, 163, 184, 0.3);
  border-top-color: var(--accent-strong);
  animation: spin 0.9s linear infinite;
}

.spinner--small {
  width: 22px;
  height: 22px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Grid / Cards */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.card {
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out,
    border-color 0.12s ease-out, background 0.12s ease-out;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.18);
  border-color: var(--accent-strong);
  background: #ffffff;
}

.card__thumb {
  position: relative;
  height: 160px;
  background: #e5e7eb;
}

.card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__badge {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.card__body {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card__barcode {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #111827;
}

.card__fish {
  font-size: 12px;
  color: var(--text-soft);
}

.card__location {
  font-size: 11px;
  color: var(--accent-strong);
}

.card__post {
  font-size: 11px;
  color: var(--text-soft);
}

/* Drawer (modal) */
.drawer {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.drawer__panel {
  width: 100%;
  max-width: 1120px;
  max-height: 92vh;
  background: #ffffff;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.4);
  position: relative;
  padding: 22px 26px 24px;
  margin: 24px;
}

.drawer__close {
  position: absolute;
  top: 10px;
  right: 14px;
  border: none;
  background: rgba(148, 163, 184, 0.25);
  color: #0f172a;
  font-size: 20px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  cursor: pointer;
}

.drawer__content {
  display: grid;
  grid-template-columns: minmax(0, 52%) minmax(0, 48%);
  gap: 20px;
  margin-top: 12px;
}

.drawer__image-wrap {
  background: #f3f4f6;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
}

.drawer__image {
  width: 100%;
  height: 100%;
  max-height: 520px;
  object-fit: contain;
  cursor: zoom-in;
}

.drawer__info {
  padding: 6px 4px;
}

/* Sarlavha va matn kattaroq */
.drawer__info h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 14px 0;
  color: #0f172a;
}

.drawer__loading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  margin-top: 8px;
}

/* Info header */
.info-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.subline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Pills & chips */
.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  color: #1d4ed8;
  background: #eef2ff;
  border: 1px solid rgba(37, 99, 235, 0.25);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #e0e7ff, #ffffff);
  border: 1px solid rgba(148, 163, 184, 0.7);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  width: fit-content;
}

.chip--barcode {
  color: #111827;
}

/* Key–value grid */
.kv-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.kv {
  position: relative;
  min-height: 64px;
  border-radius: 16px;
  background: #f9fafb;
  border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  column-gap: 8px;
}

.kv--span2 {
  grid-column: span 2;
}

.kv__label {
  font-size: 12px;
  color: #6b7280;
  padding-block: 6px;
}

.kv__value {
  font-size: 14px;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.kv__text {
  flex: 1;
  text-align: center;
}

.kv__value .iconbtn {
  margin-left: auto;
}

/* Icon button (copy) */
.iconbtn {
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: #fff;
  border-radius: 10px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #334155;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.iconbtn:hover {
  background: #eef2ff;
  border-color: #1d4ed8;
}

.iconbtn--inline {
  width: 24px;
  height: 24px;
  border-radius: 8px;
}

/* Map wrap + caption */
.map-wrap {
  margin-top: 2px;
}

.map-card {
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
}

.map-card__inner {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.6);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
  background: #e5f3ff;
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
}

.map-card__image {
  display: block;
  width: 100%;
  height: 230px;
  object-fit: cover;
}

.map-card__pin {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  border: 2px solid #fff;
  transform: translate(-50%, -80%);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
}

.map-card:hover .map-card__inner {
  transform: translateY(-2px);
  box-shadow: 0 20px 38px rgba(15, 23, 42, 0.28);
}

.map-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.map-meta__badge {
  font-size: 12px;
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid rgba(37, 99, 235, 0.25);
}

.map-meta__coord {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f3f4f6;
  border: 1px solid rgba(148, 163, 184, 0.5);
}

/* Drawer animatsiya */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.18s ease-out;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .drawer__panel,
.drawer-leave-active .drawer__panel {
  transition: transform 0.22s ease-out;
}

.drawer-enter-from .drawer__panel,
.drawer-leave-to .drawer__panel {
  transform: translateY(40px);
}

/* Fullscreen lightbox */
.fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.fullscreen__image {
  max-width: 95vw;
  max-height: 95vh;
  object-fit: contain;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.75);
  border-radius: 16px;
  background: #0b1120;
}

.fullscreen__close {
  position: absolute;
  top: 18px;
  right: 24px;
  border: none;
  background: rgba(15, 23, 42, 0.6);
  color: #f9fafb;
  font-size: 24px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  cursor: pointer;
}

/* Fade animatsiya */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sidebar footer */
.sidebar__footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed rgba(148, 163, 184, 0.35);
  font-size: 11px;
  color: var(--text-soft);
  opacity: 0.75;
  text-align: center;
}

.devlink {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted rgba(148, 163, 184, 0.6);
}

.devlink:hover {
  color: var(--accent-strong);
  border-bottom-color: var(--accent-strong);
  opacity: 1;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .sidebar {
    order: 2;
  }

  .content {
    order: 1;
  }

  .drawer__content {
    grid-template-columns: minmax(0, 1fr);
  }

  .kv-grid {
    grid-template-columns: 1fr;
  }

  .kv--span2 {
    grid-column: span 1;
  }
}

@media (max-width: 720px) {
  .appbar__inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .appbar__title {
    font-size: 16px;
  }

  .content__toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .content__toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .pagination--top {
    flex: 1;
    justify-content: flex-end;
  }
}
</style>
