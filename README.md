# Nexus CRM — AI-native SaaS Platform

Современная AI-native SaaS CRM-платформа, вдохновленная эстетикой Linear и Vercel, разработанная для малого и среднего бизнеса.

## 🚀 Быстрый старт

Запуск всей платформы (PostgreSQL 16, Redis 7, FastAPI Backend, Next.js 14 Frontend) в одну команду:

```bash
docker compose up --build
```

### Доступ к сервисам:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Base URL**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

---

## 🛠 Технологический стек

### Backend:
- **Python 3.11** + **FastAPI**
- **SQLAlchemy 2.0 (Async)** + **asyncpg**
- **PostgreSQL 16** (база данных)
- **Redis 7** (кэширование и очереди)
- **Pydantic v2** & **Pydantic Settings**
- **JWT Authentication** (python-jose, passlib bcrypt)

### Frontend:
- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** + **Framer Motion**
- **Lucide React** (иконки)
- **Recharts** (интерактивная аналитика)
- **Zustand** (состояние и персистентность)
- **Radix UI** primitives (Tabs, Dialog, Progress, Avatar)

---

## 📦 Модули платформы

1. **Dashboard** (`/`): Сводка выручки, сделок, конверсии, AI-токенов, график продаж и воронка.
2. **Inbox** (`/inbox`): Мультиканальный мессенджер (WhatsApp, Telegram, Instagram, Email, WebChat) с AI-ассистентом.
3. **Контакты** (`/contacts`, `/contacts/[id]`): База контактов и карточка Customer 360 с таймлайном и AI-инсайтами.
4. **Компании** (`/companies`): Реестр юридических лиц, контрагентов и клиентов.
5. **Сделки (Канбан)** (`/deals`): 6-этапная воронка продаж с drag-friendly карточками и показателями конверсии.
6. **Задачи** (`/tasks`): Контроль поручений с фильтрацией по статусам и приоритетам.
7. **Склад** (`/warehouse`): Учет остатков товаров, SKU, резерваций и минимального запаса.
8. **AI Агенты** (`/ai-agents`): Управление автономными агентами (Sales, Support, Analyst, Warehouse).
9. **Аналитика** (`/analytics`): Когортные метрики, графики динамики выручки и воронка продаж.
10. **Биллинг** (`/billing`): Управление тарифным планом Business, лимиты и счета.
11. **Интеграции** (`/integrations`): Подключение мессенджеров, телефонии Zadarma/WebRTC, платежей Kaspi/Stripe.
12. **Команда** (`/team`): Рейтинг менеджеров и выполнение индивидуальных KPI.
13. **Настройки** (`/settings`): Персонализация профиля, компании, уведомлений и безопасности.
14. **Онбординг** (`/onboarding`): 5-шаговый интерактивный мастер запуска AI CRM.
15. **Авторизация** (`/login`): Вход в систему и регистрация.

---

## 🔐 Первый вход и авторизация

Создайте первого администратора через API:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@nexus.crm",
       "password": "SecurePassword2026!",
       "first_name": "Администратор",
       "last_name": "Nexus"
     }'
```

Или авторизуйтесь в интерфейсе [http://localhost:3000/login](http://localhost:3000/login).
