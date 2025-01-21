<template>
    <div id="app" style="margin: 20px;">
        <h1 style="color: #fff; cursor: pointer;" onclick="window.location.href='https://foto.pochta.uz/dashboard';">
            Statistika
        </h1>

        <div v-if="loading" class="loading-overlay">
            <p>Ma'lumotlar yuklanmoqda...</p>
        </div>
        <div v-else>
            <div v-for="(region, regionIndex) in sortedRegions" :key="regionIndex">
                <div v-if="activeRegion === null || activeRegion === regionIndex" class="region"
                    @click="toggleRegion(regionIndex)">
                    <div class="circle"
                        :style="{ backgroundColor: getGradientColor(regionIndex, sortedRegions.length) }"></div>
                    <span class="bold-text region-name">{{ region.region_name }}</span>
                    <span class="bold-text percentage">{{ formatPercentage(region.region_similarity_percentage)
                        }}</span>
                    <button @click.stop="viewRegion(region.region_name)" class="view-button">Rasmlarni ko'rish</button>
                </div>
                <div v-if="activeRegion === regionIndex">
                    <div v-for="(district, districtIndex) in sortedDistricts(region)" :key="districtIndex">
                        <div v-if="activeDistrict === null || activeDistrict === districtIndex" class="district"
                            @click="toggleDistrict(districtIndex)">
                            <div class="circle"
                                :style="{ backgroundColor: getGradientColor(districtIndex, sortedDistricts(region).length) }">
                            </div>
                            <span class="bold-text region-name">{{ district.district_name }}</span>
                            <span class="bold-text percentage">{{
                                formatPercentage(district.district_similarity_percentage) }}</span>
                            <button @click.stop="viewDistrict(region.region_name, district.district_name)"
                                class="view-button">Rasmlarni ko'rish</button>
                        </div>
                        <div v-if="activeDistrict === districtIndex">
                            <div v-for="(fish, fishIndex) in sortedFishes(district)" :key="fishIndex" class="fish">
                                <div class="circle"
                                    :style="{ backgroundColor: getGradientColor(fishIndex, sortedFishes(district).length) }">
                                </div>
                                <span class="bold-text region-name">{{ fish.fish }}</span>
                                <span class="bold-text percentage">{{ formatPercentage(fish.similarity_percentage)
                                    }}</span>
                                <button @click.stop="viewFish(fish.fish)" class="view-button">Rasmlarni ko'rish</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "RegionStatistics",
    data() {
        return {
            data: [],
            loading: true,
            activeRegion: null,
            activeDistrict: null,
        };
    },
    computed: {
        sortedRegions() {
            return Array.isArray(this.data) ? [...this.data].sort((a, b) => a.region_similarity_percentage - b.region_similarity_percentage) : [];
        },
    },
    methods: {
        sortedDistricts(region) {
            return Array.isArray(region.districts) ? [...region.districts].sort((a, b) => a.district_similarity_percentage - b.district_similarity_percentage) : [];
        },
        sortedFishes(district) {
            return Array.isArray(district.fishes) ? [...district.fishes].sort((a, b) => a.similarity_percentage - b.similarity_percentage) : [];
        },
        formatPercentage(value) {
            return `${value.toFixed(3)} %`; // Foizni x.xxx formatda ko‘rsatish
        },
        getGradientColor(index, totalItems) {
            const green = [0, 255, 0];
            const red = [255, 0, 0];
            const ratio = index / (totalItems - 1);
            const color = green.map((g, i) => Math.round(g + (red[i] - g) * ratio));
            return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        },
        toggleRegion(regionIndex) {
            this.activeRegion = this.activeRegion === regionIndex ? null : regionIndex;
            this.activeDistrict = null;
        },
        toggleDistrict(districtIndex) {
            this.activeDistrict = this.activeDistrict === districtIndex ? null : districtIndex;
        },
        viewRegion(regionName) {
            const url = `https://foto.pochta.uz/dashboard/${encodeURIComponent(regionName)}`;
            window.open(url, "_blank");
        },
        viewDistrict(regionName, districtName) {
            const url = `https://foto.pochta.uz/dashboard/${encodeURIComponent(regionName)}/${encodeURIComponent(districtName)}`;
            window.open(url, "_blank");
        },
        viewFish(fishName) {
            const url = `https://foto.pochta.uz/dashboard/${encodeURIComponent(fishName)}`;
            window.open(url, "_blank");
        },
    },
    async mounted() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                this.$router.push("/login");
                return;
            }
            const response = await fetch("https://trackapi.pochta.uz/api/region-district-fish-statistics/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            this.data = await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            this.loading = false;
        }
    },
};
</script>

<style>
body {

    background-color: #183e98;
}

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

.bold-text {
    font-weight: bold;
    color: #ffffff;
}

.region-name {
    /* margin-left: -750px; */
    flex: 1;
    text-align: left;
}

.percentage {
    margin-left: 10px;
    text-align: left;
    flex-basis: 80px;
}

.circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
    border: 1px solid #ccc;
}

.view-button {
    margin-left: 10px;
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
}
</style>
