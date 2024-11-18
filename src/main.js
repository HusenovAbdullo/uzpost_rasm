import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // Routerni import qilish

const app = createApp(App); // App ni yaratish
app.use(router); // Routerni qo'shish
app.mount("#app"); // Appni mount qilish
