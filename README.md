# ansible-linux-practice

## 🐧 Курс «Грамотная настройка Linux с помощью Ansible»

**▶️ https://ftonita.github.io/ansible-linux-practice/** — главная страница курса со ссылками на обе части.

| Часть | Интерактивная версия | Markdown (1 слайд = 1 файл) |
|---|---|---|
| 🧱 **1. Ansible: кирпичики инфраструктуры** — модули, идемпотентность, handlers, роли, коллекции, IaC (16 слайдов) | [/ansible/](https://ftonita.github.io/ansible-linux-practice/ansible/) | [slides/ansible/](slides/ansible/) |
| 🛡️ **2. Безопасный Linux-сервер** — обновления, sudo-пользователь, SSH-ключи, запрет root и паролей, firewall, fail2ban (8 слайдов) | [/linux/](https://ftonita.github.io/ansible-linux-practice/linux/) | [slides/linux/](slides/linux/) |

### Управление презентацией

| Клавиша | Действие |
|---|---|
| `→` / `Пробел` | далее (на слайдах с кодом — пошаговая подсветка) |
| `←` | назад |
| `F` | полный экран (проектор) |
| `P` | режим докладчика: заметки, следующий слайд, таймер |
| `N` | заметки лектора поверх слайда |
| `M` | список слайдов |
| `V` | часть 2: переключить «Руками ↔ В Ansible» |

Формат 16:9 масштабируется под любой экран. На телефоне вёрстка адаптивная, слайды листаются свайпом.

### Структура репозитория

```text
index.html            # главная страница курса (хаб)
ansible/              # часть 1: index.html (слайды + заметки) и slides.js (интерактив)
linux/                # часть 2: index.html и slides.js
assets/               # общие deck.css (дизайн-система) и deck.js (движок)
.nojekyll             # Pages отдаёт файлы как есть, без Jekyll
slides/ansible/       # Markdown-версии, генерируются из HTML
slides/linux/
tools/build_md.py     # python3 tools/build_md.py  (нужен beautifulsoup4)
```

Контент правится в `ansible/index.html` и `linux/index.html`, после этого Markdown пересобирается командой `python3 tools/build_md.py`.
