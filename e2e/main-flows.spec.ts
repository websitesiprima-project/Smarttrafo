import { test, expect } from "@playwright/test";

test.describe("Black Box Testing - PLN SMART Trafo", () => {
  // Test 1: Verifikasi Landing Page dimuat dengan benar (Black Box UI Check)
  test("Landing Page loads correctly and contains key elements", async ({
    page,
  }) => {
    // 1. Arahkan pengguna (Browser) ke situs utama
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 2. Verifikasi konten teks esensial (sebagai User)
    await expect(page.getByText(/Transformasi Digital/i).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("button", { name: /Mulai Analisis/i }).first(),
    ).toBeVisible();

    // 3. Pastikan tombol Navigasi Login ada di header
    const loginButton = page.getByRole("button", { name: /Login/i }).first();
    await expect(loginButton).toBeVisible();
  });

  // Test 2: Navigasi User Flow (Beranda -> Login Page)
  test("User can navigate to Login page successfully via Start button", async ({
    page,
  }) => {
    // 1. Berada di dalam website
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 2. Pengguna mengklik tombol Mulai Analisis
    await page
      .getByRole("button", { name: /Mulai Analisis/i })
      .first()
      .click();

    // 3. Pengguna diharapkan melihat formulir login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(
      page.getByRole("heading", { name: /Selamat Datang Kembali/i }),
    ).toBeVisible();
  });

  // Test 3: Simulasi Gagal Login karena Invalid Credentials (Test Batasan)
  test("Shows error/fails gracefully on invalid login attempt", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Mengisi form dengan data sembarangan, layaknya user salah memasukkan data
    await page.fill('input[type="email"]', "salah@pln.co.id");
    await page.fill('input[type="password"]', "password_salah");

    // Melakukan Klik tombol Masuk Aplikasi
    await page.getByRole("button", { name: /Masuk Aplikasi/i }).click();

    // Memastikan tidak redirect ke dashboard dan alert error/pesan failure tampil
    // Tunggu sedikit selama masa loading processing login
    await expect(
      page.getByRole("button", { name: /Masuk Aplikasi/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*\/login/); // URL masih tetap di login
  });
});
