<template>
    <div id="app" style="margin: 20px;">
      <h1 style="color: #fff; cursor: pointer;" @click="goToDashboard">
        Statistika
      </h1>
  
      <div v-if="loading" class="loading-overlay">
        <p>Ma'lumotlar yuklanmoqda...</p>
      </div>
  
      <div v-else>
        <div v-for="(region, regionIndex) in sortedRegions" :key="region.id">
          <!-- REGION ROW -->
          <div
            v-if="activeRegion === null || activeRegion === region.id"
            class="region"
            @click="toggleRegion(region.id)"
          >
            <div
              class="circle"
              :style="{ backgroundColor: getGradientColor(regionIndex, sortedRegions.length) }"
            ></div>
  
            <span class="bold-text region-name">
              {{ region.name }}
            </span>
  
            <span class="bold-text percentage">
              {{ formatPercentage(region.fake_picture_percentage) }}
            </span>
  
            <div class="button-group">
              <button
                @click.stop="viewRegion(region.name)"
                class="view-button"
              >
                Umumiy
              </button>
              <button
                @click.stop="viewRealRegion(region.name)"
                class="photo-button"
              >
                Real rasmlar
              </button>
              <button
                @click.stop="viewFakeRegion(region.name)"
                class="photo-button photo-button--fake"
              >
                Soxta rasmlar
              </button>
            </div>
          </div>
  
          <!-- DISTRICTS LIST -->
          <div v-if="activeRegion === region.id">
            <div
              v-for="(district, districtIndex) in sortedDistricts(region.id)"
              :key="district.id"
            >
              <!-- DISTRICT ROW -->
              <div
                v-if="activeDistrict === null || activeDistrict === district.id"
                class="district"
                @click="toggleDistrict(district.id)"
              >
                <div
                  class="circle"
                  :style="{
                    backgroundColor: getGradientColor(
                      districtIndex,
                      districts[region.id]?.length || 0
                    ),
                  }"
                ></div>
  
                <span class="bold-text region-name">
                  {{ district.name }}
                </span>
  
                <span class="bold-text percentage">
                  {{ formatPercentage(district.fake_picture_percentage) }}
                </span>
  
                <div class="button-group">
                  <button
                    @click.stop="viewDistrict(region.name, district.name)"
                    class="view-button"
                  >
                    Umumiy
                  </button>
                  <button
                    @click.stop="viewRealDistrict(region.name, district.name)"
                    class="photo-button"
                  >
                    Real rasmlar
                  </button>
                  <button
                    @click.stop="viewFakeDistrict(region.name, district.name)"
                    class="photo-button photo-button--fake"
                  >
                    Soxta rasmlar
                  </button>
                </div>
              </div>
  
              <!-- FISH LIST -->
              <div v-if="activeDistrict === district.id">
                <div
                  v-for="(fish, fishIndex) in sortedFishes(district.id)"
                  :key="fish.fish"
                  class="fish"
                >
                  <div
                    class="circle"
                    :style="{
                      backgroundColor: getGradientColor(
                        fishIndex,
                        fishes[district.id]?.length || 0
                      ),
                    }"
                  ></div>
  
                  <span class="bold-text region-name">
                    {{ fish.fish }}
                  </span>
  
                  <span class="bold-text percentage">
                    {{ formatPercentage(fish.fake_picture_percentage) }}
                  </span>
  
                  <div class="button-group">
                    <button
                      @click.stop="
                        viewFish(region.name, district.name, fish.fish)
                      "
                      class="view-button"
                    >
                      Umumiy
                    </button>
                    <button
                      @click.stop="
                        viewRealFish(region.name, district.name, fish.fish)
                      "
                      class="photo-button"
                    >
                      Real rasmlar
                    </button>
                    <button
                      @click.stop="
                        viewFakeFish(region.name, district.name, fish.fish)
                      "
                      class="photo-button photo-button--fake"
                    >
                      Soxta rasmlar
                    </button>
                  </div>
                </div>
              </div>
              <!-- /FISH LIST -->
            </div>
          </div>
          <!-- /DISTRICTS LIST -->
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "RegionStatistics",
    data() {
      return {
        regions: [],
        districts: {}, // { [regionId]: [districts] }
        fishes: {}, // { [districtId]: [fishes] }
        loading: true,
        activeRegion: null,
        activeDistrict: null,
      };
    },
    computed: {
      sortedRegions() {
        if (!this.regions || !this.regions.length) return [];
        // Kichikdan kattaga qarab tartib (kam soxta → ko‘p soxta)
        return [...this.regions].sort(
          (a, b) => a.fake_picture_percentage - b.fake_picture_percentage
        );
      },
    },
    methods: {
      async fetchDistricts(regionId) {
        if (!this.districts[regionId]) {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `https://trackapi.pochta.uz/api/region/${regionId}/districts/is_real/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const data = await response.json();
            this.districts[regionId] = data || [];
          } catch (e) {
            console.error("Districtlarni olishda xatolik:", e);
            this.districts[regionId] = [];
          }
        }
      },
  
      async fetchFishes(districtId) {
        if (!this.fishes[districtId]) {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `https://trackapi.pochta.uz/api/district/${districtId}/fish-with-similarity/is_real/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const data = await response.json();
            this.fishes[districtId] = data || [];
          } catch (e) {
            console.error("Fishlarni olishda xatolik:", e);
            this.fishes[districtId] = [];
          }
        }
      },
  
      sortedDistricts(regionId) {
        const list = this.districts[regionId] || [];
        return [...list].sort(
          (a, b) => a.fake_picture_percentage - b.fake_picture_percentage
        );
      },
  
      sortedFishes(districtId) {
        const list = this.fishes[districtId] || [];
        return [...list].sort(
          (a, b) => a.fake_picture_percentage - b.fake_picture_percentage
        );
      },
  
      formatPercentage(value) {
        const num = Number(value) || 0;
        return `${num.toFixed(3)} %`;
      },
  
      getGradientColor(index, totalItems) {
        // yashil → qizil gradient
        const green = [0, 255, 0];
        const red = [255, 0, 0];
  
        if (!totalItems || totalItems <= 1) {
          return `rgb(${green[0]}, ${green[1]}, ${green[2]})`;
        }
  
        const ratio = index / (totalItems - 1);
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
  
      // Dashboard URL qurish (Umumiy + real/soxta uchun)
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
  
      // Umumiy dashboard sahifalar
      viewRegion(regionName) {
        this.openDashboard(regionName);
      },
  
      viewDistrict(regionName, districtName) {
        this.openDashboard(regionName, districtName);
      },
  
      viewFish(regionName, districtName, fishName) {
        this.openDashboard(regionName, districtName, fishName);
      },
  
      // REAL / SOXTA rasmlar ham dashboardga, is_person bilan
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
      },
  
      goToDashboard() {
        window.location.href = "https://foto.pochta.uz/dashboard";
      },
    },
  
    async mounted() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://trackapi.pochta.uz/api/regions/is_real/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        this.regions = data || [];
      } catch (error) {
        console.error("Regionlarni olishda xatolik:", error);
        this.regions = [];
      } finally {
        this.loading = false;
      }
    },
  };
  </script>
  
  <style scoped>
  .region,
  .district,
  .fish {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border-radius: 5px;
    cursor: pointer;
    color: #fff;
    font-size: 14px;
    background: #f07824;
  }
  
  .circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
    border: 1px solid #ccc;
  }
  
  .bold-text {
    font-weight: bold;
    color: #ffffff;
  }
  
  .region-name {
    flex: 1;
    text-align: left;
  }
  
  .percentage {
    margin-left: 10px;
    text-align: left;
    flex-basis: 80px;
  }
  
  .button-group {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  
  .view-button {
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    background-color: #183e98;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .view-button:hover {
    background-color: #0056b3;
  }
  
  .photo-button {
    padding: 5px 10px;
    border-radius: 5px;
    border: none;
    background-color: #28a745;
    font-size: 12px;
    cursor: pointer;
    color: #fff;
    transition: background-color 0.3s ease;
  }
  
  .photo-button:hover {
    background-color: #218838;
  }
  
  .photo-button--fake {
    background-color: #c82333;
  }
  
  .photo-button--fake:hover {
    background-color: #a71d2a;
  }
  
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    color: #555;
    z-index: 1000;
  }
  </style>
  
  <style>
  body {
    background-color: #183e98;
  }
  </style>
  