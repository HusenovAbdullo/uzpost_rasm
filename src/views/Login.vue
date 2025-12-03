<template>
    <div class="login-page">
      <!-- AppBar - dashboard uslubida -->
      <header class="appbar">
        <div class="appbar__inner">
          <div class="appbar__left">
            <h1
              class="appbar__title"
              title="GIBRID XATLARINI TOPSHIRILISHINI NAZORAT QILISH DASTURI"
            >
              GIBRID XATLARINI TOPSHIRILISHINI NAZORAT QILISH DASTURI
            </h1>
          </div>
        </div>
      </header>
  
      <!-- Body -->
      <main class="login-main">
        <section class="login-card">
          <h2 class="login-card__title">Tizimga kirish</h2>
          <p class="login-card__subtitle">
            Iltimos, login va parolingizni kiriting
          </p>
  
          <form class="login-form" @submit.prevent="login">
            <div class="form-group">
              <label for="username">Foydalanuvchi nomi</label>
              <input
                id="username"
                v-model.trim="username"
                type="text"
                placeholder="Masalan: admin"
                required
              />
            </div>
  
            <div class="form-group">
              <label for="password">Parol</label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Parolingiz"
                required
              />
            </div>
  
            <button
              type="submit"
              class="btn btn--primary btn--full"
              :disabled="loading"
            >
              <span v-if="!loading">Kirish</span>
              <span v-else class="btn__spinner"></span>
            </button>
          </form>
  
          <p v-if="error" class="login-error">
            {{ error }}
          </p>
        </section>
  
        <footer class="login-footer">
          <small>
            © {{ currentYear }} &nbsp; "Oʻzbekiston pochtasi" AJ · Dasturchi:
            <a
              href="https://t.me/Husenov_Abdullo"
              target="_blank"
              rel="noopener"
              class="devlink"
            >
              Husenov Abdullo
            </a>
          </small>
        </footer>
      </main>
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
        loading: false,
        currentYear: new Date().getFullYear(),
      };
    },
    methods: {
      async login() {
        this.error = null;
        this.loading = true;
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
            // API xatosiga qarab biroz tushunarliroq matn
            if (response.status === 400 || response.status === 401) {
              throw new Error("Login yoki parol noto‘g‘ri.");
            }
            throw new Error("Kirishda xatolik yuz berdi. Keyinroq urinib ko‘ring.");
          }
  
          const data = await response.json();
          if (data.access) {
            localStorage.setItem("token", data.access);
            this.$router.push("/dashboard");
          } else {
            throw new Error("Token olinmadi. Administratorga murojaat qiling.");
          }
        } catch (err) {
          this.error = err.message || "Kutilmagan xatolik yuz berdi.";
        } finally {
          this.loading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Asosiy ranglar – dashboard bilan bir xil oilada */
  .login-page {
    --bg: #f3f4f6;
    --bg-elevated: #ffffff;
    --border-subtle: rgba(15, 23, 42, 0.08);
    --accent: #2563eb;
    --accent-strong: #1d4ed8;
    --danger: #ef4444;
    --text: #0f172a;
    --text-soft: #6b7280;
  
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #e5edff 0, #f9fafb 40%, #f3f4f6 100%);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
      "Segoe UI", sans-serif;
    padding: 16px;
    box-sizing: border-box;
  }
  
  /* AppBar – dashboarddagi pill uslubida */
  .appbar {
    margin-bottom: 24px;
  }
  
  .appbar__inner {
    display: flex;
    align-items: center;
    justify-content: center;
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
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin: 0;
    color: #0f172a;
    text-align: center;
  }
  
  /* Body layout */
  .login-main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
  }
  
  /* Login card – “glass” karta, dashboard kartalariga o‘xshash */
  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 26px 26px 24px;
    border-radius: 24px;
    background: radial-gradient(circle at top left, #ffffffee, #f9fafbea);
    border: 1px solid rgba(148, 163, 184, 0.45);
    box-shadow:
      0 18px 40px rgba(15, 23, 42, 0.16),
      0 0 0 1px rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  
  .login-card__title {
    margin: 0 0 4px 0;
    font-size: 22px;
    font-weight: 600;
    color: var(--text);
    text-align: center;
  }
  
  .login-card__subtitle {
    margin: 0 0 18px 0;
    font-size: 13px;
    color: var(--text-soft);
    text-align: center;
  }
  
  /* Form – sidebar’dagi form-group stiliga yaqin */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .form-group label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-soft);
  }
  
  .form-group input {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: #f9fafb;
    padding: 8px 14px;
    font-size: 14px;
    color: #0f172a;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }
  
  .form-group input::placeholder {
    color: rgba(148, 163, 184, 0.9);
  }
  
  .form-group input:focus {
    border-color: var(--accent-strong);
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35);
    background: #ffffff;
  }
  
  /* Buttonlar – dashboarddagi btn uslubiga mos */
  .btn {
    border: none;
    border-radius: 999px;
    padding: 9px 16px;
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
  
  .btn--primary {
    background: #ffffff;
    color: #1d4ed8;
    box-shadow:
      0 0 0 1px rgba(37, 99, 235, 0.18),
      0 14px 30px rgba(191, 219, 254, 0.9);
  }
  
  .btn--primary:hover:not(:disabled) {
    background: #eff6ff;
    box-shadow:
      0 0 0 1px rgba(37, 99, 235, 0.28),
      0 18px 34px rgba(191, 219, 254, 1);
  }
  
  .btn--primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  
  .btn--full {
    width: 100%;
  }
  
  /* Spinner – dashboarddagi spinner animatsiyasi bilan bir xil */
  .btn__spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(148, 163, 184, 0.3);
    border-top-color: var(--accent-strong);
    animation: spin 0.9s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Xato xabari – chiroyli badge ko‘rinishida */
  .login-error {
    margin-top: 14px;
    padding: 8px 12px;
    border-radius: 14px;
    background: #fef2f2;
    border: 1px solid rgba(248, 113, 113, 0.75);
    color: #b91c1c;
    font-size: 13px;
    text-align: center;
  }
  
  /* Pastki footer – dashboard sidebar footeriga mos */
  .login-footer {
    font-size: 11px;
    color: var(--text-soft);
    opacity: 0.8;
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
  
  /* Mobilga moslashtirish */
  @media (max-width: 640px) {
    .login-page {
      padding: 12px;
    }
  
    .appbar__inner {
      border-radius: 18px;
    }
  
    .appbar__title {
      font-size: 14px;
    }
  
    .login-card {
      padding: 22px 18px 20px;
    }
  
    .login-card__title {
      font-size: 20px;
    }
  }
  </style>
  