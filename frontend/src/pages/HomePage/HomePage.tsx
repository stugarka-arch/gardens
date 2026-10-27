import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths";
import { useAuthStore } from "../../stores/authStore";
export function HomePage() {
  const user = useAuthStore((state) => state.user);
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Ваш сад — у продуманій формі</p>
          <h1>Плануйте клумби, що хочеться розглядати.</h1>
          <p>
            Gardens допомагає знайти рослини, зібрати їх у композицію та
            зберегти план вашої ділянки.
          </p>
          <div className="actions">
            <Link
              className="button"
              to={user ? routePaths.newFlowerbed : routePaths.auth}
            >
              Створити клумбу
            </Link>
            <Link className="button button--secondary" to={routePaths.catalog}>
              Знайти рослини
            </Link>
          </div>
        </div>
        <div className="hero__visual">
          <span>✿</span>
          <span>🌿</span>
          <span>✾</span>
        </div>
      </section>
      <section className="features">
        <article>
          <b>01</b>
          <h2>Живий каталог</h2>
          <p>Шукайте за назвою, світлом, висотою та іншими характеристиками.</p>
        </article>
        <article>
          <b>02</b>
          <h2>План клумби</h2>
          <p>Розміщуйте рослини на схемі в реальних сантиметрах.</p>
        </article>
        <article>
          <b>03</b>
          <h2>AI-пошук</h2>
          <p>Запитуйте про рослини, яких ще немає у каталозі.</p>
        </article>
      </section>
    </>
  );
}
