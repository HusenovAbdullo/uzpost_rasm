<template>
  <div class="login-page">
    <!-- AppBar -->
    <header class="appbar">
      <div class="appbar__inner">
        <h1
          class="appbar__title"
          title="GIBRID XATLARINI TOPSHIRILISHINI NAZORAT QILISH DASTURI"
        >
          GIBRID XATLARINI TOPSHIRILISHINI NAZORAT QILISH DASTURI
        </h1>
      </div>
    </header>

    <!-- Body -->
    <main class="login-main">
      <section class="login-card">
        <div class="login-card__top">
          <h2 class="login-card__title">Tizimga kirish</h2>
          <p class="login-card__subtitle">
            Login va parolingizni kiriting
          </p>
        </div>

        <form class="login-form" @submit.prevent="login">
          <div class="form-group">
            <label for="username">Foydalanuvchi nomi</label>
            <input
              id="username"
              v-model.trim="username"
              type="text"
              autocomplete="username"
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
              autocomplete="current-password"
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
/* Fon va asosiy ranglar */
.login-page {
  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --text: #0f172a;
  --text-soft: #6b7280;

  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top left, #dbeafe 0, #eff6ff 30%, #f9fafb 60%, #e5e7eb 100%);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;
}

/* Dekorativ blur-orbitlar */
.login-page::before,
.login-page::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  filter: blur(40px);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
}

.login-page::before {
  width: 460px;
  height: 460px;
  top: -180px;
  right: -150px;
  background: conic-gradient(
    from 210deg,
    rgba(59, 130, 246, 0.4),
    rgba(129, 140, 248, 0.45),
    rgba(56, 189, 248, 0.25),
    rgba(59, 130, 246, 0.4)
  );
}

.login-page::after {
  width: 380px;
  height: 380px;
  bottom: -150px;
  left: -130px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.22), transparent 60%);
}

/* AppBar */
.appbar {
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.appbar__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98),
    rgba(239, 246, 255, 0.98)
  );
  box-shadow:
    0 20px 50px rgba(15, 23, 42, 0.2),
    0 0 0 1px rgba(148, 163, 184, 0.45);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.appbar__title {
  font-size: 18px;
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
  gap: 28px;
  position: relative;
  z-index: 1;
}

/* Katta login karta */
.login-card {
  width: 100%;
  max-width: 480px;
  padding: 32px 32px 26px;
  border-radius: 28px;
  background: radial-gradient(circle at top left, #ffffffee, #f9fafbea);
  border: 1px solid rgba(148, 163, 184, 0.45);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Sarlavha qismi – yirikroq */
.login-card__top {
  text-align: center;
}

.login-card__title {
  margin: 0 0 6px 0;
  font-size: 26px;
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--text);
}

.login-card__subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-soft);
}

/* Form – yirik inputlar */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-soft);
}

.form-group input {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  background: #f9fafb;
  padding: 12px 16px;
  font-size: 15px;
  color: #0f172a;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.14s ease-out, box-shadow 0.14s ease-out,
    background 0.14s ease-out;
}

.form-group input::placeholder {
  color: rgba(148, 163, 184, 0.9);
}

.form-group input:focus {
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35);
  background: #ffffff;
}

/* Katta tugma */
.btn {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out,
    background 0.12s ease-out, opacity 0.12s ease-out;
  white-space: nowrap;
}

.btn--primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #f9fafb;
  box-shadow:
    0 16px 36px rgba(37, 99, 235, 0.68),
    0 0 0 1px rgba(191, 219, 254, 0.9);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow:
    0 20px 44px rgba(30, 64, 175, 0.82),
    0 0 0 1px rgba(219, 234, 254, 1);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow:
    0 10px 24px rgba(30, 64, 175, 0.7),
    0 0 0 1px rgba(191, 219, 254, 1);
}

.btn--primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow:
    0 10px 24px rgba(148, 163, 184, 0.5),
    0 0 0 1px rgba(209, 213, 219, 0.9);
}

.btn--full {
  width: 100%;
}

/* Spinner */
.btn__spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(148, 163, 184, 0.3);
  border-top-color: #eff6ff;
  border-right-color: #eff6ff;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Xato xabar */
.login-error {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 14px;
  background: #fef2f2;
  border: 1px solid rgba(248, 113, 113, 0.85);
  color: #b91c1c;
  font-size: 13px;
  text-align: center;
}

/* Footer */
.login-footer {
  font-size: 11px;
  color: var(--text-soft);
  opacity: 0.9;
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

/* Mobil */
@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .appbar__inner {
    padding-inline: 16px;
    border-radius: 20px;
  }

  .appbar__title {
    font-size: 14px;
  }

  .login-card {
    padding: 26px 20px 22px;
    max-width: 100%;
  }

  .login-card__title {
    font-size: 22px;
  }
}
</style>
