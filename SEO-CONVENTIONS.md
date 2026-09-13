# SEO / GEO-конвенции проекта «Сайт Дмитрия Ширяева»

Правила для ассистента при любой работе с этим сайтом. Один раз описанное правило не обсуждается заново.

## Домен
- Рабочий домен после деплоя: `https://dmitry-shiryaev.vercel.app` (ЗАГЛУШКА — после реального деплоя заменить везде, где встречается этот URL).
- Места, где он встречается: canonical/og:url, JSON-LD `@id` и `url`, `sitemap.xml`, `Sitemap:` в `robots.txt`.
- Перед деплоем: прогнать поиск по строке `dmitry-shiryaev.vercel.app` и убедиться, что домен актуален.

## Страницы
- `/` — главная, посадочная (лендинг).
- `/about.html` — страница «Обо мне».
- Canonical: относительный (`/`, `/about.html`), при желании можно сделать абсолютным.

## Разметка (JSON-LD)
- Один `@graph` на страницу, узлы связываются через `@id` (Person объединяет WebSite/WebPage/статьи).
- Канонические `@id`: `#website`, `#person`, `#webpage`.
- `Person`: имя, jobTitle «Веб-разработчик (вайб-кодинг)», email, sameAs (max.ru, GitHub), knowsAbout.
- `datePublished` ставится один раз и не меняется. `dateModified` двигается ТОЛЬКО при реальном изменении текста (не вёрстки/мета).
- FAQ не размечается, если на странице нет реальных «вопрос–ответ» (не выдумывать).
- После правок JSON-LD обязательно валидировать (парсер, например `python -c "import json,sys; json.load(open(...))"`).

## robots.txt
- AI-боты разрешены: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended; для всех `Content-Signal: search=yes, ai-input=yes, ai-train=yes`.
- Не закрывать новых AI-ботов без согласования.

## Даты
- Видимая дата «Сайт обновлён DD.MM.YYYY» в футере обеих страниц должна совпадать с `dateModified`.

## IndexNow
- Ключ: файл `<ключ>.txt` в корне, имя = содержимое.
- Порядок: сначала деплой (ключ должен быть доступен по https), потом POST на `api.indexnow.org/IndexNow` скриптом `indexnow-notify.ps1`.
- После деплоя проверить `curl -A "GPTBot"` и `-A "ClaudeBot"` — ответ должен быть 200.

## Что агент вызывает командами, а не словами
- Валидация JSON-LD (парсер).
- Проверка ответов сервера (curl от имени ботов).
- Проверка целостности HTML/CSS/JS (node-скрипт check-site).