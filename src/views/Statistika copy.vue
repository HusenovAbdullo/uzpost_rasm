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
                <div v-if="activeRegion === null || activeRegion === region.id" class="region"
                    @click="toggleRegion(region.id)">
                    <div class="circle"
                        :style="{ backgroundColor: getGradientColor(regionIndex, sortedRegions.length) }"></div>
                    <span class="bold-text region-name">{{ region.name }}</span>
                    <span class="bold-text percentage">{{ formatPercentage(region.similarity_percentage) }}</span>
                    <button @click.stop="viewRegion(region.name)" class="view-button">Rasmlarni ko'rish</button>
                </div>
                <div v-if="activeRegion === region.id">
                    <div v-for="(district, districtIndex) in sortedDistricts(region.id)" :key="district.id">
                        <div v-if="activeDistrict === null || activeDistrict === district.id" class="district"
                            @click="toggleDistrict(district.id)">
                            <div class="circle"
                                :style="{ backgroundColor: getGradientColor(districtIndex, districts[region.id]?.length || 0) }">
                            </div>
                            <span class="bold-text region-name">{{ district.name }}</span>
                            <span class="bold-text percentage">{{ formatPercentage(district.similarity_percentage) }}</span>
                            <button @click.stop="viewDistrict(region.name, district.name)" class="view-button">Rasmlarni ko'rish</button>
                        </div>
                        <div v-if="activeDistrict === district.id">
                            <div v-for="(fish, fishIndex) in sortedFishes(district.id)" :key="fish.fish" class="fish">
                                <div class="circle"
                                    :style="{ backgroundColor: getGradientColor(fishIndex, fishes[district.id]?.length || 0) }">
                                </div>
                                <span class="bold-text region-name">{{ fish.fish }}</span>
                                <span class="bold-text percentage">{{ formatPercentage(fish.similarity_percentage) }}</span>
                                <button @click.stop="viewFish(region.name, district.name, fish.fish)" class="view-button">Rasmlarni ko'rish</button>
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
    name: 'RegionStatistics',
    data() {
        return {
            regions: [],
            districts: {},
            fishes: {},
            loading: true,
            activeRegion: null,
            activeDistrict: null,
        };
    },
    computed: {
        sortedRegions() {
            return [...this.regions].sort((a, b) => a.similarity_percentage - b.similarity_percentage);
        }
    },
    methods: {
        async fetchDistricts(regionId) {
            if (!this.districts[regionId]) {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://trackapi.pochta.uz/api/region/${regionId}/districts/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                this.districts[regionId] = data;
            }
        },
        async fetchFishes(districtId) {
            if (!this.fishes[districtId]) {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://trackapi.pochta.uz/api/district/${districtId}/fish-with-similarity/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                this.fishes[districtId] = data;
            }
        },
        sortedDistricts(regionId) {
            return this.districts[regionId] ? [...this.districts[regionId]].sort((a, b) => a.similarity_percentage - b.similarity_percentage) : [];
        },
        sortedFishes(districtId) {
            return this.fishes[districtId] ? [...this.fishes[districtId]].sort((a, b) => a.similarity_percentage - b.similarity_percentage) : [];
        },
        formatPercentage(value) {
            return `${value.toFixed(3)} %`;
        },
        getGradientColor(index, totalItems) {
            const green = [0, 255, 0];
            const red = [255, 0, 0];
            const ratio = index / (totalItems - 1);
            const color = green.map((g, i) => Math.round(g + (red[i] - g) * ratio));
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
        viewRegion(regionName) {
            window.open(`https://foto.pochta.uz/dashboard/${encodeURIComponent(regionName)}`, '_blank');
        },
        viewDistrict(regionName, districtName) {
            window.open(`https://foto.pochta.uz/dashboard/${encodeURIComponent(regionName)}/${encodeURIComponent(districtName)}`, '_blank');
        },
        viewFish(regionName, districtName, fishName) {
            window.open(`https://foto.pochta.uz/dashboard/${encodeURIComponent(regionName)}/${encodeURIComponent(districtName)}/${encodeURIComponent(fishName)}`, '_blank');
        },
        goToDashboard() {
            window.location.href = 'https://foto.pochta.uz/dashboard';
        }
    },
    async mounted() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://trackapi.pochta.uz/api/regions/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            this.regions = await response.json();
        } catch (error) {
            console.error('Error fetching regions:', error);
        } finally {
            this.loading = false;
        }
    },
};
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 20px;
    z-index: 1000;
}

.region, .district, .fish {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 10px;
}

.bold-text {
    font-weight: bold;
}

.view-button {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
}

.view-button:hover {
    background-color: #0056b3;
}
</style>


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
