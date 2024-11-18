<template>
    <div class="login-container">
        <div class="login-box">
            <h1>Kirish sahifasi</h1>
            <form @submit.prevent="login">
                <div class="input-container">
                    <input
                        v-model="username"
                        type="text"
                        placeholder="Foydalanuvchi nomi"
                        required
                    />
                    <input
                        v-model="password"
                        type="password"
                        placeholder="Parol"
                        required
                    />
                </div>
                <button type="submit" class="login-btn">Kirish</button>
            </form>
            <p v-if="error">{{ error }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "LoginPage",
    data() {
        return {
            username: "",
            password: "",
            error: null,
        };
    },
    methods: {
        async login() {
            try {
                const response = await fetch("https://trackapi.pochta.uz/api/token/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Login failed");
                }

                const data = await response.json();
                localStorage.setItem("token", data.access);
                this.$router.push("/dashboard");
            } catch (err) {
                this.error = err.message;
            }
        },
    },
};
</script>

<style scoped>
/* Body va HTML uchun margin va padding ni olib tashlang va kenglik va balandlikni 100% qilib belgilang */
body,
html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box; /* Barcha elementlar uchun box-sizing */
}

/* Background setup */
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(
        135deg,
        #74ebd5,
        #acb6e5
    ); /* Gradient background */
    font-family: "Arial", sans-serif;
}

/* Login box with 3D shadow */
.login-box {
    padding: 40px 30px;
    border-radius: 12px;
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    background: rgba(255, 255, 255, 0.9); /* Oq fon */
}

/* Input fields styling */
.input-container {
    margin-bottom: 20px;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 12px 1px;
    margin: 10px 0;
    border-radius: 8px;
    border: 1px solid #ddd;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    box-shadow: 0 10px 20px rgba(0, 123, 255, 0.3);
    transform: translateY(-5px);
}

/* Button with hover effect */
.login-btn {
    width: 100%;
    padding: 12px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.login-btn:hover {
    background: #2980b9;
    box-shadow: 0 10px 20px rgba(0, 123, 255, 0.4);
    transform: translateY(-5px);
}

.login-btn:active {
    transform: translateY(2px);
}

/* Error message styling */
p {
    color: red;
    margin-top: 10px;
    font-size: 14px;
}
</style>
