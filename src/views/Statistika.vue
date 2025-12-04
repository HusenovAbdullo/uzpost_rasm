<template>
    <div class="dashboard v2">
      <!-- AppBar -->
      <header class="appbar">
        <div class="appbar__inner">
          <div class="appbar__left">
            <h1 class="appbar__title" :title="$t('app.title')">
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
  
            <button class="btn btn--ghost" type="button" @click="goToDashboard">
              {{ $t('buttons.dashboard') }}
            </button>
            <button class="btn btn--danger" type="button" @click="logout">
              {{ $t('buttons.logout') }}
            </button>
          </div>
        </div>
      </header>
  
      <!-- Body -->
      <div class="dashboard__body">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar__section">
            <div class="sidebar__header">
              <h2>{{ $t('stats.modeTitle') }}</h2>
            </div>
  
            <p class="sidebar__text">
              {{ $t('stats.modeSubtitle') }}
            </p>
  
            <!-- Rejim tanlash – faqat sidebar ichida -->
            <div class="stat-toggle stat-toggle--vertical">
              <button
                type="button"
                class="stat-toggle__btn"
                :class="{ 'stat-toggle__btn--active': mode === 'similarity' }"
                @click="switchMode('similarity')"
              >
                {{ $t('stats.similarityButton') }}
              </button>
              <button
                type="button"
                class="stat-toggle__btn"
                :class="{ 'stat-toggle__btn--active': mode === 'fake' }"
                @click="switchMode('fake')"
              >
                {{ $t('stats.fakeButton') }}
              </button>
            </div>
  
            <!-- Legend -->
            <div class="legend">
              <div class="legend__row">
                <span class="legend__dot legend__dot--bad"></span>
                <span class="legend__label">
                  {{ $t('stats.legendBad') }}
                </span>
              </div>
              <div class="legend__row">
                <span class="legend__dot legend__dot--good"></span>
                <span class="legend__label">
                  {{ $t('stats.legendGood') }}
                </span>
              </div>
              <p class="legend__hint">
                {{ $t('stats.legendHint') }}
              </p>
            </div>
          </div>
  
          <div class="sidebar__section sidebar__section--stats">
            <h3>{{ $t('stats.summaryTitle') }}</h3>
            <p>
              {{ $t('stats.summaryMode') }}:
              <strong>{{ metricTitle }}</strong>
            </p>
            <p>
              {{ $t('stats.summaryRegionsCount') }}:
              <strong>{{ sortedRegions.length }}</strong>
            </p>
            <p>
              {{ $t('stats.summaryCurrentRegion') }}:
              <strong>{{ activeRegionName || '—' }}</strong>
            </p>
            <p>
              {{ $t('stats.summaryCurrentDistrict') }}:
              <strong>{{ activeDistrictName || '—' }}</strong>
            </p>
          </div>
  
          <div class="sidebar__footer">
            <small>
              {{ $t('app.developerLabel') }}
              <a
                href="https://t.me/Husenov_Abdullo"
                target="_blank"
                rel="noopener"
                class="devlink"
                title="Telegram"
              >
                Husenov Abdullo
              </a>
            </small>
          </div>
        </aside>
  
        <!-- Main content -->
        <main class="content">
          <!-- Toolbar -->
          <div class="content__toolbar">
            <div class="content__toolbar-left">
              <span class="toolbar__title">
                {{ metricTitle }}
              </span>
  
              <span class="toolbar__meta" v-if="mode === 'similarity'">
                {{ $t('stats.listHeaderSimilarity') }}
              </span>
              <span class="toolbar__meta" v-else>
                {{ $t('stats.listHeaderFake') }}
              </span>
            </div>
  
            <div class="content__toolbar-right">
              <!-- Faqat Yangilash tugmasi -->
              <button
                class="btn btn--ghost"
                type="button"
                :disabled="loading || !mode"
                @click="refreshCurrent"
              >
                {{ $t('buttons.refresh') }}
              </button>
            </div>
          </div>
  
          <!-- States -->
          <div v-if="loading" class="content__state content__state--loading">
            <div class="spinner"></div>
            <p>{{ $t('states.loading') }}</p>
          </div>
  
          <div v-else-if="sortedRegions.length === 0" class="content__state content__state--empty">
            <p>{{ $t('stats.empty') }}</p>
          </div>
  
          <!-- Hierarxik ro'yxat -->
          <div v-else class="stat-list">
            <div
              v-for="(region, regionIndex) in sortedRegions"
              :key="region.id"
              class="stat-block"
            >
              <!-- REGION -->
              <div
                class="stat-row stat-row--region"
                @click="toggleRegion(region.id)"
              >
                <div class="stat-row__left">
                  <div
                    class="circle"
                    :style="{ backgroundColor: getGradientColor(regionIndex, sortedRegions.length) }"
                  ></div>
                  <div class="stat-row__titles">
                    <span class="stat-row__name">
                      {{ region.name }}
                    </span>
                    <span class="stat-row__sub" v-if="mode === 'similarity'">
                      {{ $t('stats.metricRegionSimilarity') }}
                    </span>
                    <span class="stat-row__sub" v-else>
                      {{ $t('stats.metricRegionFake') }}
                    </span>
                  </div>
                </div>
  
                <div class="stat-row__right">
                  <span class="stat-row__percent">
                    {{ formatPercentage(getMetricValue(region)) }}
                  </span>
  
                  <div class="button-group">
                    <button
                      class="mini-btn mini-btn--primary"
                      type="button"
                      @click.stop="viewRegion(region.name)"
                    >
                      {{ $t('stats.btnViewAll') }}
                    </button>
  
                    <template v-if="mode === 'fake'">
                      <button
                        class="mini-btn mini-btn--success"
                        type="button"
                        @click.stop="viewRealRegion(region.name)"
                      >
                        {{ $t('stats.btnViewRealShort') }}
                      </button>
                      <button
                        class="mini-btn mini-btn--danger"
                        type="button"
                        @click.stop="viewFakeRegion(region.name)"
                      >
                        {{ $t('stats.btnViewFakeShort') }}
                      </button>
                    </template>
                  </div>
  
                  <span class="stat-row__chevron">
                    {{ activeRegion === region.id ? "–" : "+" }}
                  </span>
                </div>
              </div>
  
              <!-- DISTRICTS -->
              <div
                v-if="activeRegion === region.id"
                class="stat-children stat-children--region"
              >
                <div
                  v-for="(district, districtIndex) in sortedDistricts(region.id)"
                  :key="district.id"
                  class="stat-block"
                >
                  <div
                    class="stat-row stat-row--district"
                    @click="toggleDistrict(district.id)"
                  >
                    <div class="stat-row__left">
                      <div
                        class="circle circle--small"
                        :style="{ backgroundColor: getGradientColor(districtIndex, (districts[region.id] || []).length) }"
                      ></div>
                      <div class="stat-row__titles">
                        <span class="stat-row__name">
                          {{ district.name }}
                        </span>
                        <span class="stat-row__sub" v-if="mode === 'similarity'">
                          {{ $t('stats.metricDistrictSimilarity') }}
                        </span>
                        <span class="stat-row__sub" v-else>
                          {{ $t('stats.metricDistrictFake') }}
                        </span>
                      </div>
                    </div>
  
                    <div class="stat-row__right">
                      <span class="stat-row__percent">
                        {{ formatPercentage(getMetricValue(district)) }}
                      </span>
  
                      <div class="button-group">
                        <button
                          class="mini-btn mini-btn--primary"
                          type="button"
                          @click.stop="viewDistrict(region.name, district.name)"
                        >
                          {{ $t('stats.btnViewAll') }}
                        </button>
  
                        <template v-if="mode === 'fake'">
                          <button
                            class="mini-btn mini-btn--success"
                            type="button"
                            @click.stop="viewRealDistrict(region.name, district.name)"
                          >
                            {{ $t('stats.btnViewRealShort') }}
                          </button>
                          <button
                            class="mini-btn mini-btn--danger"
                            type="button"
                            @click.stop="viewFakeDistrict(region.name, district.name)"
                          >
                            {{ $t('stats.btnViewFakeShort') }}
                          </button>
                        </template>
                      </div>
  
                      <span class="stat-row__chevron">
                        {{ activeDistrict === district.id ? "–" : "+" }}
                      </span>
                    </div>
                  </div>
  
                  <!-- FISHES -->
                  <div
                    v-if="activeDistrict === district.id"
                    class="stat-children stat-children--district"
                  >
                    <div
                      v-for="(fish, fishIndex) in sortedFishes(district.id)"
                      :key="fish.fish"
                      class="stat-row stat-row--fish"
                    >
                      <div class="stat-row__left">
                        <div
                          class="circle circle--tiny"
                          :style="{ backgroundColor: getGradientColor(fishIndex, (fishes[district.id] || []).length) }"
                        ></div>
                        <div class="stat-row__titles">
                          <span class="stat-row__name">
                            {{ fish.fish }}
                          </span>
                          <span class="stat-row__sub" v-if="mode === 'similarity'">
                            {{ $t('stats.metricFishSimilarity') }}
                          </span>
                          <span class="stat-row__sub" v-else>
                            {{ $t('stats.metricFishFake') }}
                          </span>
                        </div>
                      </div>
  
                      <div class="stat-row__right">
                        <span class="stat-row__percent">
                          {{ formatPercentage(getMetricValue(fish)) }}
                        </span>
  
                        <div class="button-group">
                          <button
                            class="mini-btn mini-btn--primary"
                            type="button"
                            @click.stop="viewFish(region.name, district.name, fish.fish)"
                          >
                            {{ $t('stats.btnViewAllShort') }}
                          </button>
  
                          <template v-if="mode === 'fake'">
                            <button
                              class="mini-btn mini-btn--success"
                              type="button"
                              @click.stop="viewRealFish(region.name, district.name, fish.fish)"
                            >
                              {{ $t('stats.btnViewRealShort') }}
                            </button>
                            <button
                              class="mini-btn mini-btn--danger"
                              type="button"
                              @click.stop="viewFakeFish(region.name, district.name, fish.fish)"
                            >
                              {{ $t('stats.btnViewFakeShort') }}
                            </button>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- /FISHES -->
                </div>
              </div>
              <!-- /DISTRICTS -->
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "StatisticsPage",
    data() {
      return {
        mode: "fake", // yoki 'similarity' – xohlagan defaultingizni qo‘ying
  
        regions: [],
        districts: {}, // { [regionId]: [districts] }
        fishes: {}, // { [districtId]: [fishes] }
  
        loading: false,
        activeRegion: null,
        activeDistrict: null,
  
        locales: ["uz", "ru", "en"],
        isAdmin: true
      };
    },
    computed: {
      currentLocale() {
        return this.$i18n?.locale || "uz";
      },
      metricTitle() {
        if (this.mode === "fake") return this.$t("stats.fakeTitle");
        return this.$t("stats.similarityTitle");
      },
      sortedRegions() {
        if (!this.regions || !this.regions.length) return [];
        // KATTA foizdan KICHIK foizga (qizil tepada bo‘lishi uchun)
        return [...this.regions].sort(
          (a, b) => this.getMetricValue(b) - this.getMetricValue(a)
        );
      },
      activeRegionName() {
        const r = this.sortedRegions.find((x) => x.id === this.activeRegion);
        return r ? r.name : "";
      },
      activeDistrictName() {
        if (!this.activeRegion || !this.activeDistrict) return "";
        const list = this.districts[this.activeRegion] || [];
        const d = list.find((x) => x.id === this.activeDistrict);
        return d ? d.name : "";
      }
    },
    methods: {
      // AppBar
      changeLocale(locale) {
  if (!this.locales.includes(locale)) return;
  if (this.$i18n) this.$i18n.locale = locale;
  try {
    localStorage.setItem("locale", locale);
  } catch (e) {
    // masalan, private rejimda localStorage ishlamasa shu yerga tushadi
    console.warn("Locale ni saqlab bo'lmadi:", e);
  }
},

      logout() {
        localStorage.removeItem("token");
        this.$router.push({ name: "Login" });
      },
      goToDashboard() {
        this.$router.push("/dashboard");
      },
  
      // Mode & data
      switchMode(newMode) {
        if (this.mode === newMode) return;
        this.mode = newMode;
        this.refreshCurrent();
      },
      refreshCurrent() {
        this.resetData();
        this.fetchRegions();
      },
      resetData() {
        this.regions = [];
        this.districts = {};
        this.fishes = {};
        this.activeRegion = null;
        this.activeDistrict = null;
      },
  
      async fetchRegions() {
        if (!this.mode) return;
        this.loading = true;
        try {
          const token = localStorage.getItem("token");
          const base = "https://trackapi.pochta.uz/api";
  
          const url =
            this.mode === "fake"
              ? `${base}/regions/is_real/`
              : `${base}/regions/`;
  
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          this.regions = Array.isArray(data) ? data : [];
        } catch (e) {
          console.error("Regionlarni olishda xatolik:", e);
          this.regions = [];
        } finally {
          this.loading = false;
        }
      },
  
      async fetchDistricts(regionId) {
        if (this.districts[regionId]) return;
  
        try {
          const token = localStorage.getItem("token");
          const base = "https://trackapi.pochta.uz/api";
  
          const suffix =
            this.mode === "fake" ? "/districts/is_real/" : "/districts/";
  
          const response = await fetch(`${base}/region/${regionId}${suffix}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          this.districts[regionId] = Array.isArray(data) ? data : [];
        } catch (e) {
          console.error("Districtlarni olishda xatolik:", e);
          this.districts[regionId] = [];
        }
      },
  
      async fetchFishes(districtId) {
        if (this.fishes[districtId]) return;
  
        try {
          const token = localStorage.getItem("token");
          const base = "https://trackapi.pochta.uz/api";
  
          const suffix =
            this.mode === "fake"
              ? "/fish-with-similarity/is_real/"
              : "/fish-with-similarity/";
  
          const response = await fetch(
            `${base}/district/${districtId}${suffix}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const data = await response.json();
          this.fishes[districtId] = Array.isArray(data) ? data : [];
        } catch (e) {
          console.error("Fishlarni olishda xatolik:", e);
          this.fishes[districtId] = [];
        }
      },
  
      sortedDistricts(regionId) {
        const list = this.districts[regionId] || [];
        return [...list].sort(
          (a, b) => this.getMetricValue(b) - this.getMetricValue(a)
        );
      },
      sortedFishes(districtId) {
        const list = this.fishes[districtId] || [];
        return [...list].sort(
          (a, b) => this.getMetricValue(b) - this.getMetricValue(a)
        );
      },
  
      getMetricValue(item) {
        if (!item) return 0;
        if (this.mode === "fake") {
          return Number(item.fake_picture_percentage || 0);
        }
        return Number(item.similarity_percentage || 0);
      },
  
      formatPercentage(value) {
        const num = Number(value) || 0;
        return `${num.toFixed(3)} %`;
      },
  
      // YUQORIDAGI QIZIL – gradientni teskari qilamiz
      getGradientColor(index, totalItems) {
        const green = [0, 255, 0];
        const red = [255, 0, 0];
  
        if (!totalItems || totalItems <= 1) {
          // bitta bo'lsa – neytral
          return `rgb(${red[0]}, ${red[1]}, ${red[2]})`;
        }
  
        // index 0 => qizil, oxiri => yashil
        const ratio = 1 - index / (totalItems - 1);
        const color = green.map((g, i) =>
          Math.round(g + (red[i] - g) * ratio)
        );
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      },
  
      async toggleRegion(regionId) {
        if (this.activeRegion === regionId) {
          this.activeRegion = null;
          this.activeDistrict = null;
        } else {
          this.activeRegion = regionId;
          this.activeDistrict = null;
          await this.fetchDistricts(regionId);
        }
      },
  
      async toggleDistrict(districtId) {
        if (this.activeDistrict === districtId) {
          this.activeDistrict = null;
        } else {
          this.activeDistrict = districtId;
          await this.fetchFishes(districtId);
        }
      },
  
      // Dashboard URL
      openDashboard(regionName, districtName = null, fishName = null, isPerson = null) {
        const base = "https://foto.pochta.uz/dashboard";
  
        const parts = [base];
        if (regionName) parts.push(encodeURIComponent(regionName));
        if (districtName) parts.push(encodeURIComponent(districtName));
        if (fishName) parts.push(encodeURIComponent(fishName));
  
        let url = parts.join("/");
  
        if (isPerson !== null) {
          url += `?is_person=${isPerson ? "true" : "false"}`;
        }
  
        window.open(url, "_blank");
      },
  
      // Umumiy
      viewRegion(regionName) {
        this.openDashboard(regionName);
      },
      viewDistrict(regionName, districtName) {
        this.openDashboard(regionName, districtName);
      },
      viewFish(regionName, districtName, fishName) {
        this.openDashboard(regionName, districtName, fishName);
      },
  
      // Real / Soxta – faqat fake rejimi uchun
      viewRealRegion(regionName) {
        this.openDashboard(regionName, null, null, true);
      },
      viewFakeRegion(regionName) {
        this.openDashboard(regionName, null, null, false);
      },
      viewRealDistrict(regionName, districtName) {
        this.openDashboard(regionName, districtName, null, true);
      },
      viewFakeDistrict(regionName, districtName) {
        this.openDashboard(regionName, districtName, null, false);
      },
      viewRealFish(regionName, districtName, fishName) {
        this.openDashboard(regionName, districtName, fishName, true);
      },
      viewFakeFish(regionName, districtName, fishName) {
        this.openDashboard(regionName, districtName, fishName, false);
      }
    },
  
    mounted() {
      this.fetchRegions();
    }
  };
  </script>
  
  <style scoped>
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
    height: 100vh;
    min-height: 100vh;
    background: linear-gradient(180deg, #e5edff 0, #f9fafb 40%, #f3f4f6 100%);
    color: var(--text);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
      "Segoe UI", sans-serif;
    padding: 16px;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
  
  /* Language switch */
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
  
  .sidebar__text {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: var(--text-soft);
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
  }
  
  /* Content */
  .content {
    background: var(--bg-elevated);
    border-radius: 22px;
    padding: px 16px 18px;
    border: 1px solid var(--border-subtle);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: 0;
    height: 100%;
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
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Stat mode toggle (sidebar) – alohida kartochkalar */
.stat-toggle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  background: transparent;
  border: none;
}

.stat-toggle--vertical {
  align-items: stretch;
}

.stat-toggle__btn {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: #ffffff;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #4b5563;              /* oddiy holatda kulrang matn */
  border-radius: 999px;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.06);
  transition:
    background 0.15s ease-out,
    color 0.15s ease-out,
    box-shadow 0.15s ease-out,
    transform 0.12s ease-out,
    border-color 0.15s ease-out;
}

/* Faqat aktiv bo‘lmagan tugmalar hover bo‘lganda */
.stat-toggle__btn:hover:not(.stat-toggle__btn--active) {
  background: #f3f4ff;
  border-color: #93c5fd;
  color: #1d4ed8;              /* ko‘k matn */
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.18);
  transform: translateY(-1px);
}

/* Aktiv tugma – ko‘k gradient, hoverda ham shu holatda qoladi */
.stat-toggle__btn--active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border-color: transparent;
  box-shadow:
    0 12px 26px rgba(37, 99, 235, 0.45),
    0 0 0 1px rgba(191, 219, 254, 0.7);
  transform: translateY(-1px);
}

  
  /* Legend */
  .legend {
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: 14px;
    background: #f9fafb;
    border: 1px dashed rgba(148, 163, 184, 0.7);
  }
  
  .legend__row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }
  
  .legend__dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
  }
  
  .legend__dot--good {
    background: rgb(0, 200, 0);
  }
  
  .legend__dot--bad {
    background: rgb(220, 0, 0);
  }
  
  .legend__label {
    font-size: 12px;
    color: var(--text-soft);
  }
  
  .legend__hint {
    margin: 4px 0 0 0;
    font-size: 11px;
    color: var(--text-soft);
  }
  
  /* Stat list */
  .stat-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 10px;
  }
  
  .stat-block {
    margin-bottom: 4px;
  }
  
  /* Rows */
  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-radius: 12px;
    background: #f9fafb;
    border: 1px solid rgba(148, 163, 184, 0.7);
    cursor: pointer;
    transition: background 0.12s ease-out, box-shadow 0.12s ease-out,
      transform 0.12s ease-out, border-color 0.12s ease-out;
  }
  
  .stat-row:hover {
    background: #ffffff;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
    border-color: var(--accent-strong);
    transform: translateY(-1px);
  }
  
  .stat-row__left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  
  .stat-row__titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  
  .stat-row__name {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  
  .stat-row__sub {
    font-size: 11px;
    color: var(--text-soft);
  }
  
  .stat-row__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .stat-row__percent {
    font-size: 13px;
    font-weight: 600;
    min-width: 75px;
    text-align: right;
    color: #111827;
  }
  
  .stat-row__chevron {
    font-size: 16px;
    font-weight: 600;
    color: #9ca3af;
    min-width: 14px;
    text-align: center;
  }
  
  /* Row types */
  .stat-row--region {
    margin-top: 4px;
  }
  
  .stat-row--district {
    background: #f3f4f6;
  }
  
  .stat-row--fish {
    background: #eef2ff;
  }
  
  /* Children indentation */
  .stat-children--region {
    margin-left: 20px;
    border-left: 2px dashed rgba(148, 163, 184, 0.6);
    padding-left: 10px;
    margin-top: 4px;
  }
  
  .stat-children--district {
    margin-left: 20px;
    border-left: 2px dashed rgba(148, 163, 184, 0.4);
    padding-left: 10px;
    margin-top: 4px;
  }
  
  /* Circles */
  .circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid #e5e7eb;
  }
  
  .circle--small {
    width: 16px;
    height: 16px;
  }
  
  .circle--tiny {
    width: 12px;
    height: 12px;
  }
  
  /* Mini buttons */
  .button-group {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
  }
  
  .mini-btn {
    padding: 4px 8px;
    border-radius: 999px;
    border: none;
    font-size: 11px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.14s ease-out, transform 0.12s ease-out,
      box-shadow 0.12s ease-out;
  }
  
  .mini-btn--primary {
    background-color: #183e98;
    color: #ffffff;
  }
  
  .mini-btn--primary:hover {
    background-color: #1d4ed8;
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.4);
    transform: translateY(-1px);
  }
  
  .mini-btn--success {
    background-color: #22c55e;
    color: #ffffff;
  }
  
  .mini-btn--success:hover {
    background-color: #16a34a;
    box-shadow: 0 8px 16px rgba(34, 197, 94, 0.4);
    transform: translateY(-1px);
  }
  
  .mini-btn--danger {
    background-color: #ef4444;
    color: #ffffff;
  }
  
  .mini-btn--danger:hover {
    background-color: #b91c1c;
    box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
    transform: translateY(-1px);
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
      justify-content: flex-end;
    }
  }
  </style>
  