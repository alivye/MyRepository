# Twin Towers Flight (Flappy-style)

Ниже — минимальные шаги, чтобы запустить игру локально.

## Быстрый запуск без npm

1. Перейдите в папку с проектом (где лежит `index.html`):
   ```bash
   cd /path/to/MyRepository
   ```
2. Запустите сервер:
   ```bash
   python3 -m http.server 5173
   ```
3. Откройте в браузере:
   ```
   http://127.0.0.1:5173/index.html
   ```

> Если видите `404` на `/index.html`, значит вы запустили сервер **не** в папке проекта.

## Тесты (Vitest)

```bash
npm install
npm test
```

## E2E тесты (Playwright)

```bash
npm run test:e2e
```

